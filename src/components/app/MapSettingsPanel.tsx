"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Controls";
import { FieldSet, Checkbox } from "@/components/ui/Field";
import { IconSliders, IconClose } from "@/components/ui/Icon";
import { SectionScenario } from "@/components/app/fiche/SectionScenario";
import type { MapDisplayPrefs, MapStyleKey } from "@/lib/hooks/use-map-display-prefs";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

const MAP_STYLE_OPTIONS: { value: MapStyleKey; label: string }[] = [
  { value: "dark", label: "Sombre" },
  { value: "light", label: "Clair" },
  { value: "detailed", label: "Détaillé" },
];

/**
 * Widget flottant unique de la vue Carte : un bouton, un panneau à 2
 * onglets. « Scénario » réutilise `SectionScenario` telle quelle (mêmes
 * curseurs que la fiche), sans sauvegarde — le scénario de la carte est
 * éphémère. « Affichage » couvre le style de fond et les champs visibles sur
 * les épingles, persistés en `localStorage` (`useMapDisplayPrefs`).
 */
export function MapSettingsPanel({
  scenario,
  onScenarioChange,
  displayPrefs,
  onDisplayPrefsChange,
}: {
  scenario: PropertyScenarioRow | null;
  onScenarioChange: (patch: Partial<PropertyScenarioRow>) => void;
  displayPrefs: MapDisplayPrefs;
  onDisplayPrefsChange: (patch: Partial<MapDisplayPrefs>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"scenario" | "affichage">("scenario");

  return (
    <div className="relative">
      <IconButton
        aria-label={open ? "Fermer les paramètres de la carte" : "Paramètres de la carte"}
        variant="quiet"
        onClick={() => setOpen((v) => !v)}
        className="border border-hairline-2 bg-[rgb(11_10_9/0.85)] backdrop-blur-md"
      >
        <IconSliders size={16} />
      </IconButton>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 max-h-[70vh] w-[22rem] overflow-y-auto rounded-lg border border-hairline bg-surface p-5 shadow-[0_20px_60px_-15px_rgb(0_0_0/0.6)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Toggle
              layoutKey="map-settings-tab"
              active={tab}
              onSelect={(k) => setTab(k as "scenario" | "affichage")}
              items={[
                { key: "scenario", label: "Scénario" },
                { key: "affichage", label: "Affichage" },
              ]}
            />
            <IconButton aria-label="Fermer" size="sm" onClick={() => setOpen(false)}>
              <IconClose size={14} />
            </IconButton>
          </div>

          {tab === "scenario" &&
            (scenario ? (
              <SectionScenario
                scenario={scenario}
                onChange={onScenarioChange}
                saveStatus="idle"
                mode="complet"
              />
            ) : (
              <p className="text-[13px] text-text-3">
                Aucun scénario disponible pour ce projet.
              </p>
            ))}

          {tab === "affichage" && (
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
                        className="h-3.5 w-3.5 accent-brand"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </FieldSet>

              <FieldSet legend="Informations sur les épingles">
                <p className="text-[12px] text-text-3">Le prix est toujours affiché.</p>
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
          )}
        </div>
      )}
    </div>
  );
}
