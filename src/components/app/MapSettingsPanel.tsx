"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { FieldSet, Checkbox } from "@/components/ui/Field";
import { IconSliders, IconClose } from "@/components/ui/Icon";
import type { MapDisplayPrefs, MapStyleKey } from "@/lib/hooks/use-map-display-prefs";

const MAP_STYLE_OPTIONS: { value: MapStyleKey; label: string }[] = [
  { value: "dark", label: "Sombre" },
  { value: "light", label: "Clair" },
  { value: "detailed", label: "Détaillé" },
];

/**
 * Widget flottant unique de la vue Carte : un bouton, un panneau. Ne couvre
 * que l'affichage (style de fond + champs visibles sur les épingles),
 * persisté en `localStorage` (`useMapDisplayPrefs`). Le réglage du scénario
 * d'investissement n'est plus ici — direction produit future : un scénario
 * par projet, réglé à l'onboarding et éditable depuis les paramètres du
 * projet, pas depuis la carte (voir mémoire de session, hors-scope ici).
 */
export function MapSettingsPanel({
  displayPrefs,
  onDisplayPrefsChange,
}: {
  displayPrefs: MapDisplayPrefs;
  onDisplayPrefsChange: (patch: Partial<MapDisplayPrefs>) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <IconButton
        aria-label={open ? "Fermer les paramètres de la carte" : "Paramètres de la carte"}
        variant="quiet"
        onClick={() => setOpen((v) => !v)}
        className="border border-line bg-[rgb(11_10_9/0.85)] backdrop-blur-md"
      >
        <IconSliders size={16} />
      </IconButton>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 max-h-[70vh] w-[20rem] overflow-y-auto rounded-lg border border-line-soft bg-surface p-5 shadow-[0_20px_60px_-15px_rgb(0_0_0/0.6)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="t-head text-text">Affichage</h2>
            <IconButton aria-label="Fermer" size="sm" onClick={() => setOpen(false)}>
              <IconClose size={14} />
            </IconButton>
          </div>

          <div className="flex flex-col gap-6">
            <FieldSet legend="Style de carte">
              <div className="flex flex-col gap-2.5">
                {MAP_STYLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2.5 text-sm text-text-2 transition-colors hover:text-text"
                  >
                    <input
                      type="radio"
                      name="map-style"
                      checked={displayPrefs.mapStyle === opt.value}
                      onChange={() => onDisplayPrefsChange({ mapStyle: opt.value })}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FieldSet>

            <FieldSet legend="Informations sur les épingles">
              <Checkbox
                label="Prix"
                checked={displayPrefs.showPrice}
                onChange={(v) => onDisplayPrefsChange({ showPrice: v })}
              />
              <Checkbox
                label="Surface"
                checked={displayPrefs.showSurface}
                onChange={(v) => onDisplayPrefsChange({ showSurface: v })}
              />
              <Checkbox
                label="Statut"
                checked={displayPrefs.showStatus}
                onChange={(v) => onDisplayPrefsChange({ showStatus: v })}
              />
            </FieldSet>
          </div>
        </div>
      )}
    </div>
  );
}
