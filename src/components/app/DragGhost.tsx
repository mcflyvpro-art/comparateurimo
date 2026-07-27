"use client";

import { computeRendementBrutPct } from "@/lib/calc/score";
import { scoreFromRendement } from "@/lib/verdict";
import { formatEUR, formatM2 } from "@/lib/format";
import { VerdictPill } from "@/components/ui/Verdict";
import type { PipelineProperty } from "@/lib/pipeline-types";

/**
 * Fantôme de glissement — la carte qu'on tient réellement dans la main.
 *
 * Détachée du board : légèrement inclinée, décollée par une ombre profonde.
 * Volontairement identique à la carte au repos, en plus contrastée : pendant
 * qu'on vise une colonne, changer la composition de l'objet qu'on déplace est
 * désorientant.
 */
export function DragGhost({ property }: { property: PipelineProperty }) {
  const score = scoreFromRendement(computeRendementBrutPct(property));

  return (
    <div
      className="w-[17.5rem] cursor-grabbing rounded-md border border-hairline-3 bg-high p-3.5"
      style={{
        transform: "rotate(-0.8deg) scale(1.02)",
        boxShadow: "var(--lift-3)",
      }}
    >
      <h3 className="truncate text-[13.5px] font-medium leading-snug text-text">
        {property.address ?? "Adresse non renseignée"}
      </h3>
      <p className="mt-0.5 truncate text-[12px] leading-snug text-text-3">
        {property.city ?? "—"}
      </p>

      <div className="mt-3.5 flex items-baseline justify-between gap-2">
        <span className="num text-[17px] leading-none text-text">
          {formatEUR(property.asking_price)}
        </span>
        <span className="num text-[12px] leading-none text-text-3">
          {formatM2(property.surface_carrez)}
        </span>
      </div>

      <div className="mt-3.5">
        <VerdictPill score={score} />
      </div>
    </div>
  );
}
