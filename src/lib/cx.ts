/** Concaténation de classes conditionnelles. Aucune dépendance. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
