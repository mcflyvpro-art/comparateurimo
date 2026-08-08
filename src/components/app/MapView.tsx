"use client";

import { Empty } from "@/components/ui/Feedback";
import { ButtonLink } from "@/components/ui/Button";
import { IconMap, IconTable } from "@/components/ui/Icon";
import { MapCanvas } from "@/components/app/MapCanvas";
import { MapSettingsPanel } from "@/components/app/MapSettingsPanel";
import { useMapDisplayPrefs } from "@/lib/hooks/use-map-display-prefs";
import { VERDICT_HEX } from "@/lib/verdict";
import { cx } from "@/lib/cx";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export type GeolocatedProperty = PropertyRow & { lat: number; lng: number };

/**
 * Vue Carte — orchestrateur. Porte les préférences d'affichage (persistées)
 * et branche `MapCanvas` (mécanique MapLibre) + `MapSettingsPanel` (widget).
 * Le scénario utilisé pour le score des épingles est celui reçu du serveur,
 * fixe — pas d'édition en direct ici (direction produit future : un
 * scénario par projet, réglé à l'onboarding, pas depuis la carte).
 */
export function MapView({
  properties,
  scenario,
  unlocatedCount,
  projectId,
}: {
  properties: GeolocatedProperty[];
  scenario: PropertyScenarioRow | null;
  unlocatedCount: number;
  projectId: string;
}) {
  const [displayPrefs, updateDisplayPrefs] = useMapDisplayPrefs();

  if (properties.length === 0) {
    return (
      <Empty
        icon={<IconMap size={20} />}
        title="Aucun bien à afficher sur la carte"
        body="Aucun bien de ce projet n'a de coordonnées enregistrées pour l'instant."
        action={
          <ButtonLink
            href={`/app/p/${projectId}?view=tableau`}
            variant="outline"
            size="sm"
            icon={<IconTable size={14} />}
          >
            Voir le tableau
          </ButtonLink>
        }
        className="flex-1"
      />
    );
  }

  return (
    <div
      className={cx(
        "estio-map relative min-h-0 flex-1",
        displayPrefs.mapStyle === "dark" && "estio-map--dark",
        displayPrefs.mapStyle === "detailed" && "estio-map--detailed",
      )}
    >
      {scenario && (
        <MapCanvas
          properties={properties}
          scenario={scenario}
          displayPrefs={displayPrefs}
          projectId={projectId}
        />
      )}

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-hairline-2 bg-[rgb(11_10_9/0.85)] px-3.5 py-3 backdrop-blur-md">
        <ul className="flex flex-col gap-2">
          {[
            { hex: VERDICT_HEX.good, label: "Bon dossier" },
            { hex: VERDICT_HEX.mid, label: "À creuser" },
            { hex: VERDICT_HEX.risk, label: "Peu favorable" },
          ].map((l) => (
            <li key={l.label} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: l.hex }}
              />
              <span className="text-[12px] text-text-2">{l.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute right-4 top-4 z-10 flex items-start gap-2">
        {unlocatedCount > 0 && (
          <p className="rounded-sm border border-hairline-2 bg-[rgb(11_10_9/0.85)] px-3 py-2 text-[12px] text-text-2 backdrop-blur-md">
            <span className="num">{unlocatedCount}</span> bien
            {unlocatedCount > 1 ? "s" : ""} sans adresse localisée
          </p>
        )}
        <MapSettingsPanel displayPrefs={displayPrefs} onDisplayPrefsChange={updateDisplayPrefs} />
      </div>
    </div>
  );
}
