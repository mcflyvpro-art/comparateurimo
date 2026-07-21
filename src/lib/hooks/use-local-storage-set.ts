"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

/** `Set<string>` synchronisé avec `localStorage`.
 *
 *  Basé sur `useSyncExternalStore` : le rendu serveur (et le premier rendu
 *  client, avant hydratation) utilise toujours `defaultValues` via
 *  `getServerSnapshot`, ce qui évite tout mismatch SSR/hydratation. React
 *  se charge lui-même de re-rendre avec la vraie valeur de `localStorage`
 *  juste après le montage — pas besoin d'un `useEffect` manuel qui
 *  déclenche un `setState`.
 *
 *  `subscribe` écoute l'événement natif `storage` (utile pour la sync
 *  entre onglets) et un mini pub-sub local propre à cette instance du hook,
 *  déclenché par `update`, pour se re-rendre immédiatement après une
 *  écriture faite depuis ce même onglet (l'événement `storage` du
 *  navigateur ne se déclenche jamais dans l'onglet qui a écrit).
 *
 *  Fallback silencieux si `localStorage` est indisponible (navigation
 *  privée stricte) ou si son contenu est corrompu : on reste sur les
 *  valeurs par défaut. */
export function useLocalStorageSet(
  key: string,
  defaultValues: string[],
): [Set<string>, (next: Set<string>) => void] {
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      listenersRef.current.add(onStoreChange);
      const handleStorage = (e: StorageEvent) => {
        if (e.key === null || e.key === key) onStoreChange();
      };
      window.addEventListener("storage", handleStorage);
      return () => {
        listenersRef.current.delete(onStoreChange);
        window.removeEventListener("storage", handleStorage);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const values = useMemo(() => {
    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
          return new Set(parsed);
        }
      } catch {
        // localStorage contient du JSON corrompu : on retombe sur les valeurs par défaut.
      }
    }
    return new Set(defaultValues);
  }, [raw, defaultValues]);

  const update = useCallback(
    (next: Set<string>) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(Array.from(next)));
      } catch {
        // localStorage indisponible : la sélection ne persiste pas, ce n'est pas bloquant.
      }
      // Notifie cette instance du hook (l'événement `storage` natif ne se
      // déclenche pas dans l'onglet à l'origine de l'écriture).
      listenersRef.current.forEach((listener) => listener());
    },
    [key],
  );

  return [values, update];
}
