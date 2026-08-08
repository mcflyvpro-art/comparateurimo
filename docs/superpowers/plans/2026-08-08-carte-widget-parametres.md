# Carte — Widget Paramètres & popup (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter à la vue Carte un widget « Paramètres » (scénario partagé éditable + choix du style de carte + informations affichées sur les épingles, préférences persistées) et une popup d'aperçu rapide au clic sur une épingle.

**Architecture:** `MapView.tsx` devient un simple orchestrateur (state `scenario`/`displayPrefs`, branche vide). Toute la mécanique impérative MapLibre (création de la carte une seule fois, recréation des épingles, changement de style, popup) est extraite dans un nouveau composant `MapCanvas.tsx` — point critique : la carte n'est **jamais recréée** quand le scénario ou l'affichage changent (seul le Plan 6a le faisait, en confondant tout dans un seul effet ; ça détruirait/rechargerait toute la carte à chaque mouvement de curseur). Un nouveau composant `MapSettingsPanel.tsx` porte le bouton + le panneau à 2 onglets (réutilise `SectionScenario` tel quel pour l'onglet Scénario). Un nouveau hook `useMapDisplayPrefs` persiste le style de carte et les champs d'épingle en `localStorage`, sur le modèle exact de `useLocalStorageSet` déjà existant.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, MapLibre GL JS (déjà en place, Plan 6a). Aucune nouvelle dépendance npm.

## Global Constraints

- **Spec de référence :** `docs/superpowers/specs/2026-08-08-carte-widget-parametres-design.md`, validée par l'utilisateur. En cas de doute, cette spec fait foi.
- **Aucun framework de test dans ce repo.** Vérification de chaque tâche = `npx tsc --noEmit`, puis `npm run build` + `npm run lint` en fin de plan (doivent rester verts) + vérification manuelle. **Ne jamais écrire de test unitaire.**
- **La carte MapLibre est créée UNE SEULE FOIS** (effet à dépendances vides). Le changement de scénario ou de champs d'épingle ne recrée QUE les épingles (`Marker` retirés/recréés) ; le changement de style de carte appelle `map.setStyle(...)` sur l'instance existante. Ne jamais recréer l'objet `Map`.
- **Popup = un seul objet `Popup` à la fois** (`popupRef`), retiré avant d'en ouvrir un nouveau. Contenu construit par DOM API (`createElement`/`textContent`), **jamais `innerHTML`** — l'adresse/ville d'un bien sont des données utilisateur, `innerHTML` ouvrirait une injection HTML.
- **`localStorage`** : préférences d'affichage uniquement (style + 2 cases à cocher). Le scénario partagé reste **jamais persisté** (state React perdu à la fermeture/rechargement — inchangé depuis le Plan 6a).
- **Identité = dark grotesk**, composants UI existants réutilisés tels quels : `Panel`, `PanelHeader`, `Rule`, `Slider`, `Select`, `Checkbox`, `NumberField`, `FieldSet`, `Button`/`ButtonLink`/`IconButton`, `Toggle`, `Empty`, `VerdictPill`/`VerdictDot`, icônes de `@/components/ui/Icon`. Aucune couleur hors tokens (`src/design/tokens.css`).
- **`maplibre-gl` : mêmes précautions que le Plan 6a** — import dynamique dans un `useEffect` uniquement (jamais statique), `setWorkerUrl("/maplibre-gl-worker.mjs")` avant toute création de `Map` (fichiers déjà copiés dans `public/` au Plan 6a, ne pas y retoucher).
- **Hors-scope de ce plan** : actions d'édition depuis la carte (statut, notes — inchangé), autres styles de carte que les 3 listés, autres champs d'épingle que prix/surface/statut, persistance serveur des préférences d'affichage, deep-link vers un état du widget.

---

### Task 1: `useMapDisplayPrefs` — préférences d'affichage persistées

**Files:**
- Create: `src/lib/hooks/use-map-display-prefs.ts`

**Interfaces:**
- Consumes: rien de nouveau (React seul).
- Produces: `export type MapStyleKey = "dark" | "light" | "detailed"` · `export type MapDisplayPrefs = { mapStyle: MapStyleKey; showSurface: boolean; showStatus: boolean }` · `useMapDisplayPrefs(): [MapDisplayPrefs, (patch: Partial<MapDisplayPrefs>) => void]`. Consommé par Task 3 (`MapCanvas`), Task 4 (`MapSettingsPanel`), Task 5 (`MapView`).

- [ ] **Step 1: Écrire le hook**

Fichier `src/lib/hooks/use-map-display-prefs.ts` :

```ts
"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

export type MapStyleKey = "dark" | "light" | "detailed";

export type MapDisplayPrefs = {
  mapStyle: MapStyleKey;
  showSurface: boolean;
  showStatus: boolean;
};

const STORAGE_KEY = "estio:carte:display-prefs";

const DEFAULT_PREFS: MapDisplayPrefs = {
  mapStyle: "dark",
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
 * sur les épingles), persistées en `localStorage` — contrairement au scénario
 * partagé (Plan 6a/6b), ce sont des préférences d'affichage personnelles, pas
 * une donnée métier. Même pattern SSR-safe que `useLocalStorageSet`
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/hooks/use-map-display-prefs.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/use-map-display-prefs.ts
git commit -m "feat(carte): hook useMapDisplayPrefs — style + champs épingle persistés en localStorage"
```

---

### Task 2: `formatCompactEUR` + icône `IconSliders`

**Files:**
- Modify: `src/lib/format.ts`
- Modify: `src/components/ui/Icon.tsx`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces : `formatCompactEUR(value: number | null): string` (`@/lib/format`), consommé par Task 3 (`MapCanvas`). `IconSliders(props: IconProps): JSX.Element` (`@/components/ui/Icon`), consommé par Task 4 (`MapSettingsPanel`).

- [ ] **Step 1: Ajouter `formatCompactEUR`**

Dans `src/lib/format.ts`, ajouter à la fin du fichier :

```ts

/** Prix compact pour les étiquettes d'épingle de carte — arrondi au millier,
 *  jamais de décimales (`250k €`, pas `250,4k €`) : la densité prime quand
 *  plusieurs biens sont proches sur la carte. */
export function formatCompactEUR(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k €`;
  }
  return formatEUR(value);
}
```

- [ ] **Step 2: Ajouter `IconSliders`**

Dans `src/components/ui/Icon.tsx`, ajouter après `IconArchive` (fin du fichier) :

```tsx

