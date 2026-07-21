"use client";

import { useEffect, useState } from "react";

/** `Set<string>` synchronisé avec `localStorage`. Lecture après montage pour
 *  éviter un mismatch SSR/hydratation (le serveur rend toujours les valeurs
 *  par défaut). Fallback silencieux si `localStorage` est indisponible
 *  (navigation privée stricte) : on reste sur les valeurs par défaut. */
export function useLocalStorageSet(
  key: string,
  defaultValues: string[],
): [Set<string>, (next: Set<string>) => void] {
  const [values, setValues] = useState<Set<string>>(() => new Set(defaultValues));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
        setValues(new Set(parsed));
      }
    } catch {
      // localStorage indisponible ou contenu corrompu : on reste sur les valeurs par défaut.
    }
    // Lecture uniquement au montage : `key` ne change pas dans nos usages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(next: Set<string>) {
    setValues(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(Array.from(next)));
    } catch {
      // localStorage indisponible : la sélection ne persiste pas, ce n'est pas bloquant.
    }
  }

  return [values, update];
}
