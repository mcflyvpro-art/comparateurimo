"use client";

import { useState, useTransition } from "react";
import { computeRendementBrutPct, computeVerdict } from "@/lib/calc/score";
import { formatEUR, formatM2, formatPercent, formatPricePerM2 } from "@/lib/format";
import { VerdictBadge } from "@/components/app/VerdictBadge";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

export function PropertyDrawer({
  property,
  onClose,
  onStatusChange,
  onAddNote,
}: {
  property: PipelineProperty;
  onClose: () => void;
  onStatusChange: (status: PropertyStatus) => void;
  onAddNote: (body: string) => Promise<void>;
}) {
  const [noteBody, setNoteBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const rendement = computeRendementBrutPct(property);
  const verdict = computeVerdict(rendement);

  function handleAddNote() {
    const trimmed = noteBody.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await onAddNote(trimmed);
      setNoteBody("");
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-bg-alt p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-medium text-text">
              {property.address ?? "Adresse non renseignée"}
            </h2>
            <p className="text-sm text-muted">{property.city ?? "—"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full border border-border px-2.5 py-1 text-sm text-muted transition-colors hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <VerdictBadge verdict={verdict} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <Metric label="Prix" value={formatEUR(property.asking_price)} />
          <Metric label="Surface" value={formatM2(property.surface_carrez)} />
          <Metric label="Rendement brut" value={formatPercent(rendement)} />
          <Metric
            label="Prix / m²"
            value={formatPricePerM2(property.asking_price, property.surface_carrez)}
          />
        </dl>

        <div className="mt-6">
          <label htmlFor="status" className="mb-1.5 block text-xs text-muted">
            Statut
          </label>
          <select
            id="status"
            value={property.status}
            onChange={(e) => onStatusChange(e.target.value as PropertyStatus)}
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none focus:border-brand"
          >
            {STATUS_COLUMNS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          {property.status === "ecarte" && property.discard_reason && (
            <p className="mt-2 text-sm text-faint">Raison : {property.discard_reason}</p>
          )}
        </div>

        <div className="mt-6 flex-1">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-faint">Notes</h3>
          <ul className="space-y-2">
            {property.notes.length === 0 && (
              <li className="text-sm text-faint">Aucune note pour l&apos;instant.</li>
            )}
            {property.notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-border bg-bg p-3 text-sm text-text">
                {note.body}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex gap-2">
            <input
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Ajouter une note…"
              className="flex-1 rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
            />
            <button
              type="button"
              disabled={isPending || !noteBody.trim()}
              onClick={handleAddNote}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-bg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ajouter
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled
          title="Arrive au Plan 5 (Fiche complète)"
          className="mt-6 w-full rounded-full border border-border py-2.5 text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Analyse complète →
        </button>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
