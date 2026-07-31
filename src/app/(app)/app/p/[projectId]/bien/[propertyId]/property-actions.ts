"use server";

import { revalidatePath } from "next/cache";
import { DEMO_USER_ID, getDemoClient } from "@/lib/supabase/demo";
import type { Database } from "@/lib/supabase/types";

type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

/**
 * MODIFIER UN BIEN.
 *
 * Jusqu'ici la fiche était en lecture seule : une faute de frappe à la création
 * restait pour toujours. C'est le manque le plus grave de l'outil, et tout le
 * reste de l'ergonomie en dépend.
 *
 * Le champ modifiable est validé contre une liste blanche : on n'accepte jamais
 * un nom de colonne venu du client. `id`, `user_id`, `project_id` et `status`
 * n'y figurent pas — le statut a sa propre action, avec son historique.
 */
const CHAMPS_MODIFIABLES = [
  // Localisation
  "address", "address_extra", "city", "postal_code",
  // Caractéristiques
  "property_type", "surface_carrez", "rooms", "bedrooms", "floor", "floors_total",
  "has_elevator", "year_built", "condition", "dpe_letter", "ges_letter",
  "exposure", "has_balcony", "has_terrace", "outdoor_area", "has_parking",
  "has_cave", "furnished",
  // Chiffres
  "asking_price", "works_estimate", "monthly_copro_charges", "property_tax",
  "estimated_rent", "max_price",
  // Contexte
  "discard_reason",
] as const satisfies readonly (keyof PropertyUpdate)[];

export type ChampModifiable = (typeof CHAMPS_MODIFIABLES)[number];

const MODIFIABLES = new Set<string>(CHAMPS_MODIFIABLES);

/** Les champs qui ne peuvent pas être négatifs. Un prix négatif n'existe pas ;
 *  plutôt que de rejeter la saisie, on ramène à zéro et on laisse l'utilisateur
 *  corriger — un formulaire qui refuse sans expliquer est pire qu'une valeur nulle. */
const JAMAIS_NEGATIF = new Set<string>([
  "surface_carrez", "asking_price", "works_estimate", "monthly_copro_charges",
  "property_tax", "estimated_rent", "max_price", "outdoor_area", "rooms", "bedrooms",
]);

export async function updatePropertyField(
  propertyId: string,
  projectId: string,
  champ: ChampModifiable,
  valeur: string | number | boolean | null,
): Promise<{ ancienne: unknown }> {
  if (!MODIFIABLES.has(champ)) {
    throw new Error(`Le champ « ${champ} » n'est pas modifiable.`);
  }

  const supabase = getDemoClient();

  // On relit l'ancienne valeur AVANT d'écrire : c'est ce qui rend l'annulation
  // possible côté interface, sans table d'historique supplémentaire.
  const { data: avant } = await supabase
    .from("properties")
    .select(champ)
    .eq("id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .single();

  let v = valeur;
  if (typeof v === "number" && JAMAIS_NEGATIF.has(champ)) v = Math.max(0, v);
  if (v === "") v = null;

  const { error } = await supabase
    .from("properties")
    .update({ [champ]: v } as PropertyUpdate)
    .eq("id", propertyId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);

  revalidatePath(`/app/p/${projectId}`);
  revalidatePath(`/app/p/${projectId}/bien/${propertyId}`);

  return { ancienne: avant ? (avant as Record<string, unknown>)[champ] : null };
}

/**
 * SUPPRIMER UN BIEN.
 *
 * Destructif et irréversible : les notes, photos, documents et le scénario
 * tombent avec, par cascade. L'interface doit donc demander confirmation ET
 * nommer ce qui disparaît — un « êtes-vous sûr ? » sans inventaire ne prévient
 * de rien.
 */
export async function deleteProperty(propertyId: string, projectId: string): Promise<void> {
  const supabase = getDemoClient();

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
  revalidatePath(`/app/p/${projectId}`);
}

/** Ce qu'un bien perd en cas de suppression — pour que la confirmation soit
 *  honnête au lieu d'être une formalité. */
export async function compterDependances(
  propertyId: string,
): Promise<{ notes: number; photos: number; documents: number }> {
  const supabase = getDemoClient();
  const [notes, photos, documents] = await Promise.all([
    supabase.from("property_notes").select("id", { count: "exact", head: true }).eq("property_id", propertyId),
    supabase.from("property_photos").select("id", { count: "exact", head: true }).eq("property_id", propertyId),
    supabase.from("property_documents").select("id", { count: "exact", head: true }).eq("property_id", propertyId),
  ]);
  return {
    notes: notes.count ?? 0,
    photos: photos.count ?? 0,
    documents: documents.count ?? 0,
  };
}

/**
 * DUPLIQUER UN BIEN.
 *
 * Le geste réel qu'il sert : le même immeuble avec deux lots, ou une annonce
 * qu'on veut retester sous d'autres hypothèses sans perdre la première.
 *
 * On copie le bien et son scénario. On ne copie NI les notes, NI les photos,
 * NI les documents : ce sont des observations faites sur un bien précis, les
 * recopier fabriquerait un faux souvenir. La copie repart à « À analyser ».
 */
export async function duplicateProperty(
  propertyId: string,
  projectId: string,
): Promise<{ id: string }> {
  const supabase = getDemoClient();

  const { data: source, error: erreurLecture } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .single();

  if (erreurLecture || !source) throw new Error(erreurLecture?.message ?? "Bien introuvable.");

  const { id, created_at, updated_at, ...reste } = source;
  void id; void created_at; void updated_at;

  const { data: copie, error: erreurCopie } = await supabase
    .from("properties")
    .insert({
      ...reste,
      address: source.address ? `${source.address} (copie)` : null,
      status: "analyser",
      board_position: Date.now(),
      discard_reason: null,
    })
    .select("id")
    .single();

  if (erreurCopie || !copie) throw new Error(erreurCopie?.message ?? "Duplication impossible.");

  // Le scénario suit le bien : dupliquer sans lui donnerait des chiffres
  // différents pour deux biens identiques, ce qui n'a aucun sens.
  const { data: scenario } = await supabase
    .from("property_scenarios")
    .select("*")
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (scenario) {
    const { id: _id, property_id: _pid, created_at: _c, updated_at: _u, ...champs } = scenario;
    void _id; void _pid; void _c; void _u;
    await supabase.from("property_scenarios").insert({ ...champs, property_id: copie.id });
  }

  revalidatePath(`/app/p/${projectId}`);
  return { id: copie.id };
}
