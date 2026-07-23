"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Petit "?" cliquable (fait main, pas de lib) qui affiche une explication
 *  au survol/clic — utilisé sur chaque donnée complexe de la fiche. */
export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Explication"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] font-medium text-faint transition-colors hover:border-brand hover:text-brand"
      >
        ?
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-bg-alt p-3 text-xs leading-relaxed text-muted shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
