"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker, Popup as MapLibrePopup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { computeScoreSur100 } from "@/lib/calc/scoring";
import { verdictFromScore, VERDICT_HEX } from "@/lib/verdict";
import { formatEUR, formatM2, formatCompactEUR } from "@/lib/format";
import { STATUS_COLUMNS } from "@/lib/pipeline-types";
import type { MapDisplayPrefs, MapStyleKey } from "@/lib/hooks/use-map-display-prefs";
import type { GeolocatedProperty } from "@/components/app/MapView";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const STYLE_URLS: Record<MapStyleKey, string> = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/positron",
  detailed: "https://tiles.openfreemap.org/styles/liberty",
};

const STATUS_LABELS: Record<PropertyRow["status"], string> = Object.fromEntries(
  STATUS_COLUMNS.map((c) => [c.key, c.label]),
) as Record<PropertyRow["status"], string>;

/** `public/maplibre-gl-worker.mjs` et `public/maplibre-gl-shared.mjs` sont des
 *  copies telles quelles de `node_modules/maplibre-gl/dist/` (Plan 6a) — à
 *  recopier à chaque mise à jour de `maplibre-gl`. */

/**
 * Carte MapLibre — mécanique impérative uniquement (la carte elle-même n'est
 * PAS un composant React idiomatique, c'est un objet à durée de vie propre).
 *
 * Trois effets, trois responsabilités qui ne se chevauchent jamais :
 * 1. Créer la `Map` UNE SEULE FOIS (montage) — jamais recréée ensuite.
 * 2. Recréer les épingles quand le scénario ou les champs affichés changent
 *    (`renderMarkers`), sans toucher à l'instance `Map`.
 * 3. Changer le style de fond (`map.setStyle`) sans recréer la carte ni les
 *    épingles — les `Marker`/`Popup` sont des objets indépendants du style,
 *    ils survivent au changement.
 */