/** Réglages — trois graduations, dans la grammaire de l'instrument (comme
 *  `IconGauge`), pour le widget de personnalisation de la carte. */
export const IconSliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Svg>
);
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/lib/format.ts src/components/ui/Icon.tsx
git commit -m "feat(carte): formatCompactEUR + icône IconSliders (widget Paramètres)"
```

---

### Task 3: `MapCanvas.tsx` — carte MapLibre (créée une fois), épingles, style, popup

**Files:**
- Create: `src/components/app/MapCanvas.tsx`
- Modify: `src/app/globals.css` (section CARTE)

**Interfaces:**
- Consumes: `computeInvestmentMetrics` (`@/lib/calc/metrics`) · `computeScoreSur100` (`@/lib/calc/scoring`) · `verdictFromScore`, `VERDICT_HEX` (`@/lib/verdict`) · `formatEUR`, `formatM2`, `formatCompactEUR` (`@/lib/format`, Task 2) · `STATUS_COLUMNS` (`@/lib/pipeline-types`) · `type MapDisplayPrefs`, `type MapStyleKey` (`@/lib/hooks/use-map-display-prefs`, Task 1) · `type GeolocatedProperty` (`@/components/app/MapView`) · `type PropertyRow`, `type PropertyScenarioRow` (`@/lib/property-detail-types`).
- Produces: `MapCanvas({ properties: GeolocatedProperty[]; scenario: PropertyScenarioRow; displayPrefs: MapDisplayPrefs; projectId: string })`. Consommé par Task 5 (`MapView`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/MapCanvas.tsx` :

