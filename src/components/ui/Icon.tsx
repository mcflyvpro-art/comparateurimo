import type { SVGProps } from "react";

/**
 * Jeu d'icônes maison — aucune dépendance.
 *
 * Grammaire : grille 24, trait 1.5, extrémités rondes, géométrie optique.
 * Le vocabulaire emprunte à l'instrument de mesure (diaphragme, réticule,
 * graduation, plan focal) plutôt qu'au pictogramme d'application générique.
 * Tout hérite de `currentColor` et se dimensionne par `size`.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* --- Optique — le vocabulaire propre à Estio ----------------------------- */

/** Diaphragme : la marque en pictogramme, l'ouverture qui laisse passer. */
export const IconAperture = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v7.2M20.8 8.2l-6.9 2.5M18.4 19.1l-4.2-5.9M5.6 19.1l4.2-5.9M3.2 8.2l6.9 2.5" />
  </Svg>
);

/** Réticule : le plan de netteté, la mise au point. */
export const IconFocus = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2v3.2M12 18.8V22M2 12h3.2M18.8 12H22" />
    <path d="M4.6 4.6l2.3 2.3M17.1 17.1l2.3 2.3M19.4 4.6l-2.3 2.3M6.9 17.1l-2.3 2.3" opacity=".4" />
  </Svg>
);

/** Braise : l'incandescence, le score qui chauffe. */
export const IconEmber = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3c.6 3 2.2 4 3.6 5.5A6.8 6.8 0 0 1 18 13a6 6 0 1 1-12 0c0-2 .8-3.4 1.8-4.6" />
    <path d="M12 20a2.8 2.8 0 0 0 2.8-2.8c0-1.6-1.4-2.4-2.8-4.2-1.4 1.8-2.8 2.6-2.8 4.2A2.8 2.8 0 0 0 12 20Z" />
  </Svg>
);

/** Graduation : la mesure, l'échelle réglée. */
export const IconGauge = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 17a9 9 0 1 1 17 0" />
    <path d="M12 17l4.2-4.6" />
    <path d="M3.5 17h1.8M18.7 17h1.8M5.4 9.6l1.3 1.2M18.6 9.6l-1.3 1.2M12 6.2V8" opacity=".55" />
  </Svg>
);

/* --- Navigation ---------------------------------------------------------- */

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9l7 7 7-7" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L21 21" />
  </Svg>
);

/* --- Objets du produit --------------------------------------------------- */

export const IconBoard = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 4.5h5v15h-5zM9.75 4.5h5v10h-5zM16 4.5h4.5v6.5H16z" />
  </Svg>
);

export const IconTable = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="M3.5 9.5h17M9.5 9.5v10M3.5 14.5h17" />
  </Svg>
);

export const IconMap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4.2L3.5 6.6v13.2L9 17.4l6 2.4 5.5-2.4V4.2L15 6.6z" />
    <path d="M9 4.2v13.2M15 6.6v13.2" />
  </Svg>
);

export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);

export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5L3.5 8 12 12.5 20.5 8z" />
    <path d="M3.5 13L12 17.5 20.5 13" opacity=".5" />
  </Svg>
);

export const IconNote = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 3.5h9.5L19 8v12.5H5z" />
    <path d="M14.5 3.5V8H19M8.5 12.5h7M8.5 16h4.5" />
  </Svg>
);

export const IconPhoto = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M4 17l4.8-4.4 3.4 3 3-2.4 4.3 3.8" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 6.5h15M9.5 6.5V4.8h5v1.7M6.5 6.5l1 13h9l1-13" />
  </Svg>
);

export const IconDrag = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="6" r=".9" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r=".9" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r=".9" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r=".9" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r=".9" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r=".9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4.5h5.5V10M19.5 4.5L11 13" />
    <path d="M18 14.5v4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5v11M7.5 10.5L12 15l4.5-4.5" />
    <path d="M4.5 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
  </Svg>
);

export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 15.5v-11M7.5 8.5L12 4l4.5 4.5" />
    <path d="M4.5 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.9v.6" />
  </Svg>
);

export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11.5a8 8 0 1 0-1.6 5.8" />
    <path d="M20.5 5.5V11h-5.5" />
  </Svg>
);

export const IconSpark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5l1.9 5.4 5.6 1.6-5.6 1.7L12 17.6l-1.9-5.4-5.6-1.7 5.6-1.6z" />
  </Svg>
);

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="M4 7l8 5.5L20 7" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.75" />
    <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
  </Svg>
);

export const IconArchive = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="4" rx="1" />
    <path d="M5.2 8.5v10a1.5 1.5 0 0 0 1.5 1.5h10.6a1.5 1.5 0 0 0 1.5-1.5v-10" />
    <path d="M10 12.5h4" />
  </Svg>
);
