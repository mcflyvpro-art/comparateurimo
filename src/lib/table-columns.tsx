import type { ReactNode } from "react";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";
import type { Verdict } from "@/lib/calc/score";
import { formatEUR, formatM2, formatPercent, formatPricePerM2 } from "@/lib/format";
import { VerdictBadge } from "@/components/app/VerdictBadge";

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
  /** Valeur comparable pour le tri. `null` = toujours trié en dernier, quel que soit le sens. */
  sortValue: (row: TableRow) => string | number | null;
  render: (row: TableRow) => ReactNode;
};

const STATUS_LABEL = Object.fromEntries(
  STATUS_COLUMNS.map((c) => [c.key, c.label]),
) as Record<PropertyStatus, string>;

const VERDICT_ORDER: Record<Verdict, number> = {
  pepite: 4,
  solide: 3,
  correct: 2,
  a_eviter: 1,
};

export const TABLE_COLUMNS: TableColumn[] = [
  {
    id: "address",
    label: "Adresse",
    sortValue: (r) => r.property.address,
    render: (r) => r.property.address ?? "Adresse non renseignée",
  },
  {
    id: "city",
    label: "Ville",
    sortValue: (r) => r.property.city,
    render: (r) => r.property.city ?? "—",
  },
  {
    id: "postal_code",
    label: "Code postal",
    sortValue: (r) => r.property.postal_code,
    render: (r) => r.property.postal_code ?? "—",
  },
  {
    id: "property_type",
    label: "Type de bien",
    sortValue: (r) => r.property.property_type,
    render: (r) => r.property.property_type ?? "—",
  },
  {
    id: "status",
    label: "Statut",
    sortValue: (r) => STATUS_LABEL[r.property.status],
    render: (r) => STATUS_LABEL[r.property.status],
  },
  {
    id: "asking_price",
    label: "Prix",
    sortValue: (r) => r.property.asking_price,
    render: (r) => formatEUR(r.property.asking_price),
  },
  {
    id: "surface_carrez",
    label: "Surface",
    sortValue: (r) => r.property.surface_carrez,
    render: (r) => formatM2(r.property.surface_carrez),
  },
  {
    id: "price_per_m2",
    label: "Prix / m²",
    sortValue: (r) =>
      r.property.asking_price && r.property.surface_carrez && r.property.surface_carrez > 0
        ? r.property.asking_price / r.property.surface_carrez
        : null,
    render: (r) => formatPricePerM2(r.property.asking_price, r.property.surface_carrez),
  },
  {
    id: "estimated_rent",
    label: "Loyer estimé",
    sortValue: (r) => r.property.estimated_rent,
    render: (r) => formatEUR(r.property.estimated_rent),
  },
  {
    id: "rendement",
    label: "Rendement brut",
    sortValue: (r) => r.rendement,
    render: (r) => formatPercent(r.rendement),
  },
  {
    id: "verdict",
    label: "Verdict",
    sortValue: (r) => VERDICT_ORDER[r.verdict],
    render: (r) => <VerdictBadge verdict={r.verdict} />,
  },
  {
    id: "max_price",
    label: "Prix max",
    sortValue: (r) => r.property.max_price,
    render: (r) => formatEUR(r.property.max_price),
  },
  {
    id: "daysInStatus",
    label: "Jours dans statut",
    sortValue: (r) => r.property.daysInStatus,
    render: (r) => `${r.property.daysInStatus} j`,
  },
];

export const DEFAULT_COLUMN_IDS: TableColumnId[] = [
  "address",
  "city",
  "status",
  "asking_price",
  "surface_carrez",
  "rendement",
  "verdict",
  "daysInStatus",
];

export const REQUIRED_COLUMN_ID: TableColumnId = "address";