```tsx
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
```

- [ ] **Step 2: Mettre à jour le CSS de la carte**

Dans `src/app/globals.css`, remplacer le bloc (posé au Plan 6a) :

```css
.estio-map .maplibregl-canvas {
  filter: saturate(0.28) sepia(0.22) brightness(0.8) contrast(1.1);
}

.estio-map .maplibregl-ctrl-attrib {
  background: rgb(11 10 9 / 0.72) !important;
  backdrop-filter: blur(4px);
  border-radius: var(--r-xs) 0 0 0;
  font-size: 10px;
  padding: 2px 6px;
}
.estio-map .maplibregl-ctrl-attrib a {
  color: var(--bone-400);
}
.estio-map .maplibregl-ctrl-attrib-button {
  filter: invert(1) opacity(0.4);
}

.estio-pin {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  cursor: pointer;
  transition: transform var(--t-base) var(--e-focal);
}
.estio-pin:hover {
  transform: scale(1.3);
}
.estio-pin i {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgb(11 10 9 / 0.9);
}
```

par :

```css
/* Le filtre désaturé n'a de sens que sur le style Sombre — les styles
   Clair/Détaillé (widget Paramètres) s'affichent avec leurs couleurs
   d'origine. `.estio-map--dark` est posé conditionnellement par MapView. */
.estio-map.estio-map--dark .maplibregl-canvas {
  filter: saturate(0.28) sepia(0.22) brightness(0.8) contrast(1.1);
}

.estio-map .maplibregl-ctrl-attrib {
  background: rgb(11 10 9 / 0.72) !important;
  backdrop-filter: blur(4px);
  border-radius: var(--r-xs) 0 0 0;
  font-size: 10px;
  padding: 2px 6px;
}
.estio-map .maplibregl-ctrl-attrib a {
  color: var(--bone-400);
}
.estio-map .maplibregl-ctrl-attrib-button {
  filter: invert(1) opacity(0.4);
}

.estio-pin {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  cursor: pointer;
  transition: transform var(--t-base) var(--e-focal);
}
.estio-pin:hover {
  transform: scale(1.08);
}
.estio-pin i {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgb(11 10 9 / 0.9);
}

.estio-map .maplibregl-popup-content {
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--r-md);
  padding: 12px 14px;
  box-shadow: 0 20px 60px -15px rgb(0 0 0 / 0.6);
}
.estio-map .maplibregl-popup-tip {
  border-top-color: var(--surface) !important;
  border-bottom-color: var(--surface) !important;
}
.estio-map .maplibregl-popup-close-button {
  color: var(--text-3);
  font-size: 16px;
  padding: 4px 8px;
}
.estio-map .maplibregl-popup-close-button:hover {
  color: var(--text);
  background: transparent;
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: erreur attendue sur l'import `type { GeolocatedProperty } from "@/components/app/MapView"` si `MapView.tsx` ne l'exporte pas encore avec la même forme — non, `GeolocatedProperty` est déjà exporté par `MapView.tsx` depuis le Plan 6a, donc aucune erreur attendue ici. Si `MapView.tsx` n'a pas encore été modifié (Task 5), tout doit rester vert.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/MapCanvas.tsx src/app/globals.css
git commit -m "feat(carte): MapCanvas — carte créée une fois, épingles avec étiquette, popup au clic"
```

---

### Task 4: `MapSettingsPanel.tsx` — widget à 2 onglets

**Files:**
- Create: `src/components/app/MapSettingsPanel.tsx`

