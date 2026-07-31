"use server";

import { revalidatePath } from "next/cache";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import type { Json } from "@/lib/supabase/types";

/**
 * GÉRER UN PROJET.
 *
 * Un projet ne pouvait jusqu'ici être que créé : ni renommé, ni archivé, ni
 * supprimé. La colonne `archived` existait en base sans qu'aucune interface ne
 * puisse l'écrire — l'outil savait ranger des projets, pas les tenir à jour.
 */

export async function renameProject(
  projectId: string,
  nom: string,
): Promise<{ ancien: string }> {
  const propre = nom.trim();
  if (!propre) throw new Error("Le nom du projet ne peut pas être vide.");

  const supabase = getDemoClient();

  // On relit avant d'écrire : c'est ce qui rend l'annulation possible.
  const { data: avant } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .single();

  const { error } = await supabase
    .from("projects")
    .update({ name: propre })
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);

  revalidatePath("/app/projects");
  revalidatePath(`/app/p/${projectId}`);
  return { ancien: avant?.name ?? "" };
}

/**
 * Les critères de recherche du projet — budget et objectif.
 * Stockés en `jsonb` : on relit l'existant et on fusionne, pour ne jamais
 * écraser une clé qu'une version future aurait ajoutée.
 */
export async function updateProjectCriteria(
  projectId: string,
  patch: { budget_max?: number | null; goal?: string | null },
): Promise<void> {
  const supabase = getDemoClient();

  const { data: avant } = await supabase
    .from("projects")
    .select("criteria")
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .single();

  const actuels =
    avant?.criteria && typeof avant.criteria === "object" && !Array.isArray(avant.criteria)
      ? (avant.criteria as Record<string, Json>)
      : {};

  const fusion: Record<string, Json> = { ...actuels };
  for (const [cle, valeur] of Object.entries(patch)) {
    if (valeur === null || valeur === "") delete fusion[cle];
    else fusion[cle] = valeur as Json;
  }

  const { error } = await supabase
    .from("projects")
    .update({ criteria: fusion as Json })
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);

  revalidatePath("/app/projects");
  revalidatePath(`/app/p/${projectId}`);
}

/**
 * ARCHIVER — la sortie réversible.
 *
 * C'est ce qu'on veut dans 90 % des cas où l'on croit vouloir supprimer :
 * l'achat est fait, ou la recherche est en pause. Le projet sort de la liste
 * active sans rien perdre, et revient d'un clic.
 */
export async function setProjectArchived(
  projectId: string,
  archived: boolean,
): Promise<void> {
  const supabase = getDemoClient();

  const { error } = await supabase
    .from("projects")
    .update({ archived })
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
  revalidatePath("/app/projects");
}

/** Ce qu'un projet emporte avec lui — pour que la confirmation soit honnête. */
export async function compterContenuProjet(
  projectId: string,
): Promise<{ biens: number; notes: number }> {
  const supabase = getDemoClient();

  const { data: biens } = await supabase
    .from("properties")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", DEMO_USER_ID);

  const ids = (biens ?? []).map((b) => b.id);
  let notes = 0;
  if (ids.length > 0) {
    const { count } = await supabase
      .from("property_notes")
      .select("id", { count: "exact", head: true })
      .in("property_id", ids);
    notes = count ?? 0;
  }

  return { biens: ids.length, notes };
}

/**
 * SUPPRIMER — destructif et sans retour.
 *
 * Tous les biens du projet tombent en cascade, avec leurs notes, photos,
 * documents et scénarios. L'interface exige donc de retaper le nom du projet :
 * un bouton rouge se clique par réflexe, un nom se tape en conscience.
 */
export async function deleteProject(
  projectId: string,
  nomConfirme: string,
): Promise<void> {
  const supabase = getDemoClient();

  const { data: projet } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .single();

  if (!projet) throw new Error("Projet introuvable.");

  // Le garde-fou vit AUSSI côté serveur : une confirmation qui n'existe que
  // dans l'interface n'est pas une confirmation.
  if (nomConfirme.trim() !== projet.name.trim()) {
    throw new Error("Le nom saisi ne correspond pas au projet.");
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
  revalidatePath("/app/projects");
}
