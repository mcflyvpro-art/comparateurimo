"use client";

import { useCallback, useState } from "react";

const CONFIRM_WINDOW_MS = 3000;

/**
 * Confirmation légère à deux clics, partagée entre PhotoGrid et DocumentList
 * (Plan 5c) : le premier clic sur un id arme un état "en attente" pendant
 * 3 secondes ; un second clic sur le MÊME id dans cette fenêtre retourne
 * `true` (l'appelant déclenche alors l'action réelle) ; sinon retourne
 * `false` (l'appelant se contente d'armer/réarmer l'état visuel).
 */
export function useConfirmDelete(): {
  pendingId: string | null;
  requestConfirm: (id: string) => boolean;
} {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const requestConfirm = useCallback(
    (id: string): boolean => {
      if (pendingId === id) {
        setPendingId(null);
        return true;
      }
      setPendingId(id);
      setTimeout(() => setPendingId((current) => (current === id ? null : current)), CONFIRM_WINDOW_MS);
      return false;
    },
    [pendingId],
  );

  return { pendingId, requestConfirm };
}