**Interfaces:**
- Consumes: `IconButton` (`@/components/ui/Button`) · `Toggle` (`@/components/ui/Controls`) · `FieldSet`, `Checkbox` (`@/components/ui/Field`) · `IconSliders`, `IconClose` (`@/components/ui/Icon`, Task 2) · `SectionScenario` (`@/components/app/fiche/SectionScenario`) · `type MapDisplayPrefs`, `type MapStyleKey` (`@/lib/hooks/use-map-display-prefs`, Task 1) · `type PropertyScenarioRow` (`@/lib/property-detail-types`).
- Produces: `MapSettingsPanel({ scenario: PropertyScenarioRow | null; onScenarioChange: (patch: Partial<PropertyScenarioRow>) => void; displayPrefs: MapDisplayPrefs; onDisplayPrefsChange: (patch: Partial<MapDisplayPrefs>) => void })`. Consommé par Task 5 (`MapView`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/MapSettingsPanel.tsx` :

```tsx
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/MapSettingsPanel.tsx
git commit -m "feat(carte): MapSettingsPanel — widget Scénario + Affichage"
```

---

### Task 5: `MapView.tsx` — orchestrateur (state + branchement)

**Files:**
- Modify: `src/components/app/MapView.tsx` (réécriture complète du fichier)

**Interfaces:**
- Consumes: `MapCanvas` (`@/components/app/MapCanvas`, Task 3) · `MapSettingsPanel` (`@/components/app/MapSettingsPanel`, Task 4) · `useMapDisplayPrefs` (`@/lib/hooks/use-map-display-prefs`, Task 1) · `Empty` (`@/components/ui/Feedback`) · `ButtonLink` (`@/components/ui/Button`) · `IconMap`, `IconTable` (`@/components/ui/Icon`) · `VERDICT_HEX` (`@/lib/verdict`) · `type PropertyRow`, `type PropertyScenarioRow` (`@/lib/property-detail-types`).
- Produces: `export type GeolocatedProperty = PropertyRow & { lat: number; lng: number }` (inchangé) · `MapView({ properties: GeolocatedProperty[]; scenario: PropertyScenarioRow | null; unlocatedCount: number; projectId: string })` (signature inchangée). Consommé par `page.tsx` (déjà câblé au Plan 6a, aucun changement requis là-bas).

- [ ] **Step 1: Remplacer tout le contenu du fichier**

Fichier `src/components/app/MapView.tsx` (remplace entièrement le fichier existant) :

```tsx
"use client";

import { useState } from "react";
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
 * Vue Carte — orchestrateur. Porte le state (scénario partagé éphémère,
 * préférences d'affichage persistées) et branche `MapCanvas` (mécanique
 * MapLibre) + `MapSettingsPanel` (widget). Aucune logique de carte ici : voir
 * `MapCanvas.tsx` pour le pourquoi de la séparation (la carte ne doit jamais
 * être recréée quand ce state change).
 */
export function MapView({
  properties,
  scenario: initialScenario,
  unlocatedCount,
  projectId,
}: {
  properties: GeolocatedProperty[];
  scenario: PropertyScenarioRow | null;
  unlocatedCount: number;
  projectId: string;
}) {
  const [scenario, setScenario] = useState(initialScenario);
  const [displayPrefs, updateDisplayPrefs] = useMapDisplayPrefs();

  function handleScenarioChange(patch: Partial<PropertyScenarioRow>) {
    setScenario((current) => (current ? { ...current, ...patch } : current));
  }

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
        <MapSettingsPanel
          scenario={scenario}
          onScenarioChange={handleScenarioChange}
          displayPrefs={displayPrefs}
          onDisplayPrefsChange={updateDisplayPrefs}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur — c'est cette tâche qui referme la boucle de types entre `MapCanvas`/`MapSettingsPanel`/`useMapDisplayPrefs` (Tasks 1, 3, 4) et leur point d'usage réel.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/MapView.tsx
git commit -m "feat(carte): MapView orchestre MapCanvas + MapSettingsPanel"
```

---

### Task 6: Vérification finale (build, lint, QA manuelle)

**Files:** aucun fichier créé — tâche de vérification uniquement.

**Interfaces:** N/A.

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: build réussi, aucune erreur TypeScript ni erreur de build.

- [ ] **Step 2: Lint complet**

Run: `npm run lint`
Expected: 0 erreur. Warnings préexistants hors périmètre (`public/proto/data.js`) attendus, aucun nouveau warning sur les fichiers touchés par ce plan.

- [ ] **Step 3: QA manuelle — build de production isolé**

Le mode dev de ce repo peut masquer de vrais bugs (voir le commentaire dans `next.config.ts` sur ce sujet, confirmé lors du diagnostic du Plan 6a). Vérifier sur un build de production séparé :

```bash
node -e "require('fs').rmSync('.next-verif', { recursive: true, force: true })"
NEXT_DIST_DIR=.next-verif npx next build
NEXT_DIST_DIR=.next-verif npx next start -p 3100
```

Puis ouvrir `http://localhost:3100/app/p/<projectId>?view=carte` (un projet seedé avec des biens géolocalisés) et vérifier :
- Chaque épingle affiche son prix compact (`250k €`) à côté du point coloré.
- Le bouton réglages (icône curseurs) ouvre un panneau à 2 onglets « Scénario » / « Affichage ».
- Onglet Affichage : cocher Surface et/ou Statut ajoute ces informations à l'étiquette de chaque épingle **sans recharger la carte** (pas de flash/rechargement de tuiles). Changer de style de carte (Sombre/Clair/Détaillé) change le fond **sans faire disparaître les épingles**.
- Onglet Scénario : bouger un curseur recalcule les épingles (couleur/score) **sans recharger la carte** — mêmes tuiles, même zoom, même position.
- Clic sur une épingle : une popup s'ouvre avec adresse, ville, verdict, score, prix, surface, et un lien « Analyse complète → » qui mène bien à la fiche du bien. Cliquer sur une autre épingle remplace la popup. Cliquer ailleurs sur la carte la ferme.
- Recharger la page : le style de carte et les cases Surface/Statut restent tels que configurés (persistance `localStorage`) ; le scénario, lui, revient à sa valeur initiale (jamais persisté — comportement voulu).

Arrêter le serveur de vérification une fois la QA terminée (`Ctrl+C`, ou tuer le process sur le port 3100) et supprimer `.next-verif` :

```bash
node -e "require('fs').rmSync('.next-verif', { recursive: true, force: true })"
```

- [ ] **Step 4: Commit final (si des ajustements ont été faits pendant la QA)**

```bash
git add -A
git commit -m "fix(carte): ajustements post-QA manuelle widget Paramètres"
```

(Ne committer que si la QA a nécessité une correction — sinon cette étape est un no-op.)

---

## Self-Review (fait par l'auteur du plan avant remise)

- **Couverture de la spec** (`2026-08-08-carte-widget-parametres-design.md`) : architecture (bouton + panneau 2 onglets, state scénario/affichage) → Tasks 4, 5 · styles de carte disponibles → Tasks 1, 3, 4 · étiquette de prix + champs optionnels → Task 3 · popup au clic → Task 3 · persistance (`localStorage` affichage, scénario éphémère) → Tasks 1, 5 · erreurs & cas limites (localStorage indisponible, surface null, style pendant chargement) → Tasks 1, 3.
- **Cohérence des types** : `MapDisplayPrefs`/`MapStyleKey` définis une seule fois (Task 1), réutilisés identiquement par `MapCanvas` (Task 3), `MapSettingsPanel` (Task 4) et `MapView` (Task 5) — aucune redéfinition divergente. Signature de `MapCanvas` (Task 3) et son appel dans `MapView` (Task 5) vérifiés champ par champ (`properties`, `scenario`, `displayPrefs`, `projectId`) ; idem pour `MapSettingsPanel`.
- **Point d'architecture central vérifié** : la carte MapLibre (Task 3, Effet 1) n'a **aucune dépendance** sur `scenario`/`displayPrefs`/`properties` — seuls les Effets 2 (épingles) et 3 (style) en dépendent, sans jamais recréer l'objet `Map`. C'était la principale contrainte du brainstorm (éviter de recharger toute la carte à chaque mouvement de curseur), donc explicitement vérifiée ici plutôt que supposée.
- **Aucun placeholder** : chaque étape contient le code complet, aucun "TODO"/"à compléter".
