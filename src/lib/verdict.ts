/**
 * LE VERDICT — couche de présentation.
 *
 * Le moteur de calcul produit un score sur 100 (`lib/calc/`). Ce module ne
 * calcule rien : il traduit ce score en quelque chose qu'un primo-investisseur
 * comprend sans avoir jamais investi.
 *
 * Trois règles tenues partout :
 *   1. Un mot en français avant un chiffre. « Bon dossier », pas « 72 ».
 *   2. Une phrase qui dit QUOI FAIRE. Un verdict qui ne débouche sur aucune
 *      action est une décoration.
 *   3. Trois niveaux, pas quatre. Au-delà, on demande à l'utilisateur de
 *      distinguer « solide » de « correct » — ce que personne ne sait faire.
 */

export type VerdictLevel = "good" | "mid" | "risk" | "none";

export type Verdict = {
  level: VerdictLevel;
  /** Le mot qu'on lit en premier. */
  label: string;
  /** Ce qu'il faut faire, en une phrase. */
  advice: string;
  /** Variable CSS de la couleur — feux adoucis, jamais la braise de marque. */
  color: string;
  wash: string;
};

const VERDICTS: Record<VerdictLevel, Omit<Verdict, "level">> = {
  good: {
    label: "Bon dossier",
    advice:
      "Avec vos hypothèses, ce bien tient la route. Programmez une visite avant qu'un autre ne le fasse.",
    color: "var(--good)",
    wash: "var(--good-soft)",
  },
  mid: {
    label: "À creuser",
    advice:
      "Ni bon ni mauvais en l'état. Comparez-le à vos autres candidats avant d'y consacrer une visite.",
    color: "var(--mid)",
    wash: "var(--mid-soft)",
  },
  risk: {
    label: "Peu favorable",
    advice:
      "En dessous du seuil avec vos hypothèses. Sauf marge de négociation, écartez-le en notant pourquoi.",
    color: "var(--risk)",
    wash: "var(--risk-soft)",
  },
  none: {
    label: "Données incomplètes",
    advice:
      "Il manque une information pour trancher — le plus souvent le loyer estimé ou le prix.",
    color: "var(--none)",
    wash: "transparent",
  },
};

/** Seuils d'affichage. Volontairement peu nombreux et ronds. */
export function verdictFromScore(score: number | null): Verdict {
  if (score === null || Number.isNaN(score)) return { level: "none", ...VERDICTS.none };
  if (score >= 60) return { level: "good", ...VERDICTS.good };
  if (score >= 40) return { level: "mid", ...VERDICTS.mid };
  return { level: "risk", ...VERDICTS.risk };
}

/** Couleur seule — pour MapLibre et les rendus hors React. */
export const VERDICT_HEX: Record<VerdictLevel, string> = {
  good: "#84b394",
  mid: "#d9b678",
  risk: "#c4706a",
  none: "#8a8078",
};

export function verdictHexFromScore(score: number | null): string {
  return VERDICT_HEX[verdictFromScore(score).level];
}

/**
 * Traduit le rendement brut en score d'affichage 0-100.
 *
 * Purement présentationnel : les bornes sont calées sur les seuils métier de
 * `lib/calc/score.ts`, pour que « Bon dossier » à l'œil corresponde bien à
 * « pépite » au calcul.
 *
 *   4 %   → 44  (à creuser)     · seuil « correct »
 *   5,5 % → 61  (bon dossier)   · seuil « solide »
 *   7 %   → 78  (bon dossier)   · seuil « pépite »
 */
export function scoreFromRendement(rendementBrutPct: number | null): number | null {
  if (rendementBrutPct === null || Number.isNaN(rendementBrutPct)) return null;
  return Math.round(Math.min(100, Math.max(0, (rendementBrutPct / 9) * 100)));
}

/** Un bien qui stagne dans son étape mérite un regard. */
export function isStale(daysInStatus: number): boolean {
  return daysInStatus >= 21;
}
