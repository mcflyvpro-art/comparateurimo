import type { Json } from "@/lib/supabase/types";

/** Forme attendue de `projects.criteria` (jsonb libre, cf. schéma Plan 1). */
export type ProjectCriteria = {
  budget_max?: number;
  goal?: string;
  target_type?: string;
  zone?: string;
};

export function parseCriteria(criteria: Json): ProjectCriteria {
  if (!criteria || typeof criteria !== "object" || Array.isArray(criteria)) {
    return {};
  }
  return criteria as ProjectCriteria;
}

/** Résumé lisible, ex. "T2/T3 · Lyon · ≤ 250 000 € · Cash-flow ≥ 0 €". Chaîne vide si rien. */
export function formatCriteria(criteria: Json): string {
  const c = parseCriteria(criteria);
  const parts: string[] = [];
  if (c.target_type) parts.push(c.target_type);
  if (c.zone) parts.push(c.zone);
  if (typeof c.budget_max === "number" && c.budget_max > 0) {
    parts.push(`≤ ${c.budget_max.toLocaleString("fr-FR")} €`);
  }
  if (c.goal) parts.push(c.goal);
  return parts.join(" · ");
}
