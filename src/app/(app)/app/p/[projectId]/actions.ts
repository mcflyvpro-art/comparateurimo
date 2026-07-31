"use server";

import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import type { NoteKind, PropertyStatus } from "@/lib/pipeline-types";

export async function moveProperty(input: {
  projectId: string;
  propertyId: string;
  fromStatus: PropertyStatus;
  toStatus: PropertyStatus;
  newPosition: number;
  discardReason?: string;
}): Promise<void> {
  const { projectId, propertyId, fromStatus, toStatus, newPosition, discardReason } = input;
  const supabase = getDemoClient();

  const update: {
    status: PropertyStatus;
    board_position: number;
    discard_reason?: string | null;
  } = {
    status: toStatus,
    board_position: newPosition,
  };
  if (toStatus === "ecarte") {
    update.discard_reason = discardReason ?? null;
  } else if (fromStatus === "ecarte") {
    update.discard_reason = null;
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update(update)
    .eq("id", propertyId)
    .eq("project_id", projectId)
    .eq("user_id", DEMO_USER_ID);

  if (updateError) throw new Error(updateError.message);

  const { error: historyError } = await supabase.from("status_history").insert({
    property_id: propertyId,
    user_id: DEMO_USER_ID,
    from_status: fromStatus,
    to_status: toStatus,
    reason: toStatus === "ecarte" ? (discardReason ?? null) : null,
  });

  if (historyError) throw new Error(historyError.message);
}

export async function addQuickNote(
  propertyId: string,
  body: string,
  kind: NoteKind = "note",
): Promise<{ id: string; created_at: string }> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("La note est vide.");

  const supabase = getDemoClient();
  const { data, error } = await supabase
    .from("property_notes")
    .insert({ property_id: propertyId, user_id: DEMO_USER_ID, kind, body: trimmed })
    .select("id, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Ajout de la note impossible.");
  return data;
}

/**
 * Modifier une note.
 *
 * Une note se corrige : on note dans une cage d'escalier, en sortant d'une
 * visite, souvent mal. Renvoie l'ancien texte pour rendre l'annulation possible.
 */
export async function updateNote(
  noteId: string,
  body: string,
): Promise<{ ancien: string }> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("La note ne peut pas être vide.");

  const supabase = getDemoClient();

  const { data: avant } = await supabase
    .from("property_notes")
    .select("body")
    .eq("id", noteId)
    .eq("user_id", DEMO_USER_ID)
    .single();

  const { error } = await supabase
    .from("property_notes")
    .update({ body: trimmed })
    .eq("id", noteId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
  return { ancien: avant?.body ?? "" };
}

/**
 * Le type d'une note — note, visite, ou négociation.
 *
 * L'énuméré `note_kind` existait en base depuis le début sans qu'aucune
 * interface ne l'expose : toutes les notes naissaient « note ». C'est pourtant
 * ce qui distingue « le voisin est bruyant » de « il descend à 240 000 ».
 */
export async function setNoteKind(noteId: string, kind: NoteKind): Promise<void> {
  const supabase = getDemoClient();
  const { error } = await supabase
    .from("property_notes")
    .update({ kind })
    .eq("id", noteId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
}

/** Supprimer une note. Rend son contenu pour permettre de la recréer si on
 *  annule — c'est plus honnête qu'une corbeille invisible. */
export async function deleteNote(
  noteId: string,
): Promise<{ body: string; kind: NoteKind; propertyId: string }> {
  const supabase = getDemoClient();

  const { data: avant } = await supabase
    .from("property_notes")
    .select("body, kind, property_id")
    .eq("id", noteId)
    .eq("user_id", DEMO_USER_ID)
    .single();

  const { error } = await supabase
    .from("property_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);

  return {
    body: avant?.body ?? "",
    kind: (avant?.kind ?? "note") as NoteKind,
    propertyId: avant?.property_id ?? "",
  };
}
