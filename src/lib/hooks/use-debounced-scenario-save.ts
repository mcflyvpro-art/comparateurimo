"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updatePropertyScenario, type ScenarioPatch } from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 600;
const SAVED_RESET_MS = 2000;

/** Debounce les écritures du scénario en base : un seul appel réseau même
 *  si plusieurs curseurs sont bougés rapidement (les patchs successifs sont
 *  fusionnés). Le statut retourné pilote l'indicateur "Enregistrement…" /
 *  "Enregistré" à côté de la section ⑦. En cas d'échec, le state local
 *  n'est jamais reverté — l'utilisateur peut retenter en rebougeant un
 *  curseur (aucun bouton "réessayer" dans ce plan). */
export function useDebouncedScenarioSave(propertyId: string): {
  status: SaveStatus;
  scheduleSave: (patch: ScenarioPatch) => void;
} {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatchRef = useRef<ScenarioPatch>({});

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleSave = useCallback(
    (patch: ScenarioPatch) => {
      pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const toSave = pendingPatchRef.current;
        pendingPatchRef.current = {};
        setStatus("saving");
        updatePropertyScenario(propertyId, toSave)
          .then(() => {
            setStatus("saved");
            setTimeout(() => {
              setStatus((current) => (current === "saved" ? "idle" : current));
            }, SAVED_RESET_MS);
          })
          .catch(() => {
            setStatus("error");
          });
      }, DEBOUNCE_MS);
    },
    [propertyId],
  );

  return { status, scheduleSave };
}
