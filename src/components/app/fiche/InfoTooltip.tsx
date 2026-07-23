"use client";

import { useState } from "react";

/** Petit "?" cliquable (fait main, pas de lib) qui affiche une explication
 *  au survol/clic — utilisé sur chaque donnée complexe de la fiche. */
export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Explication"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] font-medium text-faint transition-colors hover:border-brand hover:text-brand"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-bg-alt p-3 text-xs leading-relaxed text-muted shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
