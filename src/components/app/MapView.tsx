"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { computeScoreSur100 } from "@/lib/calc/scoring";
import { verdictFromScore, verdictHexFromScore, VERDICT_HEX } from "@/lib/verdict";
import { formatEUR } from "@/lib/format";
import { Empty } from "@/components/ui/Feedback";
import { ButtonLink } from "@/components/ui/Button";
import { IconMap, IconTable } from "@/components/ui/Icon";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/** `public/maplibre-gl-worker.mjs` et `public/maplibre-gl-shared.mjs` sont des
 *  copies telles quelles de `node_modules/maplibre-gl/dist/` (voir le
 *  commentaire dans le `useEffect` ci-dessous pour le pourquoi). À recopier
 *  à chaque mise à jour de `maplibre-gl`. */

export type GeolocatedProperty = PropertyRow & { lat: number; lng: number };

/**
 * Vue carte.
 *
 * Le fond de tuiles est désaturé et réchauffé par filtre CSS pour appartenir au
 * monde d'Estio plutôt que d'y être collé. Les épingles portent la couleur du
 * verdict — trois teintes, lisibles sans légende, mais la légende est là quand
 * même parce qu'une carte sans clé de lecture n'est qu'un décor.
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

    import("maplibre-gl").then(({ Map, LngLatBounds, Marker, setWorkerUrl }) => {
      if (cancelled || !containerRef.current) return;

      // maplibre-gl charge son worker de parsing de tuiles via un chemin
      // relatif interne (`import.meta.url` + nom de fichier reconstruit),
      // que Turbopack hache et déplace sans réécrire cette référence dans le
      // bundle → 404 silencieux, le worker ne démarre jamais, aucune tuile
      // vecteur ne se charge (le style/sprite/attribution, qui ne passent
      // pas par le worker, chargent très bien — d'où une carte avec juste
      // l'attribution en bas, jamais de tuiles ni d'épingles).
      // Un `new URL("maplibre-gl/dist/...", import.meta.url)` posé dans
      // notre propre code contourne le premier 404, mais le worker importe
      // LUI-MÊME un second fichier (`maplibre-gl-shared.mjs`) via un chemin
      // relatif que Turbopack ne réécrit pas non plus une fois le worker
      // chargé comme module brut — même échec un cran plus loin.
      // Solution robuste, indépendante du bundler : les deux fichiers sont
      // copiés tels quels dans `public/` (voir le commentaire au-dessus de
      // l'import), servis à un chemin fixe où leur import relatif se résout
      // naturellement. À recopier si `maplibre-gl` est mis à jour.
      setWorkerUrl("/maplibre-gl-worker.mjs");

      const map = new Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [properties[0].lng, properties[0].lat],
        zoom: 11,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.on("load", () => {
        if (properties.length > 1) {
          const bounds = new LngLatBounds();
          for (const property of properties) {
            bounds.extend([property.lng, property.lat]);
          }
          map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
        }

        for (const property of properties) {
          const metrics = computeInvestmentMetrics(property, scenario);
          const { scoreSur100 } = computeScoreSur100({
            rendementNetNetPct: metrics.rendementNetNetPct,
            cashOnCashPct: metrics.cashOnCashPct,
            triPct: metrics.tri,
          });

          const el = document.createElement("div");
          el.className = "estio-pin";
          el.title = `${property.address ?? "Bien"} — ${verdictFromScore(scoreSur100).label} · ${formatEUR(property.asking_price)}`;

          const core = document.createElement("i");
          core.style.background = verdictHexFromScore(scoreSur100);
          el.appendChild(core);

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
      <Empty
        icon={<IconMap size={20} />}
        title="Rien à placer sur la carte"
        body="Aucun bien de ce projet n'a encore de coordonnées. L'adresse est le champ qui déverrouille tout le reste, carte comprise."
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
    <div className="estio-map relative min-h-0 flex-1">
      <div ref={containerRef} className="absolute inset-0" />

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

      {unlocatedCount > 0 && (
        <p className="absolute right-4 top-4 rounded-sm border border-hairline-2 bg-[rgb(11_10_9/0.85)] px-3 py-2 text-[12px] text-text-2 backdrop-blur-md">
          <span className="num">{unlocatedCount}</span> bien
          {unlocatedCount > 1 ? "s" : ""} sans adresse localisée
        </p>
      )}
    </div>
  );
}
