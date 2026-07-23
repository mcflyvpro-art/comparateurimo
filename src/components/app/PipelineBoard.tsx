"use client";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { PipelineColumn } from "@/components/app/PipelineColumn";
import { PropertyDrawer } from "@/components/app/PropertyDrawer";
import { DiscardReasonModal } from "@/components/app/DiscardReasonModal";
import { usePropertyDrawer } from "@/lib/hooks/use-property-drawer";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

/** Retrouve le statut (donc la colonne) qui contient `propertyId`, à partir du
 *  regroupement exposé par `usePropertyDrawer`. Utilisé par `handleDragEnd`
 *  quand on dépose une carte sur une autre carte plutôt que sur une colonne vide. */
function findPropertyStatus(
  columns: Map<PropertyStatus, PipelineProperty[]>,
  propertyId: string,
): PropertyStatus | null {
  for (const [status, list] of columns) {
    if (list.some((p) => p.id === propertyId)) return status;
  }
  return null;
}

export function PipelineBoard({
  projectId,
  initialProperties,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
}) {
  const {
    columns,
    selectedProperty,
    error,
    pendingDiscard,
    openDrawer,
    closeDrawer,
    performMove,
    handleStatusChange,
    handleAddNote,
    confirmDiscard,
    cancelDiscard,
  } = usePropertyDrawer(projectId, initialProperties);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const propertyId = String(active.id);
    const overId = String(over.id);
    const isColumnId = STATUS_COLUMNS.some((c) => c.key === overId);

    if (isColumnId) {
      const toStatus = overId as PropertyStatus;
      performMove(propertyId, toStatus, (columns.get(toStatus) ?? []).length);
      return;
    }

    const toStatus = findPropertyStatus(columns, overId);
    if (!toStatus) return;
    const destIndex = (columns.get(toStatus) ?? []).findIndex((p) => p.id === overId);
    performMove(propertyId, toStatus, destIndex);
  }

  return (
    <div className="flex flex-1 flex-col">
      {error && (
        <div className="mx-6 mt-3 rounded-xl border border-score-low/40 bg-score-low/10 px-4 py-2 text-sm text-score-low">
          {error}
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto px-6 py-5">
          {STATUS_COLUMNS.map((col) => (
            <PipelineColumn
              key={col.key}
              status={col.key}
              label={col.label}
              properties={columns.get(col.key) ?? []}
              onOpenProperty={openDrawer}
            />
          ))}
        </div>
      </DndContext>

      {selectedProperty && (
        <PropertyDrawer
          property={selectedProperty}
          projectId={projectId}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}

      {pendingDiscard && (
        <DiscardReasonModal onCancel={cancelDiscard} onConfirm={confirmDiscard} />
      )}
    </div>
  );
}
