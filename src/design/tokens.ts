// Estio — design tokens (TS). Miroir de tokens.css.
// Source de vérité : docs/brand/estio-brandkit.md

export const color = {
  craie: "#fbf7f0",
  sable: "#f3ede3",
  sableBord: "#ede4d6",
  encre: "#2b2320",
  encreDouce: "#6b615a",
  encreEstompee: "#75695d",
  argile: "#c86b4a",
  argileFoncee: "#b45c3d",
  ambre: "#e0a06a",
  sauge: "#7fa98c",
  saugeBg: "#e7f0e9",
  saugeTexte: "#3b7a57",
  bleuPoudre: "#9db4c4",
  bleuPoudreBg: "#e6edf1",
  rosePoudre: "#d8a7a0",
  rosePoudreBg: "#f0d9d4",
  blanc: "#ffffff",
} as const;

export const radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 9999 } as const;

// Presets springs Motion (apple-design) : bounce + duration.
// default = critically damped (aucun dépassement) pour l'UI courante.
// momentum = léger rebond, réservé aux interactions à élan (flick, drag release).
export const spring = {
  default: { type: "spring", bounce: 0, duration: 0.35 },
  momentum: { type: "spring", bounce: 0.2, duration: 0.4 },
} as const;

export type ColorToken = keyof typeof color;
