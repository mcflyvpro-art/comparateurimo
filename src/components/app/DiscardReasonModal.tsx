"use client";

import { useState } from "react";

/** Modale bloquante affichée quand un bien passe au statut "Écarté" (drag ou dropdown).
 *  Garantit que `discard_reason` n'est jamais vide (décision validée en brainstorm). */
export function DiscardReasonModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-alt p-5">
        <h2 className="font-sans text-base font-medium text-text">Pourquoi écarter ce bien ?</h2>
        <p className="mt-1 text-sm text-muted">
          La raison reste visible sur le bien, utile pour ne pas y revenir plus tard.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex. travaux trop lourds, budget dépassé…"
          rows={3}
          className="mt-3 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-bg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Écarter le bien
          </button>
        </div>
      </div>
    </div>
  );
}
