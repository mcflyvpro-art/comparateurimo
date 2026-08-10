/**
 * Préférences d'affichage — thème et densité.
 *
 * Elles vivent dans `localStorage` et se traduisent en attributs sur <html>,
 * lus par `tokens.css`. Aucun état React : le thème doit être posé AVANT la
 * première peinture, ce qu'un composant client ne peut pas faire.
 */

export type Theme = "light" | "dark" | "system";
export type Density = "confortable" | "compact";

export const THEME_STORAGE_KEY = "estio.theme";
export const DENSITY_STORAGE_KEY = "estio.density";

const THEMES: readonly Theme[] = ["light", "dark", "system"];
const DENSITES: readonly Density[] = ["confortable", "compact"];

/** Le thème réellement appliqué, une fois « système » résolu. */
export function resoudreTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function lireTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const brut = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(brut as Theme) ? (brut as Theme) : "light";
}

export function ecrireTheme(theme: Theme): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.dataset.theme = resoudreTheme(theme);
}

export function lireDensite(): Density {
  if (typeof window === "undefined") return "confortable";
  const brut = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return DENSITES.includes(brut as Density) ? (brut as Density) : "confortable";
}

export function ecrireDensite(densite: Density): void {
  window.localStorage.setItem(DENSITY_STORAGE_KEY, densite);
  document.documentElement.dataset.density = densite;
}

/** Repose les deux attributs depuis le stockage. Utile après une hydratation. */
export function appliquerPreferences(): void {
  document.documentElement.dataset.theme = resoudreTheme(lireTheme());
  document.documentElement.dataset.density = lireDensite();
}