export function MapCanvas({
  properties,
  scenario,
  displayPrefs,
  projectId,
}: {
  properties: GeolocatedProperty[];
  scenario: PropertyScenarioRow;
  displayPrefs: MapDisplayPrefs;
  projectId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapLibreRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const popupRef = useRef<MapLibrePopup | null>(null);
  const mapReadyRef = useRef(false);
  // Capture le style au premier rendu — voir le commentaire de l'Effet 3 sur
  // la fenêtre de course (rare) qu'il ne couvre pas.
  const appliedStyleRef = useRef<MapStyleKey>(displayPrefs.mapStyle);

  function renderMarkers() {
    const map = mapRef.current;
    const maplibregl = mapLibreRef.current;
    if (!map || !maplibregl) return;

    popupRef.current?.remove();
    popupRef.current = null;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const property of properties) {
      const metrics = computeInvestmentMetrics(property, scenario);
      const { scoreSur100 } = computeScoreSur100({
        rendementNetNetPct: metrics.rendementNetNetPct,
        cashOnCashPct: metrics.cashOnCashPct,
        triPct: metrics.tri,
      });
      const verdict = verdictFromScore(scoreSur100);

      const el = document.createElement("div");
      el.className = "estio-pin";

      const dot = document.createElement("i");
      dot.style.background = VERDICT_HEX[verdict.level];
      el.appendChild(dot);

      const labelParts = [formatCompactEUR(property.asking_price)];
      if (displayPrefs.showSurface) labelParts.push(formatM2(property.surface_carrez));
      if (displayPrefs.showStatus) labelParts.push(STATUS_LABELS[property.status]);

      const label = document.createElement("span");
      label.className =
        "num whitespace-nowrap rounded-sm border border-hairline-2 bg-[rgb(11_10_9/0.85)] px-1.5 py-0.5 text-[11px] text-text backdrop-blur-md";
      label.textContent = labelParts.join(" · ");
      el.appendChild(label);

      el.addEventListener("click", (event) => {
        event.stopPropagation();
        openPopup(property);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([property.lng, property.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }

  function openPopup(property: GeolocatedProperty) {
    const map = mapRef.current;
    const maplibregl = mapLibreRef.current;
    if (!map || !maplibregl) return;

    popupRef.current?.remove();

    const metrics = computeInvestmentMetrics(property, scenario);
    const { scoreSur100 } = computeScoreSur100({
      rendementNetNetPct: metrics.rendementNetNetPct,
      cashOnCashPct: metrics.cashOnCashPct,
      triPct: metrics.tri,
    });
    const verdict = verdictFromScore(scoreSur100);

    const el = document.createElement("div");
    el.className = "min-w-[13rem] max-w-[16rem]";

    const address = document.createElement("p");
    address.className = "text-[13px] font-medium text-text";
    address.textContent = property.address ?? "Adresse non renseignée";
    el.appendChild(address);

    const city = document.createElement("p");
    city.className = "text-[12px] text-text-3";
    city.textContent = property.city ?? "—";
    el.appendChild(city);

    const verdictRow = document.createElement("div");
    verdictRow.className = "mt-2 flex items-center gap-1.5";
    const verdictDot = document.createElement("span");
    verdictDot.className = "h-1.5 w-1.5 shrink-0 rounded-full";
    verdictDot.style.background = VERDICT_HEX[verdict.level];
    const verdictLabel = document.createElement("span");
    verdictLabel.className = "text-[12px] font-medium";
    verdictLabel.style.color = VERDICT_HEX[verdict.level];
    verdictLabel.textContent = verdict.label;
    const scoreText = document.createElement("span");
    scoreText.className = "num text-[11px] text-text-4";
    scoreText.textContent = scoreSur100 !== null ? `${scoreSur100}/100` : "—";
    verdictRow.append(verdictDot, verdictLabel, scoreText);
    el.appendChild(verdictRow);

    const dl = document.createElement("dl");
    dl.className = "mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]";
    appendMetric(dl, "Prix", formatEUR(property.asking_price));
    appendMetric(dl, "Surface", formatM2(property.surface_carrez));
    el.appendChild(dl);

    const link = document.createElement("a");
    link.href = `/app/p/${projectId}/bien/${property.id}`;
    link.className =
      "mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:text-brand-hot";
    link.textContent = "Analyse complète →";
    el.appendChild(link);

    popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: "280px" })
      .setLngLat([property.lng, property.lat])
      .setDOMContent(el)
      .addTo(map);
  }

  // Effet 1 — crée la carte UNE SEULE FOIS (montage). Volontairement sans
  // dépendances : la recréer à chaque changement de scénario/affichage
  // détruirait et rechargerait toute la carte (tuiles, zoom, position) au
  // lieu de ne mettre à jour que les épingles ou le style.
  useEffect(() => {
    if (!containerRef.current || properties.length === 0) return;
    let cancelled = false;

    import("maplibre-gl").then((maplibregl) => {
      if (cancelled || !containerRef.current) return;
      mapLibreRef.current = maplibregl;

      // maplibre-gl charge son worker de parsing de tuiles via un chemin
      // relatif interne que Turbopack hache sans réécrire — voir le
      // commentaire détaillé posé au Plan 6a dans l'historique git de ce
      // fichier. Les deux fichiers worker sont servis tels quels depuis
      // `public/`, où leur import relatif interne se résout correctement.
      maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URLS[appliedStyleRef.current],
        center: [properties[0].lng, properties[0].lat],
        zoom: 11,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.on("load", () => {
        mapReadyRef.current = true;
        if (properties.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          for (const property of properties) bounds.extend([property.lng, property.lat]);
          map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
        }
        renderMarkers();
      });
    });

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      popupRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapReadyRef.current = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effet 2 — recrée les épingles quand le scénario ou les champs affichés
  // changent. `renderMarkers` ci-dessus est redéfinie à chaque rendu : cet
  // effet appelle toujours la version la plus fraîche (fermeture sur les
  // props actuelles), sans jamais toucher à l'instance `Map`.
  useEffect(() => {
    if (!mapReadyRef.current) return; // l'Effet 1 s'en charge dès le "load"
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, properties, displayPrefs.showSurface, displayPrefs.showStatus]);

  // Effet 3 — change le style de fond sans recréer la carte ni les épingles
  // (indépendantes du style). Cas limite accepté : si le style change avant
  // que l'Effet 1 ait fini de créer la carte (import dynamique en vol), ce
  // changement est perdu — cosmétique et rarissime, pas traité ici (YAGNI).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || displayPrefs.mapStyle === appliedStyleRef.current) return;
    appliedStyleRef.current = displayPrefs.mapStyle;
    map.setStyle(STYLE_URLS[displayPrefs.mapStyle]);
  }, [displayPrefs.mapStyle]);

  return <div ref={containerRef} className="absolute inset-0" />;
}

function appendMetric(dl: HTMLDListElement, label: string, value: string) {
  const dt = document.createElement("dt");
  dt.className = "text-text-4";
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.className = "num text-text";
  dd.textContent = value;
  dl.append(dt, dd);
}
