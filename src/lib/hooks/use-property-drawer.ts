"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { computeDropPosition } from "@/lib/board-position";
import { moveProperty, addQuickNote } from "@/app/(app)/app/p/[projectId]/actions";
import { useToast } from "@/components/ui/Toast";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

const LIBELLE_ETAPE = Object.fromEntries(
  STATUS_COLUMNS.map((c) => [c.key, c.label]),
) as Record<PropertyStatus, string>;

type PendingDiscard = {
  propertyId: string;
  fromStatus: PropertyStatus;
  newPosition: number;
};

/** Logique partagée entre la vue Pipeline (board) et la vue Tableau : état des
 *  biens, ouverture/fermeture du drawer via le paramètre d'URL `bien`,
 *  déplacement de statut (avec position fractionnée), ajout de note optimiste,
 *  et le passage obligatoire par une raison quand un bien est écarté.
 *
 *  ⚠ Les paramètres d'URL sont LUS CÔTÉ SERVEUR et descendus en prop (`view`,
 *  `bien`). Ne jamais les relire ici avec `useSearchParams()` : ce hook, appelé
 *  dans un composant client sans limite `<Suspense>` au-dessus, fait basculer
 *  la page en rendu client et l'hydratation ne se termine plus — le board
 *  restait entièrement inerte. Le routeur seul suffit pour écrire. */
export function usePropertyDrawer(
  projectId: string,
  initialProperties: PipelineProperty[],
  urlState: { view?: string; bien?: string } = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const { pousser } = useToast();
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

  const selectedProperty = properties.find((p) => p.id === urlState.bien) ?? null;

  /** Reconstruit l'URL de la vue courante, avec ou sans bien sélectionné. */
  function urlWith(bien?: string) {
    const params = new URLSearchParams();
    if (urlState.view) params.set("view", urlState.view);
    if (bien) params.set("bien", bien);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function openDrawer(id: string) {
    router.replace(urlWith(id), { scroll: false });
  }

  function closeDrawer() {
    router.replace(urlWith(), { scroll: false });
  }

  function applyMove(
    propertyId: string,
    fromStatus: PropertyStatus,
    toStatus: PropertyStatus,
    newPosition: number,
    discardReason?: string,
    /** Un retour en arrière ne doit pas reproposer « Annuler » : sinon on
     *  s'enferme dans une boucle d'annulations qui s'annulent. */
    estUneAnnulation = false,
  ) {
    const source = properties.find((p) => p.id === propertyId);
    const positionInitiale = source?.board_position ?? newPosition;
    const raisonInitiale = source?.discard_reason ?? undefined;

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

        if (estUneAnnulation) {
          pousser({ tone: "neutre", message: `Remis dans « ${LIBELLE_ETAPE[toStatus]} ».` });
          return;
        }

        // Déplacer une carte était jusqu'ici irréversible. On préfère
        // « c'est fait, annuler ? » à « êtes-vous sûr ? » : le premier ne
        // coûte rien quand on a raison.
        pousser({
          tone: "succes",
          message: `Déplacé dans « ${LIBELLE_ETAPE[toStatus]} ».`,
          actionLabel: "Annuler",
          onAction: () =>
            applyMove(propertyId, toStatus, fromStatus, positionInitiale, raisonInitiale, true),
        });
      } catch {
        setError("Le déplacement n'a pas pu être enregistré. Réessayez.");
        pousser({ tone: "erreur", message: "Le déplacement n'a pas pu être enregistré." });
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
        setError("La note n'a pas pu être enregistrée. Réessayez.");
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
