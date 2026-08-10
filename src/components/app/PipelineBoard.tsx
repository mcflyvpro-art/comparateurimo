"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { PipelineColumn } from "@/components/app/PipelineColumn";
import { PropertyDrawer } from "@/components/app/PropertyDrawer";
import { DiscardReasonModal } from "@/components/app/DiscardReasonModal";
import { DragGhost } from "@/components/app/DragGhost";
import { Empty, Notice } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { IconBoard, IconPlus } from "@/components/ui/Icon";
import { usePropertyDrawer } from "@/lib/hooks/use-property-drawer";
import {
  STATUS_COLUMNS,
  type PipelineProperty,
  type PropertyStatus,
} from "@/lib/pipeline-types";

/** Retrouve la colonne qui contient `propertyId` (dépôt sur une carte). */
function findPropertyStatus(
  columns: Map<PropertyStatus, PipelineProperty[]>,
  propertyId: string,
): PropertyStatus | null {
  for (const [status, list] of columns) {
    if (list.some((p) => p.id === propertyId)) return status;
  }
  return null;
}

/**
 * Le board — le cœur de la douve.
 *
 * Six étapes, de gauche (froid) à droite (incandescent). Pendant le glissement,
 * la carte d'origine s'efface et un fantôme suit le curseur, légèrement incliné
 * et détaché : on tient physiquement l'objet, on ne le pousse pas.
 */
export function PipelineBoard({
  projectId,
  initialProperties,
  urlState,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
  /** Paramètres d'URL lus côté serveur — jamais `useSearchParams()` ici. */
  urlState: { view?: string; bien?: string };
}) {
  const {
    columns,
    properties,
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
  } = usePropertyDrawer(projectId, initialProperties, urlState);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const dragged = draggingId ? properties.find((p) => p.id === draggingId) : null;

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
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
    <div className="flex min-h-0 flex-1 flex-col">
      {error && (
        <Notice tone="danger" className="mx-5 mt-4">
          {error}
        </Notice>
      )}

      {properties.length === 0 ? (
        <Empty
          icon={<IconBoard size={20} />}
          title="Le pipeline est vide"
          body="Capturez une annonce — capture d'écran, PDF d'agence, message de mandataire — et elle atterrira ici avec son pré-verdict."
          action={
            <Button variant="solid" size="sm" disabled icon={<IconPlus size={14} />}>
              Ajouter un bien
            </Button>
          }
          className="flex-1"
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingId(null)}
        >
          <div className="rail-x flex min-h-0 flex-1 gap-3 px-5 py-4">
            {STATUS_COLUMNS.map((col) => (
              <PipelineColumn
                key={col.key}
                status={col.key}
                label={col.label}
                properties={columns.get(col.key) ?? []}
                onOpenProperty={openDrawer}
                onChangeStatus={(id, status) =>
                  performMove(id, status, (columns.get(status) ?? []).length)
                }
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16,1,0.3,1)" }}>
            {dragged ? <DragGhost property={dragged} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <PropertyDrawer
        property={selectedProperty}
        projectId={projectId}
        onClose={closeDrawer}
        onStatusChange={handleStatusChange}
        onAddNote={handleAddNote}
      />

      <DiscardReasonModal
        open={Boolean(pendingDiscard)}
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </div>
  );
}
