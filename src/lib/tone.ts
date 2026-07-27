/**
 * TEINTES SÉMANTIQUES — la couleur au service de la lecture.
 *
 * Règle unique : une valeur n'est colorée que si elle porte un JUGEMENT que
 * l'utilisateur comprendrait sans nous. Un prix n'a pas de couleur (245 000 €
 * n'est ni bon ni mauvais dans l'absolu) ; une trésorerie mensuelle, si —
 * positive c'est bien, très négative c'est un problème.
 *
 * Toutes les teintes viennent des trois feux adoucis du système. Aucune couleur
 * n'est inventée ici, et la braise de marque n'apparaît jamais : elle est
 * réservée aux actions.
 */

export const GOOD = "var(--good)";
export const MID = "var(--mid)";
export const RISK = "var(--risk)";
export const NEUTRAL = undefined;

/**
 * Échelle générique : au-dessus de `good` c'est bon, en dessous de `risk` c'est
 * mauvais, entre les deux c'est à surveiller. `invert` pour les grandeurs où
 * petit vaut mieux que grand (vacance locative, écart de prix…).
 */
export function tone(
  value: number | null | undefined,
  seuils: { good: number; risk: number },
  invert = false,
): string | undefined {
  if (value === null || value === undefined || Number.isNaN(value)) return NEUTRAL;
  const v = invert ? -value : value;
  const good = invert ? -seuils.good : seuils.good;
  const risk = invert ? -seuils.risk : seuils.risk;
  if (v >= good) return GOOD;
  if (v <= risk) return RISK;
  return MID;
}

/* --------------------------------------------------------------------------
 * Raccourcis métier — les seuils sont écrits une fois, ici.
 * ------------------------------------------------------------------------ */

/** Trésorerie mensuelle : à l'équilibre c'est bien, −200 €/mois ça pique. */
export const toneCashflow = (v: number | null | undefined) =>
  tone(v, { good: 0, risk: -200 });

/** Rendement brut : seuils calés sur ceux du moteur de calcul. */
export const toneRendementBrut = (v: number | null | undefined) =>
  tone(v, { good: 5.5, risk: 3.5 });

/** Rendement net ou après impôt : mêmes seuils, décalés d'environ deux points. */
export const toneRendementNet = (v: number | null | undefined) =>
  tone(v, { good: 3.5, risk: 1.5 });

/** Effort d'épargne : zéro ou moins signifie que le bien s'autofinance. */
export const toneEffort = (v: number | null | undefined) =>
  tone(v, { good: 0, risk: 250 }, true);

/** Écart au prix du secteur : en dessous du marché c'est une bonne nouvelle. */
export const toneEcartPrix = (pctAuDessus: number | null | undefined) =>
  tone(pctAuDessus, { good: -5, risk: 10 }, true);

/** Tension locative — vue du bailleur : tendu signifie qu'on reloue vite. */
export function toneTension(t: "faible" | "moyenne" | "forte"): string | undefined {
  return t === "forte" ? GOOD : t === "moyenne" ? MID : RISK;
}

/** Vacance locative : plus elle est basse, mieux c'est. */
export const toneVacance = (pct: number | null | undefined) =>
  tone(pct, { good: 4, risk: 9 }, true);

/**
 * Diagnostic de performance énergétique.
 *
 * L'échelle officielle française est déjà un dégradé vert → rouge que tout le
 * monde a vu sur une étiquette de réfrigérateur. On la reprend, désaturée pour
 * tenir sur l'encre. Ce n'est pas de l'ornement : F et G sont progressivement
 * interdits à la location, la couleur signale un vrai risque.
 */
export const DPE_COLOR: Record<string, string> = {
  A: "#4fa06f",
  B: "#6faf58",
  C: "#97bc45",
  D: "#d9b678",
  E: "#dd9a52",
  F: "#d17a4a",
  G: "#c4706a",
};

export function toneDpe(letter: string | null | undefined): string | undefined {
  if (!letter) return NEUTRAL;
  return DPE_COLOR[letter.trim().toUpperCase()] ?? NEUTRAL;
}
