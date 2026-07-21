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
