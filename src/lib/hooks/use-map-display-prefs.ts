"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

export type MapStyleKey = "dark" | "light" | "detailed";

export type MapDisplayPrefs = {
  mapStyle: MapStyleKey;
  showPrice: boolean;
  showSurface: boolean;
  showStatus: boolean;
};

const STORAGE_KEY = "estio:carte:display-prefs";

const DEFAULT_PREFS: MapDisplayPrefs = {
  mapStyle: "dark",
  showPrice: true,
  showSurface: false,
  showStatus: false,
};

function isMapStyleKey(value: unknown): value is MapStyleKey {
  return value === "dark" || value === "light" || value === "detailed";
}

function parsePrefs(raw: string | null): MapDisplayPrefs {
  if (raw === null) return DEFAULT_PREFS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      isMapStyleKey((parsed as Record<string, unknown>).mapStyle) &&
      typeof (parsed as Record<string, unknown>).showPrice === "boolean" &&
      typeof (parsed as Record<string, unknown>).showSurface === "boolean" &&
      typeof (parsed as Record<string, unknown>).showStatus === "boolean"
    ) {
      return parsed as MapDisplayPrefs;
    }
  } catch {
    // localStorage contient du JSON corrompu : on retombe sur les valeurs par défaut.
  }
  return DEFAULT_PREFS;
}

/**
 * Préférences d'affichage de la vue Carte (style de fond + champs visibles
 * sur les épingles), persistées en `localStorage` — ce sont des préférences
 * d'affichage personnelles, pas une donnée métier. Même pattern SSR-safe que
 * `useLocalStorageSet`
 * (`src/lib/hooks/use-local-storage-set.ts`) : `useSyncExternalStore` avec un
 * snapshot serveur toujours égal aux valeurs par défaut, pour éviter tout
 * mismatch d'hydratation — React re-rend avec la vraie valeur juste après le
 * montage, sans `useEffect` manuel.
 */
export function useMapDisplayPrefs(): [MapDisplayPrefs, (patch: Partial<MapDisplayPrefs>) => void] {
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((onStoreChange: () => void) => {
    listenersRef.current.add(onStoreChange);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === STORAGE_KEY) onStoreChange();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      listenersRef.current.delete(onStoreChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const prefs = useMemo(() => parsePrefs(raw), [raw]);

  const update = useCallback((patch: Partial<MapDisplayPrefs>) => {
    let currentRaw: string | null = null;
    try {
      currentRaw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage indisponible : on part des valeurs par défaut.
    }
    const next = { ...parsePrefs(currentRaw), ...patch };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage indisponible : la préférence ne persiste pas, ce n'est pas bloquant.
    }
    // Notifie cette instance du hook (l'événement `storage` natif ne se
    // déclenche pas dans l'onglet à l'origine de l'écriture).
    listenersRef.current.forEach((listener) => listener());
  }, []);

  return [prefs, update];
}
