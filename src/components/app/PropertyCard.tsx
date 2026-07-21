"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { computeRendementBrutPct, computeVerdict } from "@/lib/calc/score";
import { formatEUR, formatM2 } from "@/lib/format";
import { VerdictBadge } from "@/components/app/VerdictBadge";
import type { PipelineProperty } from "@/lib/pipeline-types";

/** Fallback illustré quand aucune photo n'est disponible (aucun upload avant le Plan 5). */
function TypeThumbnail({ propertyType }: { propertyType: string | null }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg text-xs font-medium text-muted">
      {propertyType ?? "—"}
    </div>
  );
}

export function PropertyCard({
  property,
  onOpen,
}: {
  property: PipelineProperty;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: property.id,
  });

  const rendement = computeRendementBrutPct(property);
  const verdict = computeVerdict(rendement);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(property.id)}
      className="cursor-grab rounded-2xl border border-border bg-bg-alt p-3.5 transition-colors hover:border-border-strong active:cursor-grabbing"
    >
      <div className="flex gap-3">
        <TypeThumbnail propertyType={property.property_type} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">
            {property.address ?? "Adresse non renseignée"}
          </p>
          <p className="truncate text-xs text-muted">{property.city ?? "—"}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-text">
        <span>{formatEUR(property.asking_price)}</span>
        <span className="text-muted">{formatM2(property.surface_carrez)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <VerdictBadge verdict={verdict} />
        <span className="text-xs text-faint">{property.daysInStatus} j</span>
      </div>
    </div>
  );
}
