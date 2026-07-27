"use client";

import { useMemo, useState } from "react";
import { computeRendementBrutPct, computeVerdict } from "@/lib/calc/score";
import { usePropertyDrawer } from "@/lib/hooks/use-property-drawer";
import { useLocalStorageSet } from "@/lib/hooks/use-local-storage-set";
import {
  DEFAULT_COLUMN_IDS,
  REQUIRED_COLUMN_ID,
  TABLE_COLUMNS,
  type TableColumn,
  type TableColumnId,
  type TableRow,
} from "@/lib/table-columns";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";
import { PropertyDrawer } from "@/components/app/PropertyDrawer";
import { DiscardReasonModal } from "@/components/app/DiscardReasonModal";
import { Chip } from "@/components/ui/Controls";
import { Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Empty, Notice } from "@/components/ui/Feedback";
import { IconChevronDown, IconTable } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

// Clé versionnée : la sélection de colonnes par défaut a changé, on repart
// proprement plutôt que de restaurer neuf colonnes chez les utilisateurs
// existants.
const COLUMNS_STORAGE_KEY = "estio.table.columns.v2";
const KNOWN_COLUMN_IDS = new Set(TABLE_COLUMNS.map((c) => c.id));

type SortState = { id: TableColumnId; direction: "asc" | "desc" };

function compareRows(
  a: TableRow,
  b: TableRow,
  column: TableColumn,
  direction: "asc" | "desc",
): number {
  const va = column.sortValue(a);
  const vb = column.sortValue(b);
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  const cmp =
    typeof va === "number" && typeof vb === "number"
      ? va - vb
      : String(va).localeCompare(String(vb), "fr");
  return direction === "asc" ? cmp : -cmp;
}

/**
 * Vue tableau.
 *
 * Six colonnes par défaut, une barre d'outils qui tient sur une ligne, aucune
 * ligne zébrée, aucune bordure verticale : un filet horizontal suffit, et la
 * ligne survolée s'éclaire.
 */
