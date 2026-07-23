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

const COLUMNS_STORAGE_KEY = "estio.table.columns";
const KNOWN_COLUMN_IDS = new Set(TABLE_COLUMNS.map((c) => c.id));

type SortState = { id: TableColumnId; direction: "asc" | "desc" };

function compareRows(a: TableRow, b: TableRow, column: TableColumn, direction: "asc" | "desc"): number {
  const va = column.sortValue(a);
  const vb = column.sortValue(b);
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  const cmp =
    typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "fr");
  return direction === "asc" ? cmp : -cmp;
}

export function PropertyTable({
  projectId,
  initialProperties,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
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
  } = usePropertyDrawer(projectId, initialProperties);

  const [statusFilter, setStatusFilter] = useState<Set<PropertyStatus>>(new Set());
  const [sort, setSort] = useState<SortState>({ id: "daysInStatus", direction: "desc" });
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [storedColumnIds, setStoredColumnIds] = useLocalStorageSet(COLUMNS_STORAGE_KEY, DEFAULT_COLUMN_IDS);

  const selectedColumnIds = useMemo(() => {
    const valid = new Set(
      Array.from(storedColumnIds).filter((id): id is TableColumnId => KNOWN_COLUMN_IDS.has(id as TableColumnId)),
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
      statusFilter.size === 0 ? properties : properties.filter((p) => statusFilter.has(p.status));
    return filtered.map((property) => {
      const rendement = computeRendementBrutPct(property);
      return { property, rendement, verdict: computeVerdict(rendement) };
    });
  }, [properties, statusFilter]);

  const sortedRows = useMemo(() => {
    const column = TABLE_COLUMNS.find((c) => c.id === sort.id) ?? TABLE_COLUMNS[0];
    return [...rows].sort((a, b) => compareRows(a, b, column, sort.direction));
  }, [rows, sort]);

  function toggleSort(id: TableColumnId) {
    setSort((prev) => (prev.id === id ? { id, direction: prev.direction === "asc" ? "desc" : "asc" } : { id, direction: "asc" }));
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
    <div className="flex flex-1 flex-col">
      {error && (
        <div className="mx-6 mt-3 rounded-xl border border-score-low/40 bg-score-low/10 px-4 py-2 text-sm text-score-low">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-6 py-4">
        {STATUS_COLUMNS.map((s) => {
          const active = statusFilter.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleStatusChip(s.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "border-brand bg-brand text-bg" : "border-border text-muted hover:text-text"
              }`}
            >
              {s.label}
            </button>
          );
        })}

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setColumnsMenuOpen((v) => !v)}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-text"
          >
            Colonnes
          </button>
          {columnsMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setColumnsMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-border bg-bg-alt p-3 shadow-lg">
                {TABLE_COLUMNS.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text hover:bg-bg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumnIds.has(c.id)}
                      disabled={c.id === REQUIRED_COLUMN_ID}
                      onChange={() => toggleColumn(c.id)}
                      className="accent-brand"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {properties.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted">Aucun bien dans ce projet.</p>
      ) : sortedRows.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted">Aucun bien pour ce filtre.</p>
      ) : (
        <div className="flex-1 overflow-auto px-6 pb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {visibleColumns.map((c) => (
                  <th key={c.id} className="px-3 py-2 font-normal">
                    <button
                      type="button"
                      onClick={() => toggleSort(c.id)}
                      className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-text"
                    >
                      {c.label}
                      {sort.id === c.id && <span>{sort.direction === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.property.id}
                  onClick={() => openDrawer(row.property.id)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-bg-alt"
                >
                  {visibleColumns.map((c) => (
                    <td key={c.id} className="px-3 py-2.5 text-text">
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProperty && (
        <PropertyDrawer
          property={selectedProperty}
          projectId={projectId}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}

      {pendingDiscard && <DiscardReasonModal onCancel={cancelDiscard} onConfirm={confirmDiscard} />}
    </div>
  );
}
