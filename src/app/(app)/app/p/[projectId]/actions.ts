"use server";

import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import type { PropertyStatus } from "@/lib/pipeline-types";

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
): Promise<{ id: string; created_at: string }> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("La note est vide.");

  const supabase = getDemoClient();
  const { data, error } = await supabase
    .from("property_notes")
    .insert({ property_id: propertyId, user_id: DEMO_USER_ID, kind: "note", body: trimmed })
    .select("id, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Ajout de la note impossible.");
  return data;
}
