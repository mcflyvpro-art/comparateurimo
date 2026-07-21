export type Verdict = "pepite" | "solide" | "correct" | "a_eviter";

type ScoreInput = {
  asking_price: number | null;
  works_estimate: number;
  estimated_rent: number | null;
};

const VERDICT_LABELS: Record<Verdict, string> = {
  pepite: "Pépite",
  solide: "Solide",
  correct: "Correct",
  a_eviter: "À éviter",
};

/**
 * Rendement brut annuel = (loyer estimé × 12) / (prix + travaux), en %.
 * Formule provisoire mono-critère (Plan 3) — le vrai scoring pondéré
 * multi-critères arrive avec les profils de priorité (Plan 7).
 * Retourne `null` si les données sont insuffisantes (jamais 0 ou NaN).
 */
export function computeRendementBrutPct(input: ScoreInput): number | null {
  const price = input.asking_price;
  const rent = input.estimated_rent;
  if (!price || price <= 0 || !rent || rent <= 0) return null;
  const totalCost = price + (input.works_estimate ?? 0);
  if (totalCost <= 0) return null;
  return (rent * 12 * 100) / totalCost;
}

/**
 * Seuils provisoires (mono-critère, à affiner avec le vrai scoring).
 * `null` (données insuffisantes) retombe sur "correct" par défaut :
 * état neutre, ni positif ni négatif, en attendant les chiffres.
 */
export function computeVerdict(rendementBrutPct: number | null): Verdict {
  if (rendementBrutPct === null) return "correct";
  if (rendementBrutPct >= 7) return "pepite";
  if (rendementBrutPct >= 5.5) return "solide";
  if (rendementBrutPct >= 4) return "correct";
  return "a_eviter";
}

export function verdictLabel(verdict: Verdict): string {
  return VERDICT_LABELS[verdict];
}
