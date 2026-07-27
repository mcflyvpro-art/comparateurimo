/**
 * Miroir TypeScript des tokens du système FOCALE.
 *
 * Utilisé partout où le CSS ne peut pas aller : marqueurs MapLibre, uniformes
 * de shader WebGL, presets de ressort Motion. Toute valeur ici DOIT exister à
 * l'identique dans `tokens.css` — c'est le CSS qui fait foi.
 *
 * ⚠ La couleur du VERDICT ne vit pas ici mais dans `lib/verdict.ts` : c'est une
 * décision de produit (comment on parle à l'utilisateur), pas une valeur de
 * design system. Les deux fichiers ne se mélangent jamais.
 */

/* --------------------------------------------------------------------------
 * Couleurs
 * ------------------------------------------------------------------------ */

export const ink = {
  990: "#060505",
  950: "#080706",
  900: "#0b0a09",
  850: "#100e0c",
  800: "#15120f",
  750: "#1b1714",
  700: "#221d19",
  650: "#282219",
  600: "#2c2620",
  500: "#3a322b",
  400: "#4a4038",
} as const;

export const bone = {
  50: "#fdfaf7",
  100: "#f0eae3",
  200: "#d6cdc3",
  300: "#b8ada2",
  400: "#8f857b",
  500: "#6b625a",
} as const;

/** La braise — MARQUE uniquement. Ne dit jamais si un bien est bon. */
export const ember = {
  50: "#1a110c",
  100: "#2a1d16",
  200: "#463229",
  400: "#8c3311",
  600: "#d9490b",
  700: "#ff6a1a",
  800: "#ff8c3d",
  900: "#ffb25c",
} as const;

export const BRAND = ember[700];

/** Le givre — donnée publique. Une mention par section, jamais par chiffre. */
export const frost = {
  100: "#16232b",
  300: "#4a6678",
  500: "#8fb4ca",
} as const;

/* --------------------------------------------------------------------------
 * Le pipeline
 * ------------------------------------------------------------------------ */

/**
 * Les étapes ne sont pas un jugement : un bien « à analyser » n'est pas moins
 * bon qu'un bien « en négo », il est juste plus tôt dans le parcours. On les
 * distingue donc par une montée d'intensité neutre, et la seule couleur
 * signifiante est celle de l'aboutissement.
 */
export const STAGE_COLOR = {
  analyser: bone[500],
  analyse: bone[400],
  visite: bone[300],
  nego: bone[200],
  offre: "#84b394",
  ecarte: "#453b34",
} as const;

/* --------------------------------------------------------------------------
 * Forme & mouvement
 * ------------------------------------------------------------------------ */

export const radius = { xs: 2, sm: 4, md: 6, lg: 10, xl: 14, xxl: 20, pill: 999 } as const;

/** Courbe du calage focal : départ franc, arrivée qui se pose. */
export const EASE_FOCAL = [0.16, 1, 0.3, 1] as const;
/** Réponse d'interface : immédiate, sans dépassement. */
export const EASE_SNAP = [0.2, 0, 0, 1] as const;
/** Va-et-vient symétrique, pour les bascules. */
export const EASE_SWING = [0.65, 0, 0.35, 1] as const;

export const duration = {
  instant: 0.09,
  fast: 0.14,
  base: 0.22,
  slow: 0.42,
  cine: 1.2,
  cineLong: 1.8,
} as const;

export const spring = {
  ui: { type: "spring", bounce: 0, duration: 0.28 },
  grab: { type: "spring", bounce: 0.18, duration: 0.4 },
  sheet: { type: "spring", bounce: 0.04, duration: 0.5 },
} as const;

export const focal = { duration: duration.base, ease: EASE_FOCAL } as const;
export const focalCine = { duration: duration.cine, ease: EASE_FOCAL } as const;
