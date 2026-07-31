"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PropertyCard } from "@/components/app/PropertyCard";
import type { PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";
import { cx } from "@/lib/cx";

/**
 * Colonne du pipeline.
 *
 * En v1, chaque colonne portait une couleur d'étape — six teintes à mémoriser
 * pour une information que le titre donne déjà en toutes lettres. Supprimé : la
 * couleur ne sert plus qu'au verdict, où elle apporte quelque chose.
 *
 * Il reste un titre, un compteur, et une zone de dépôt qui s'allume.
 */
/** Ce qu'une colonne vide attend de vous. Un tiret n'oriente vers rien —
 *  chaque étape a sa propre raison d'être vide, et sa propre sortie. */
const VIDE: Record<PropertyStatus, string> = {
  analyser: "Les biens capturés atterrissent ici.",
  analyse: "Glissez-y un bien dont vous avez lu les chiffres.",
  visite: "Les biens que vous allez voir sur place.",
  nego: "Ceux sur lesquels vous discutez le prix.",
  ecarte: "Ceux que vous avez écartés, avec la raison.",
  offre: "Le bien sur lequel vous vous engagez.",
};

export function PipelineColumn({
  status,
  label,
  properties,
  onOpenProperty,
  onChangeStatus,
}: {
  status: PropertyStatus;
  label: string;
  properties: PipelineProperty[];
  onOpenProperty: (id: string) => void;
  onChangeStatus?: (id: string, status: PropertyStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section className="flex w-[17.5rem] shrink-0 flex-col" aria-label={label}>
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-bg px-0.5 pb-3">
        <h3 className="text-[13px] font-medium text-text-2">{label}</h3>
        <span className="num text-[11px] text-text-4">{properties.length}</span>
        <span className="ml-auto h-px w-full max-w-8 bg-hairline" aria-hidden />
      </header>

      <div
        ref={setNodeRef}
        className={cx(
          "flex min-h-32 flex-1 flex-col gap-2 rounded-md border p-1.5 transition-colors duration-[140ms]",
          isOver ? "border-hairline-ember bg-[var(--brand-wash)]" : "border-transparent",
        )}
      >
        <SortableContext
          items={properties.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onOpen={onOpenProperty}
              onChangeStatus={onChangeStatus}
            />
          ))}
        </SortableContext>

        {properties.length === 0 && (
          <div
            className={cx(
              "flex flex-1 items-center justify-center rounded-md border border-dashed",
              "px-4 py-8 text-center text-[12px] leading-relaxed transition-colors duration-[140ms]",
              isOver ? "border-hairline-ember text-brand" : "border-hairline text-text-4",
            )}
          >
            {isOver ? "Déposer ici" : VIDE[status]}
          </div>
        )}
      </div>
    </section>
  );
}
