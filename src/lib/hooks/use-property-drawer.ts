"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { computeDropPosition } from "@/lib/board-position";
import { moveProperty, addQuickNote } from "@/app/(app)/app/p/[projectId]/actions";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

type PendingDiscard = {
  propertyId: string;
  fromStatus: PropertyStatus;
  newPosition: number;
};

/** Logique partagée entre la vue Pipeline (board) et la vue Tableau : état des
 *  biens, ouverture/fermeture du drawer via le paramètre d'URL `bien`,
 *  déplacement de statut (avec position fractionnée), ajout de note optimiste,
 *  et le passage obligatoire par une raison quand un bien est écarté. */
export function usePropertyDrawer(projectId: string, initialProperties: PipelineProperty[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState(initialProperties);
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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

  function handleStatusChange(status: PropertyStatus) {
    if (!selectedProperty) return;
    performMove(selectedProperty.id, status, (columns.get(status) ?? []).length);
  }

  function confirmDiscard(reason: string) {
    if (!pendingDiscard) return;
    applyMove(pendingDiscard.propertyId, pendingDiscard.fromStatus, "ecarte", pendingDiscard.newPosition, reason);
    setPendingDiscard(null);
  }

  function cancelDiscard() {
    setPendingDiscard(null);
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

  return {
    properties,
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
  };
}
