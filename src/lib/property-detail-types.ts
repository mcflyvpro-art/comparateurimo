import type { Database } from "@/lib/supabase/types";

export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyScenarioRow = Database["public"]["Tables"]["property_scenarios"]["Row"];
export type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];

export type PropertyDetailNote = {
  id: string;
  kind: Database["public"]["Enums"]["note_kind"];
  body: string;
  created_at: string;
};

export type PropertyDetailPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
};

export type PropertyDetailDocument = {
  id: string;
  storage_path: string;
  filename: string;
  doc_type: string;
};

/**
 * Vue complète d'un bien pour la fiche d'analyse (Plan 5a) : tout le N1
 * (`properties`), son scénario N3 associé (`property_scenarios`, relation
 * 1-1), son contact, ses notes, et les photos/documents — ces deux derniers
 * restent des tableaux vides tant que le Plan 5c (upload) n'est pas fait ;
 * le type existe déjà en entier pour ne pas le retoucher à ce moment-là.
 */
export type PropertyDetail = {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
  contact: ContactRow | null;
  notes: PropertyDetailNote[];
  photos: PropertyDetailPhoto[];
  documents: PropertyDetailDocument[];
};
