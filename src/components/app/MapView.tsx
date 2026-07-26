"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { computeScoreSur100, computeVerdictFromScore } from "@/lib/calc/scoring";
import type { Verdict } from "@/lib/calc/score";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/** Couleurs hex des épingles — mêmes valeurs que `--score-high`/`--score-mid`/
 *  `--score-low` (`src/design/tokens.css`), dupliquées ici car MapLibre ne
 *  peut pas consommer les classes Tailwind ni les `var(--color-*)` CSS dans
 *  un style DOM assigné dynamiquement en JS. */
const VERDICT_COLORS: Record<Verdict, string> = {
  pepite: "#7fa98c",
  solide: "#7fa98c",
  correct: "#e0a06a",
  a_eviter: "#d8a7a0",
};

export type GeolocatedProperty = PropertyRow & { lat: number; lng: number };

/**
 * Vue Carte (Plan 6a) : une épingle par bien géolocalisé du projet, colorée
 * selon son verdict. Le score est calculé **une seule fois**, à partir d'un
 * scénario fixe (celui du premier bien du projet) — le panneau de curseurs
 * éditable partagé, avec recalcul en direct limité au viewport, arrive au
 * Plan 6b. L'aperçu au clic sur une épingle arrive au Plan 6c (aucun
 * gestionnaire de clic sur les épingles dans ce plan).
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || properties.length === 0 || !scenario) return;

    let cancelled = false;

    import("maplibre-gl").then(({ Map, LngLatBounds, Marker }) => {
      if (cancelled || !containerRef.current) return;

      const map = new Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [properties[0].lng, properties[0].lat],
        zoom: 11,
      });
      mapRef.current = map;

      map.on("load", () => {
        if (properties.length > 1) {
          const bounds = new LngLatBounds();
          for (const property of properties) {
            bounds.extend([property.lng, property.lat]);
          }
          map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
        }

        for (const property of properties) {
          const metrics = computeInvestmentMetrics(property, scenario);
          const breakdown = computeScoreSur100({
            rendementNetNetPct: metrics.rendementNetNetPct,
            cashOnCashPct: metrics.cashOnCashPct,
            triPct: metrics.tri,
          });
          const verdict = computeVerdictFromScore(breakdown.scoreSur100);

          const el = document.createElement("div");
          el.style.width = "16px";
          el.style.height = "16px";
          el.style.borderRadius = "50%";
          el.style.border = "2px solid rgba(244, 244, 244, 0.4)";
          el.style.backgroundColor = VERDICT_COLORS[verdict];

          new Marker({ element: el }).setLngLat([property.lng, property.lat]).addTo(map);
        }
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [properties, scenario]);

  if (properties.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-sans text-xl font-medium text-text">Aucun bien à afficher sur la carte</p>
        <p className="mt-2 text-sm text-muted">
          Aucun bien de ce projet n&apos;a de coordonnées enregistrées pour l&apos;instant.
        </p>
        <Link
          href={`/app/p/${projectId}?view=tableau`}
          className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-brand"
        >
          Voir le tableau →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {unlocatedCount > 0 && (
        <p className="border-b border-border px-6 py-2 text-xs text-faint">
          {unlocatedCount} bien{unlocatedCount > 1 ? "s" : ""} sans localisation, non affiché
          {unlocatedCount > 1 ? "s" : ""} ici.
        </p>
      )}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
