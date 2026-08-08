export function formatEUR(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function formatPercent(value: number | null, decimals = 1): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals).replace(".", ",")} %`;
}

export function formatM2(value: number | null): string {
  if (value === null) return "—";
  return `${value} m²`;
}

export function formatPricePerM2(price: number | null, surface: number | null): string {
  if (!price || !surface || surface <= 0) return "—";
  return formatEUR(Math.round(price / surface));
}

/** Nombre de jours entiers écoulés depuis une date ISO (toujours ≥ 0). */
export function daysSince(dateISO: string): number {
  const ms = Date.now() - new Date(dateISO).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Prix compact pour les étiquettes d'épingle de carte — arrondi au millier,
 *  jamais de décimales (`250k €`, pas `250,4k €`) : la densité prime quand
 *  plusieurs biens sont proches sur la carte. */
export function formatCompactEUR(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k €`;
  }
  return formatEUR(value);
}
