import type { Verdict } from "@/lib/calc/score";

export type ScoreBreakdown = {
  scoreSur100: number;
  rendementScore: number;
  cashflowScore: number;
  longTermeScore: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Normalise une valeur sur 0-100 entre `min` (→0) et `max` (→100), clampée
 *  aux deux bouts. `null` (donnée insuffisante) retombe sur 50 — neutre, ni
 *  bonus ni pénalité, en attendant que le bien ait assez de données. */
function normalize(value: number | null, min: number, max: number): number {
  if (value === null) return 50;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/**
 * Score /100 automatique, fonction du bien + du scénario en cours d'édition
 * (recalculé à chaque changement de curseur ⑦). Combine 3 sous-notes
 * pondérées :
 * - Rendement (40%) : rendement net-net %, 0% → 0, 8% → 100.
 * - Cash-flow (35%) : cash-on-cash %, -5% → 0, 15% → 100.
 * - Long terme (25%) : TRI %, 0% → 0, 12% → 100.
 * Formule fixe, pas de pondération pilotée par l'utilisateur — les profils
 * de priorité (Rentabilité/Patrimoine/Sécurité/Équilibré) arrivent avec
 * l'arbitrage (Plan 7).
 */
export function computeScoreSur100(input: {
  rendementNetNetPct: number | null;
  cashOnCashPct: number | null;
  triPct: number | null;
}): ScoreBreakdown {
  const rendementScore = normalize(input.rendementNetNetPct, 0, 8);
  const cashflowScore = normalize(input.cashOnCashPct, -5, 15);
  const longTermeScore = normalize(input.triPct, 0, 12);
  const scoreSur100 = Math.round(rendementScore * 0.4 + cashflowScore * 0.35 + longTermeScore * 0.25);
  return {
    scoreSur100,
    rendementScore: Math.round(rendementScore),
    cashflowScore: Math.round(cashflowScore),
    longTermeScore: Math.round(longTermeScore),
  };
}

/** Seuils fixes : ≥75 pépite, 55-74 solide, 35-54 correct, <35 à éviter. */
export function computeVerdictFromScore(scoreSur100: number): Verdict {
  if (scoreSur100 >= 75) return "pepite";
  if (scoreSur100 >= 55) return "solide";
  if (scoreSur100 >= 35) return "correct";
  return "a_eviter";
}