export function PropertyTable({
  projectId,
  initialProperties,
  urlState,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
  /** Paramètres d'URL lus côté serveur — jamais `useSearchParams()` ici. */
  urlState: { view?: string; bien?: string };
}) {
  const {
    properties,
    selectedProperty,
    error,
    pendingDiscard,
    openDrawer,
    closeDrawer,
    handleStatusChange,
    handleAddNote,
    confirmDiscard,
    cancelDiscard,
  } = usePropertyDrawer(projectId, initialProperties, urlState);

  const [statusFilter, setStatusFilter] = useState<Set<PropertyStatus>>(new Set());
  const [sort, setSort] = useState<SortState>({ id: "verdict", direction: "desc" });
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [storedColumnIds, setStoredColumnIds] = useLocalStorageSet(
    COLUMNS_STORAGE_KEY,
    DEFAULT_COLUMN_IDS,
  );

  const selectedColumnIds = useMemo(() => {
    const valid = new Set(
      Array.from(storedColumnIds).filter((id): id is TableColumnId =>
        KNOWN_COLUMN_IDS.has(id as TableColumnId),
      ),
    );
    valid.add(REQUIRED_COLUMN_ID);
    return valid;
  }, [storedColumnIds]);

  const visibleColumns = useMemo(
    () => TABLE_COLUMNS.filter((c) => selectedColumnIds.has(c.id)),
    [selectedColumnIds],
  );

  const rows = useMemo<TableRow[]>(() => {
    const filtered =
      statusFilter.size === 0
        ? properties
        : properties.filter((p) => statusFilter.has(p.status));
    return filtered.map((property) => {
      const rendement = computeRendementBrutPct(property);
      return { property, rendement, verdict: computeVerdict(rendement) };
    });
  }, [properties, statusFilter]);

  const sortedRows = useMemo(() => {
    const column = TABLE_COLUMNS.find((c) => c.id === sort.id) ?? TABLE_COLUMNS[0];
    return [...rows].sort((a, b) => compareRows(a, b, column, sort.direction));
  }, [rows, sort]);

  const countByStatus = useMemo(() => {
    const map = new Map<PropertyStatus, number>();
    for (const p of properties) map.set(p.status, (map.get(p.status) ?? 0) + 1);
    return map;
  }, [properties]);

  function toggleSort(id: TableColumnId) {
    setSort((prev) =>
      prev.id === id
        ? { id, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { id, direction: "desc" },
    );
  }

  function toggleStatusChip(status: PropertyStatus) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function toggleColumn(id: TableColumnId) {
    if (id === REQUIRED_COLUMN_ID) return;
    const next = new Set(storedColumnIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setStoredColumnIds(next);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {error && (
        <Notice tone="danger" className="mx-5 mt-4">
          {error}
        </Notice>
      )}

      <div className="flex flex-wrap items-center gap-1.5 border-b border-hairline px-5 py-3">
        {STATUS_COLUMNS.map((s) => {
          const n = countByStatus.get(s.key) ?? 0;
          if (n === 0 && !statusFilter.has(s.key)) return null;
          return (
            <Chip
              key={s.key}
              active={statusFilter.has(s.key)}
              onClick={() => toggleStatusChip(s.key)}
            >
              {s.label}
              <span className="num ml-0.5 text-[11px] opacity-55">{n}</span>
            </Chip>
          );
        })}

        {statusFilter.size > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter(new Set())}
            className="ml-1 text-[12px] text-text-4 underline-offset-4 transition-colors hover:text-text-2 hover:underline"
          >
            tout afficher
          </button>
        )}

        <div className="relative ml-auto flex items-center gap-3">
          <span className="num text-[12px] text-text-4">
            {sortedRows.length} bien{sortedRows.length > 1 ? "s" : ""}
          </span>
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setColumnsMenuOpen((v) => !v)}
            trailing={<IconChevronDown size={13} />}
          >
            Colonnes
          </Button>

          {columnsMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setColumnsMenuOpen(false)} />
              <div className="focal-in absolute right-0 top-full z-30 mt-2 w-64 rounded-md border border-hairline-2 bg-high p-4 shadow-[var(--lift-3)]">
                <p className="mb-3.5 text-[12px] font-medium text-text-2">
                  Colonnes affichées
                </p>
                <div className="flex flex-col gap-3">
                  {TABLE_COLUMNS.map((c) => (
                    <Checkbox
                      key={c.id}
                      label={c.label}
                      checked={selectedColumnIds.has(c.id)}
                      disabled={c.id === REQUIRED_COLUMN_ID}
                      onChange={() => toggleColumn(c.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {properties.length === 0 ? (
        <Empty
          icon={<IconTable size={20} />}
          title="Aucun bien dans ce projet"
          body="Le tableau se remplira dès la première annonce capturée."
          className="flex-1"
        />
      ) : sortedRows.length === 0 ? (
        <Empty
          title="Aucun bien pour ce filtre"
          body="Retirez une étape pour élargir la sélection."
          action={
            <Button variant="outline" size="sm" onClick={() => setStatusFilter(new Set())}>
              Tout afficher
            </Button>
          }
          className="flex-1"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-bg">
              <tr>
                {visibleColumns.map((c) => {
                  const isSorted = sort.id === c.id;
                  return (
                    <th
                      key={c.id}
                      style={{ width: c.width }}
                      className={cx(
                        "border-b border-hairline-2 px-3 py-3 font-normal",
                        c.align === "right" ? "text-right" : "text-left",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(c.id)}
                        className={cx(
                          "inline-flex items-center gap-1 text-[12px] transition-colors",
                          isSorted ? "text-text" : "text-text-3 hover:text-text-2",
                        )}
                      >
                        {c.label}
                        <span
                          className={cx(
                            "transition-[opacity,transform] duration-[140ms]",
                            isSorted ? "opacity-100" : "opacity-0",
                            isSorted && sort.direction === "asc" && "rotate-180",
                          )}
                        >
                          <IconChevronDown size={11} />
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.property.id}
                  onClick={() => openDrawer(row.property.id)}
                  className="group cursor-pointer border-b border-hairline transition-colors duration-[140ms] hover:bg-raised"
                >
                  {visibleColumns.map((c, i) => (
                    <td
                      key={c.id}
                      style={{ width: c.width }}
                      className={cx(
                        "relative max-w-0 px-3 py-3",
                        c.align === "right" ? "text-right" : "text-left",
                      )}
                    >
                      {i === 0 && (
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-brand transition-transform duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
                        />
                      )}
                      <span
                        className={cx(
                          "flex min-w-0 items-center",
                          c.align === "right" ? "justify-end" : "justify-start",
                        )}
                      >
                        {c.render(row)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PropertyDrawer
        property={selectedProperty}
        projectId={projectId}
        onClose={closeDrawer}
        onStatusChange={handleStatusChange}
        onAddNote={handleAddNote}
      />

      <DiscardReasonModal
        open={Boolean(pendingDiscard)}
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </div>
  );
}
