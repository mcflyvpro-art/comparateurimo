import type { Database } from "@/lib/supabase/types";

export type PropertyStatus = Database["public"]["Enums"]["property_status"];
export type NoteKind = Database["public"]["Enums"]["note_kind"];

export type PipelineNote = {
  id: string;
  kind: NoteKind;
  body: string;
  created_at: string;
};

/** Vue "pipeline" d'un bien : uniquement les champs nécessaires au board + drawer.
 *  Volontairement plus étroit que la table `properties` complète (N1 exhaustif
 *  arrive avec la fiche complète, Plan 5). */
export type PipelineProperty = {
  id: string;
  status: PropertyStatus;
  board_position: number;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  property_type: string | null;
  surface_carrez: number | null;
  asking_price: number | null;
  works_estimate: number;
  estimated_rent: number | null;
  max_price: number | null;
  discard_reason: string | null;
  daysInStatus: number;
  notes: PipelineNote[];
};

export const STATUS_COLUMNS: { key: PropertyStatus; label: string }[] = [
  { key: "analyser", label: "À analyser" },
  { key: "analyse", label: "Analysé" },
  { key: "visite", label: "Visite" },
  { key: "nego", label: "En négo" },
  { key: "ecarte", label: "Écarté" },
  { key: "offre", label: "Offre" },
];
