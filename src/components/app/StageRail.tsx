"use client";

import type { PropertyStatus } from "@/lib/pipeline-types";
import { cx } from "@/lib/cx";

/**
 * Rail d'avancement.
 *
 * Le board présente six colonnes parce que « Écarté » est un endroit où poser
 * un bien. Mais dans la fiche, écarter n'est pas une étape de progression :
 * c'est une sortie de route. On sépare donc les deux.
 *
 * La couleur ici est celle de la MARQUE, pas d'un verdict : passer en visite
 * n'est pas « bien », c'est un état. Confondre les deux registres était l'un
 * des défauts de la v1.
 */

const PROGRESSION: { key: PropertyStatus; label: string }[] = [
  { key: "analyser", label: "À analyser" },
  { key: "analyse", label: "Analysé" },
  { key: "visite", label: "Visite" },
  { key: "nego", label: "Négo" },
  { key: "offre", label: "Offre" },
];

export function StageRail({
  status,
  onChange,
  disabled = false,
}: {
  status: PropertyStatus;
  onChange: (status: PropertyStatus) => void;
  disabled?: boolean;
}) {
  const isDiscarded = status === "ecarte";
  const currentIndex = PROGRESSION.findIndex((s) => s.key === status);

  return (
    <div>
      <div className="relative flex items-start justify-between">
        <span
          aria-hidden
          className="absolute left-[7px] right-[7px] top-[7px] h-px bg-line"
        />
        {currentIndex > 0 && (
          <span
            aria-hidden
            className="absolute left-[7px] top-[7px] h-px bg-accent/60 transition-[width] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: `calc((100% - 14px) * ${(currentIndex / (PROGRESSION.length - 1)).toFixed(4)})`,
              opacity: isDiscarded ? 0.25 : 1,
            }}
          />
        )}

        {PROGRESSION.map((stage, i) => {
          const isCurrent = stage.key === status;
          const isPast = currentIndex >= 0 && i < currentIndex;

          return (
            <button
              key={stage.key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(stage.key)}
              aria-current={isCurrent ? "step" : undefined}
              className="group relative z-10 flex flex-1 flex-col items-center gap-2 disabled:cursor-not-allowed"
            >
              <span
                className={cx(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-all duration-[220ms]",
                  isCurrent
                    ? "scale-110 border-transparent bg-accent shadow-[0_0_0_3px_var(--accent-line)]"
                    : isPast
                      ? "border-transparent bg-accent/45"
                      : "border-line-strong bg-canvas group-hover:border-text-3",
                )}
              >
                {isCurrent && <span className="h-1 w-1 rounded-full bg-[var(--ink-fg)]" />}
              </span>
              <span
                className={cx(
                  "text-[11.5px] leading-none transition-colors",
                  isCurrent ? "font-medium text-text" : "text-text-4 group-hover:text-text-2",
                )}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>

      {isDiscarded && (
        <p className="mt-4 rounded-sm border border-line px-3 py-2 text-[12px] leading-relaxed text-text-3">
          Ce bien est écarté. Cliquez une étape pour le réintégrer au parcours.
        </p>
      )}
    </div>
  );
}
