export type MockMarketData = {
  pricePerM2DVF: number;
  rentPerM2: number;
  tensionLocative: "faible" | "moyenne" | "forte";
  vacancyPct: number;
  riskLevel: "faible" | "modere" | "eleve";
  demographicTrend: "declin" | "stable" | "croissance";
};

/** Hash FNV-1a — déterministe, stable, aucune dépendance. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Génère des valeurs de marché (N2) plausibles et STABLES à partir de
 * l'adresse/code INSEE du bien — aucune vraie donnée DVF/loyers/tension pour
 * l'instant (le vrai piochage N2 est une étape ultérieure de la roadmap,
 * hors-scope de ce build). Même interface que prendra le vrai N2 : seule
 * cette implémentation interne sera remplacée le moment venu.
 */
export function computeMockMarketData(inseeCode: string | null, address: string | null): MockMarketData {
  const key = inseeCode || address || "estio-defaut";
  const hash = hashString(key);

  const pricePerM2DVF = 1800 + (hash % 6200); // 1800 → 8000 €/m²
  const rentPerM2 = 9 + ((hash >> 4) % 16); // 9 → 25 €/m²
  const tensionLocative = (["faible", "moyenne", "forte"] as const)[(hash >> 8) % 3];
  const vacancyPct = 2 + ((hash >> 12) % 10); // 2 → 12 %
  const riskLevel = (["faible", "modere", "eleve"] as const)[(hash >> 16) % 3];
  const demographicTrend = (["declin", "stable", "croissance"] as const)[(hash >> 20) % 3];

  return { pricePerM2DVF, rentPerM2, tensionLocative, vacancyPct, riskLevel, demographicTrend };
}
