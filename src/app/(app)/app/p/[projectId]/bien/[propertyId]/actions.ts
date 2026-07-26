"use server";

import { DEMO_USER_ID, getDemoClient } from "@/lib/supabase/demo";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";
import { MAX_FILE_SIZE_BYTES, MAX_PHOTOS_PER_PROPERTY, isAcceptedPhotoType } from "@/lib/file-limits";

export type ScenarioPatch = Partial<
  Pick<
    PropertyScenarioRow,
    | "apport_pct"
    | "interest_rate"
    | "duration_years"
    | "loan_type"
    | "insurance_rate"
    | "insurance_on_initial"
    | "notary_fees_pct"
    | "dossier_fees"
    | "guarantee_fees"
    | "broker_fees"
    | "deferral_months"
    | "tax_regime"
    | "tmi_pct"
    | "management_fees_pct"
    | "gli"
    | "pno"
    | "vacancy_pct"
    | "works_provision"
    | "horizon_years"
    | "market_scenario"
  >
>;

/** Bornes de clamp défensif — mêmes valeurs que les curseurs côté UI
 *  (`SectionScenario`). Un patch hors bornes est clampé silencieusement,
 *  jamais rejeté (un slider qui pousse une valeur limite ne doit jamais
 *  faire échouer la sauvegarde). */
const CLAMP_RANGES: Partial<Record<keyof ScenarioPatch, [number, number]>> = {
  apport_pct: [0, 100],
  interest_rate: [0, 8],
  duration_years: [5, 30],
  insurance_rate: [0, 1.5],
  notary_fees_pct: [2, 10],
  dossier_fees: [0, Number.MAX_SAFE_INTEGER],
  guarantee_fees: [0, Number.MAX_SAFE_INTEGER],
  broker_fees: [0, Number.MAX_SAFE_INTEGER],
  deferral_months: [0, 24],
  tmi_pct: [0, 45],
  management_fees_pct: [0, 12],
  vacancy_pct: [0, 20],
  works_provision: [0, Number.MAX_SAFE_INTEGER],
  horizon_years: [5, 30],
};

function clampPatch(patch: ScenarioPatch): ScenarioPatch {
  const clamped: Record<string, unknown> = { ...patch };
  for (const [key, range] of Object.entries(CLAMP_RANGES)) {
    if (!range) continue;
    const value = clamped[key];
    if (typeof value === "number") {
      const [min, max] = range;
      clamped[key] = Math.min(max, Math.max(min, value));
    }
  }
  return clamped as ScenarioPatch;
}

/** Sauvegarde partielle du scénario (N3) d'un bien — appelée en debounce
 *  depuis le panneau de curseurs (⑦, Plan 5b). Filtre `property_id` +
 *  `user_id`, défense en profondeur (RLS contournée par le client démo —
 *  même précaution que Plan 5a). */
export async function updatePropertyScenario(propertyId: string, patch: ScenarioPatch): Promise<void> {
  const supabase = getDemoClient();
  const clamped = clampPatch(patch);

  const { error } = await supabase
    .from("property_scenarios")
    .update(clamped)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
}

export type UploadedPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
};

/** Upload une photo dans le bucket `property-photos` puis crée la ligne
 *  `property_photos` correspondante. Revalide taille/type côté serveur —
 *  jamais confiance au client, même si le fichier est déjà compressé par
 *  `useFileUpload` — et le plafond de `MAX_PHOTOS_PER_PROPERTY`. */
export async function uploadPropertyPhoto(propertyId: string, formData: FormData): Promise<UploadedPhoto> {
  const supabase = getDemoClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();
  if (!property) throw new Error("Bien introuvable.");

  const { count } = await supabase
    .from("property_photos")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if ((count ?? 0) >= MAX_PHOTOS_PER_PROPERTY) {
    throw new Error(`Limite de ${MAX_PHOTOS_PER_PROPERTY} photos atteinte pour ce bien.`);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Fichier manquant.");
  if (!isAcceptedPhotoType(file.type)) {
    throw new Error("Format de photo non supporté (JPG, PNG ou WEBP uniquement).");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("Photo trop volumineuse (8 Mo maximum).");

  const { data: maxRow } = await supabase
    .from("property_photos")
    .select("sort_order")
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

  const storagePath = `${DEMO_USER_ID}/${propertyId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("property-photos")
    .upload(storagePath, file, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { data: inserted, error: insertError } = await supabase
    .from("property_photos")
    .insert({
      property_id: propertyId,
      user_id: DEMO_USER_ID,
      storage_path: storagePath,
      sort_order: nextSortOrder,
    })
    .select("id, storage_path, caption, sort_order")
    .single();
  if (insertError || !inserted) throw new Error(insertError?.message ?? "Échec de l'enregistrement de la photo.");

  return inserted;
}

/** Supprime le fichier du bucket PUIS la ligne DB (dans cet ordre : si la
 *  ligne DB était supprimée en premier et la suppression du fichier
 *  échouait, on se retrouverait avec un fichier orphelin invisible et
 *  jamais nettoyé). */
export async function deletePropertyPhoto(propertyId: string, photoId: string, storagePath: string): Promise<void> {
  const supabase = getDemoClient();

  const { error: storageError } = await supabase.storage.from("property-photos").remove([storagePath]);
  if (storageError) throw new Error(storageError.message);

  const { error: deleteError } = await supabase
    .from("property_photos")
    .delete()
    .eq("id", photoId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (deleteError) throw new Error(deleteError.message);
}

export async function updatePhotoCaption(photoId: string, propertyId: string, caption: string): Promise<void> {
  const supabase = getDemoClient();
  const trimmed = caption.trim();
  const { error } = await supabase
    .from("property_photos")
    .update({ caption: trimmed.length > 0 ? trimmed : null })
    .eq("id", photoId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (error) throw new Error(error.message);
}

/** Met à jour la `sort_order` d'UNE SEULE photo (fractional indexing déjà
 *  calculé côté client via `computeDropPosition` — voir `PhotoGrid`, même
 *  principe que `moveProperty`/le board Kanban : un seul élément déplacé,
 *  les autres jamais touchés). */
export async function reorderPropertyPhoto(propertyId: string, photoId: string, newSortOrder: number): Promise<void> {
  const supabase = getDemoClient();
  const { error } = await supabase
    .from("property_photos")
    .update({ sort_order: newSortOrder })
    .eq("id", photoId)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);
  if (error) throw new Error(error.message);
}
