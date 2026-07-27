import type { ReactNode } from "react";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";
import type { Verdict } from "@/lib/calc/score";
import { formatEUR, formatM2, formatPercent, formatPricePerM2 } from "@/lib/format";
import { scoreFromRendement, isStale } from "@/lib/verdict";
import { toneRendementBrut } from "@/lib/tone";
import { VerdictPill } from "@/components/ui/Verdict";

/**
 * Colonnes du tableau.
 *
 * Deux règles de composition, tenues sans exception :
 *   — tout nombre est en chasses fixes et aligné à droite, pour se lire
 *     verticalement d'un seul balayage ;
 *   — tout texte est aligné à gauche et tronqué proprement.
 *
 * Six colonnes par défaut, pas neuf. Les sept autres restent disponibles dans
 * le menu « Colonnes » — un tableau qu'on ne peut pas embrasser du regard ne
 * sert à rien.
 */

export type TableRow = {
  property: PipelineProperty;
  rendement: number | null;
  verdict: Verdict;
};

export type TableColumnId =
  | "address"
  | "city"
  | "postal_code"
  | "property_type"
  | "status"
  | "asking_price"
  | "surface_carrez"
  | "price_per_m2"
  | "estimated_rent"
  | "rendement"
  | "verdict"
  | "max_price"
  | "daysInStatus";

export type TableColumn = {
  id: TableColumnId;
  label: string;
  align?: "left" | "right";
  width?: string;
  sortValue: (row: TableRow) => string | number | null;
  render: (row: TableRow) => ReactNode;
};

const STATUS_LABEL = Object.fromEntries(
  STATUS_COLUMNS.map((c) => [c.key, c.label]),
) as Record<PropertyStatus, string>;

const STATUS_ORDER = Object.fromEntries(
  STATUS_COLUMNS.map((c, i) => [c.key, i]),
) as Record<PropertyStatus, number>;

const VERDICT_ORDER: Record<Verdict, number> = {
  pepite: 4,
  solide: 3,
  correct: 2,
  a_eviter: 1,
};

function Num({ children, dim = false }: { children: ReactNode; dim?: boolean }) {
  return (
    <span className={`num text-[13px] ${dim ? "text-text-3" : "text-text"}`}>{children}</span>
  );
}

function Text({ children, dim = false }: { children: ReactNode; dim?: boolean }) {
  return (
    <span className={`truncate text-[13px] ${dim ? "text-text-3" : "text-text"}`}>
      {children}
    </span>
  );
}

export const TABLE_COLUMNS: TableColumn[] = [
  {
    id: "address",
    label: "Adresse",
    width: "20rem",
    sortValue: (r) => r.property.address,
    render: (r) => <Text>{r.property.address ?? "Adresse non renseignée"}</Text>,
  },
  {
    id: "city",
    label: "Ville",
    width: "10rem",
    sortValue: (r) => r.property.city,
    render: (r) => <Text dim>{r.property.city ?? "—"}</Text>,
  },
  {
    id: "postal_code",
    label: "Code postal",
    align: "right",
    width: "7rem",
    sortValue: (r) => r.property.postal_code,
    render: (r) => <Num dim>{r.property.postal_code ?? "—"}</Num>,
  },
  {
    id: "property_type",
    label: "Type",
    width: "7rem",
    sortValue: (r) => r.property.property_type,
    render: (r) => <Text dim>{r.property.property_type ?? "—"}</Text>,
  },
  {
    id: "status",
    label: "Étape",
    width: "8.5rem",
    sortValue: (r) => STATUS_ORDER[r.property.status],
    render: (r) => <Text dim>{STATUS_LABEL[r.property.status]}</Text>,
  },
  {
    id: "asking_price",
    label: "Prix",
    align: "right",
    width: "8.5rem",
    sortValue: (r) => r.property.asking_price,
    render: (r) => <Num>{formatEUR(r.property.asking_price)}</Num>,
  },
  {
    id: "surface_carrez",
    label: "Surface",
    align: "right",
    width: "6.5rem",
    sortValue: (r) => r.property.surface_carrez,
    render: (r) => <Num dim>{formatM2(r.property.surface_carrez)}</Num>,
  },
  {
    id: "price_per_m2",
    label: "Prix au m²",
    align: "right",
    width: "7.5rem",
    sortValue: (r) =>
      r.property.asking_price && r.property.surface_carrez && r.property.surface_carrez > 0
        ? r.property.asking_price / r.property.surface_carrez
        : null,
    render: (r) => (
      <Num dim>{formatPricePerM2(r.property.asking_price, r.property.surface_carrez)}</Num>
    ),
  },
  {
    id: "estimated_rent",
    label: "Loyer estimé",
    align: "right",
    width: "7.5rem",
    sortValue: (r) => r.property.estimated_rent,
    render: (r) => <Num dim>{formatEUR(r.property.estimated_rent)}</Num>,
  },
  {
    id: "rendement",
    label: "Rendement brut",
    align: "right",
    width: "8.5rem",
    sortValue: (r) => r.rendement,
    render: (r) => (
      <span className="num text-[13px]" style={{ color: toneRendementBrut(r.rendement) }}>
        {formatPercent(r.rendement)}
      </span>
    ),
  },
  {
    id: "verdict",
    label: "Verdict",
    width: "10rem",
    sortValue: (r) => VERDICT_ORDER[r.verdict],
    render: (r) => <VerdictPill score={scoreFromRendement(r.rendement)} />,
  },
  {
    id: "max_price",
    label: "Prix maximum",
    align: "right",
    width: "8rem",
    sortValue: (r) => r.property.max_price,
    render: (r) => <Num dim>{formatEUR(r.property.max_price)}</Num>,
  },
  {
    id: "daysInStatus",
    label: "Jours sur l'étape",
    align: "right",
    width: "8rem",
    sortValue: (r) => r.property.daysInStatus,
    render: (r) => (
      <span
        className={`num text-[13px] ${isStale(r.property.daysInStatus) ? "text-mid" : "text-text-3"}`}
        title={
          isStale(r.property.daysInStatus)
            ? "Ce bien n'a pas bougé depuis trois semaines"
            : undefined
        }
      >
        {r.property.daysInStatus}
      </span>
    ),
  },
];

/** Six colonnes : ce qu'on peut embrasser du regard sur un écran d'ordinateur. */
export const DEFAULT_COLUMN_IDS: TableColumnId[] = [
  "address",
  "city",
  "status",
  "asking_price",
  "surface_carrez",
  "verdict",
];

export const REQUIRED_COLUMN_ID: TableColumnId = "address";
