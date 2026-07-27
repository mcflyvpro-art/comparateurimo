"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { computeRendementBrutPct } from "@/lib/calc/score";
import { scoreFromRendement, isStale } from "@/lib/verdict";
import { formatEUR, formatM2 } from "@/lib/format";
import { VerdictPill } from "@/components/ui/Verdict";
import { IconNote } from "@/components/ui/Icon";
import type { PipelineProperty } from "@/lib/pipeline-types";
import { cx } from "@/lib/cx";

/**
 * Carte de bien.
 *
 * En v1 elle portait neuf données sur 280 pixels : adresse, ville, prix,
 * surface, prix au m², barre de score, rendement, jours, notes, prix maximum.
 * Illisible d'un coup d'œil, donc inutile sur un board de vingt biens.
 *
 * Quatre informations suffisent à décider si l'on ouvre : OÙ, COMBIEN, QUELLE
 * TAILLE, ÇA VAUT LE COUP OU PAS. Tout le reste est dans le panneau, à un clic.
 *
 * Deux exceptions tolérées, parce qu'elles portent une action :
 *   — le compteur de jours, affiché uniquement quand le bien stagne ;
 *   — le témoin de notes, qui signale qu'il y a du contexte à relire.
 */
export function PropertyCard({
  property,
  onOpen,
}: {
  property: PipelineProperty;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: property.id });

  const score = scoreFromRendement(computeRendementBrutPct(property));
  const stale = isStale(property.daysInStatus);

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(property.id)}
      className={cx(
        "group cursor-grab select-none rounded-md border border-hairline bg-surface p-3.5",
        "transition-[border-color,background-color] duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:border-hairline-3 hover:bg-raised active:cursor-grabbing",
        isDragging && "shadow-[var(--lift-3)]",
      )}
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

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <VerdictPill score={score} />

        <span className="flex shrink-0 items-center gap-2.5">
          {stale && (
            <span
              className="num text-[11px] text-mid"
              title="Ce bien n'a pas bougé depuis trois semaines"
            >
              {property.daysInStatus} j
            </span>
          )}
          {property.notes.length > 0 && (
            <span
              className="flex items-center gap-1 text-text-4"
              title={`${property.notes.length} note${property.notes.length > 1 ? "s" : ""}`}
            >
              <IconNote size={12} />
              <span className="num text-[11px]">{property.notes.length}</span>
            </span>
          )}
        </span>
      </div>
    </article>
  );
}
