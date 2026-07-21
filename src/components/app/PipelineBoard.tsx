"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { computeDropPosition } from "@/lib/board-position";
import { moveProperty, addQuickNote } from "@/app/(app)/app/p/[projectId]/actions";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

type PendingDiscard = {
  propertyId: string;
  fromStatus: PropertyStatus;
  newPosition: number;
};

export function PipelineBoard({
  projectId,
  initialProperties,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState(initialProperties);
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const columns = useMemo(() => {
    const grouped = new Map<PropertyStatus, PipelineProperty[]>();
    for (const col of STATUS_COLUMNS) grouped.set(col.key, []);
    for (const property of properties) {
      grouped.get(property.status)?.push(property);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => a.board_position - b.board_position);
    }
    return grouped;
  }, [properties]);

  const selectedId = searchParams.get("bien");
  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  function openDrawer(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bien", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("bien");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function applyMove(
    propertyId: string,
    fromStatus: PropertyStatus,
    toStatus: PropertyStatus,
    newPosition: number,
    discardReason?: string,
  ) {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              status: toStatus,
              board_position: newPosition,
              daysInStatus: 0,
              discard_reason: toStatus === "ecarte" ? (discardReason ?? null) : null,
            }
          : p,
      ),
    );

    startTransition(async () => {
      try {
        await moveProperty({ projectId, propertyId, fromStatus, toStatus, newPosition, discardReason });
      } catch {
        setError("Le déplacement n'a pas pu être enregistré. Réessaie.");
        router.refresh();
      }
    });
  }

  function performMove(propertyId: string, toStatus: PropertyStatus, destIndex: number) {
    const source = properties.find((p) => p.id === propertyId);
    if (!source) return;
    const fromStatus = source.status;
    const destColumn = columns.get(toStatus) ?? [];

    if (fromStatus === toStatus && destIndex === destColumn.findIndex((p) => p.id === propertyId)) {
      return;
    }

    const destOthers = destColumn.filter((p) => p.id !== propertyId);
    const clampedIndex = Math.min(Math.max(destIndex, 0), destOthers.length);
    const newPosition = computeDropPosition(
      destOthers.map((p) => p.board_position),
      clampedIndex,
    );

    if (toStatus === "ecarte" && fromStatus !== "ecarte") {
      setPendingDiscard({ propertyId, fromStatus, newPosition });
      return;
    }

    applyMove(propertyId, fromStatus, toStatus, newPosition);
  }

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

    const overProperty = properties.find((p) => p.id === overId);
    if (!overProperty) return;
    const toStatus = overProperty.status;
    const destIndex = (columns.get(toStatus) ?? []).findIndex((p) => p.id === overId);
    performMove(propertyId, toStatus, destIndex);
  }

  function handleStatusChange(status: PropertyStatus) {
    if (!selectedProperty) return;
    performMove(selectedProperty.id, status, (columns.get(status) ?? []).length);
  }

  function handleAddNote(body: string): Promise<void> {
    if (!selectedProperty) return Promise.resolve();
    const propertyId = selectedProperty.id;
    const optimisticNote = {
      id: `optimistic-${Date.now()}`,
      kind: "note" as const,
      body,
      created_at: new Date().toISOString(),
    };
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, notes: [optimisticNote, ...p.notes] } : p)),
    );
    return addQuickNote(propertyId, body)
      .then((saved) => {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  notes: p.notes.map((n) =>
                    n.id === optimisticNote.id ? { ...n, id: saved.id, created_at: saved.created_at } : n,
                  ),
                }
              : p,
          ),
        );
      })
      .catch(() => {
        setError("La note n'a pas pu être enregistrée. Réessaie.");
        router.refresh();
      });
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
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}

      {pendingDiscard && (
        <DiscardReasonModal
          onCancel={() => setPendingDiscard(null)}
          onConfirm={(reason) => {
            applyMove(pendingDiscard.propertyId, pendingDiscard.fromStatus, "ecarte", pendingDiscard.newPosition, reason);
            setPendingDiscard(null);
          }}
        />
      )}
    </div>
  );
}
