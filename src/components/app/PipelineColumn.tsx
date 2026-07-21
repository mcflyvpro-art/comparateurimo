"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PropertyCard } from "@/components/app/PropertyCard";
import type { PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";

export function PipelineColumn({
  status,
  label,
  properties,
  onOpenProperty,
}: {
  status: PropertyStatus;
  label: string;
  properties: PipelineProperty[];
  onOpenProperty: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h3 className="text-sm font-medium text-text">{label}</h3>
        <span className="text-xs text-faint">{properties.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-1 flex-col gap-2.5 rounded-2xl p-2 transition-colors ${
          isOver ? "bg-bg-alt" : ""
        }`}
      >
        <SortableContext items={properties.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} onOpen={onOpenProperty} />
          ))}
        </SortableContext>
        {properties.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-faint">Aucun bien ici.</p>
        )}
      </div>
    </div>
  );
}
