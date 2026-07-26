# Plan 6a — Vue Carte : fondations (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le placeholder grisé de la vue Carte (`?view=carte`) par une vraie carte MapLibre affichant une épingle colorée par bien géolocalisé du projet, couleur = verdict (score/100) calculé une seule fois avec le scénario du premier bien du projet.

**Architecture:** `page.tsx` (Server Component, branche `view === "carte"`) récupère tous les biens du projet (`properties.select("*")`), sépare ceux avec `lat`/`lng` renseignés des autres, et récupère un scénario (`property_scenarios`) pour amorcer le calcul de score. Un nouveau composant client `MapView` initialise MapLibre GL JS (import dynamique dans un `useEffect`, jamais au chargement serveur), place une épingle par bien géolocalisé colorée selon son verdict (`computeInvestmentMetrics` + `computeScoreSur100` + `computeVerdictFromScore`, déjà écrits au Plan 5b — aucune nouvelle formule), et affiche un état vide dédié si aucun bien n'a de coordonnées.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase. Nouvelle dépendance npm : `maplibre-gl` (BSD-3, tuiles vecteur gratuites via OpenFreeMap, sans clé API).

## Global Constraints

- **Spec de référence :** `docs/superpowers/specs/2026-07-26-plan-6-vue-carte-design.md`, validée par l'utilisateur. En cas de doute, cette spec fait foi.
- **Aucun framework de test dans ce repo.** Vérification de chaque tâche = `npx tsc --noEmit`, puis `npm run build` + `npm run lint` en fin de plan (doivent rester verts) + vérification manuelle via `npm run dev`. **Ne jamais écrire de test unitaire.**
- **Ce plan pose uniquement les fondations.** Le scénario utilisé pour calculer le score des épingles est **fixe** dans ce plan (celui du premier bien du projet, jamais modifié par l'utilisateur) — le panneau de curseurs éditable partagé, avec recalcul en direct limité au viewport, est le **Plan 6b** (hors-scope ici). L'aperçu au clic sur une épingle (`MapPropertyPopup`) est le **Plan 6c** (hors-scope ici, aucun gestionnaire de clic sur les épingles dans ce plan).
- **Moteur de calcul = réutilisation stricte de l'existant, aucune nouvelle formule.** `computeInvestmentMetrics` (`@/lib/calc/metrics`), `computeScoreSur100`/`computeVerdictFromScore` (`@/lib/calc/scoring`) — tous écrits au Plan 5b, inchangés.
- **Lib carto : MapLibre GL JS + tuiles vecteur OpenFreeMap**, style `https://tiles.openfreemap.org/styles/dark` (gratuit, sans clé API, sans compte). Import dynamique (`await import("maplibre-gl")`) **à l'intérieur d'un `useEffect`** — jamais d'import statique exécuté côté serveur, MapLibre GL JS nécessite le DOM. Le CSS (`maplibre-gl/dist/maplibre-gl.css`) est importé statiquement en tête de `MapView.tsx` (Next.js supporte l'import de CSS de `node_modules` depuis n'importe quel fichier de `app/`).
- **3ᵉ exception lib UI validée** (après `@dnd-kit` et `browser-image-compression`).
- **Couleurs des épingles = valeurs hex des tokens existants**, pas de nouvelle palette : `#7fa98c` (`--score-high`, verdicts `pepite`/`solide`), `#e0a06a` (`--score-mid`, verdict `correct`), `#d8a7a0` (`--score-low`, verdict `a_eviter`) — voir `src/design/tokens.css`. MapLibre ne peut pas consommer les classes Tailwind ni `var(--color-score-high)` dans une propriété de paint/DOM appliquée dynamiquement en JS, d'où la constante hex dédiée dans `MapView.tsx`.
- **Accès données** : `getDemoClient()` + filtre explicite `project_id` + `user_id = DEMO_USER_ID` sur toutes les lectures, comme le reste du fichier `page.tsx`. Pas d'auth réelle (Phase 5).
- **Identité = dark grotesk** des tokens existants : `bg-bg`, `text-text`, `text-muted`, `text-faint`, `border-border`, `text-brand`. Aucune couleur hors tokens (sauf les 3 hex d'épingles ci-dessus, qui **sont** les tokens, juste exprimés en hex pour MapLibre).
- **Hors-scope de ce plan** : panneau de scénario éditable + recalcul limité au viewport (Plan 6b), aperçu au clic sur une épingle (Plan 6c), géocodage réel des adresses (Plan 8), toute action d'édition depuis la carte, deep-link `?bien=` vers un bien précis sur la carte.

---

### Task 1: Installer la dépendance `maplibre-gl`

**Files:**
- Modify: `package.json` (généré par la commande, pas d'édition manuelle)
- Modify: `package-lock.json` (généré par la commande)

**Interfaces:** N/A — pas de code produit par cette tâche.

- [ ] **Step 1: Installer la dépendance**

Run: `npm install maplibre-gl`
Expected: la commande se termine sans erreur ; `package.json` gagne une entrée `"maplibre-gl": "^X.Y.Z"` dans `dependencies`.

- [ ] **Step 2: Vérifier l'installation**

Run: `npx tsc --noEmit`
Expected: aucune nouvelle erreur (le paquet n'est pas encore importé nulle part).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(carte): ajoute la dépendance maplibre-gl (Plan 6a)"
```

---

### Task 2: `MapView.tsx` — carte MapLibre + épingles colorées

**Files:**
- Create: `src/components/app/MapView.tsx`

**Interfaces:**
- Consumes: `computeInvestmentMetrics` (`@/lib/calc/metrics`) · `computeScoreSur100`, `computeVerdictFromScore` (`@/lib/calc/scoring`) · `type Verdict` (`@/lib/calc/score`) · `PropertyRow`, `PropertyScenarioRow` (`@/lib/property-detail-types`).
- Produces: `export type GeolocatedProperty = PropertyRow & { lat: number; lng: number }` et `MapView({ properties: GeolocatedProperty[]; scenario: PropertyScenarioRow | null; unlocatedCount: number; projectId: string })`. Consommé par Task 3 (`page.tsx`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/MapView.tsx` :

```tsx
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

    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [properties[0].lng, properties[0].lat],
        zoom: 11,
      });
      mapRef.current = map;

      map.on("load", () => {
        if (properties.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
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

          new maplibregl.Marker({ element: el }).setLngLat([property.lng, property.lat]).addTo(map);
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/MapView.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/MapView.tsx
git commit -m "feat(carte): MapView — carte MapLibre + épingles colorées par verdict (Plan 6a)"
```

---

### Task 3: `page.tsx` — branche `carte` : query + rendu de `MapView`

**Files:**
- Modify: `src/app/(app)/app/p/[projectId]/page.tsx` (réécriture complète du fichier)

**Interfaces:**
- Consumes: `MapView`, `type GeolocatedProperty` (`@/components/app/MapView`, Task 2) · `PropertyRow`, `PropertyScenarioRow` (`@/lib/property-detail-types`) · le reste inchangé (`ViewTabs`, `PipelineBoard`, `PropertyTable`, `getDemoClient`, `DEMO_USER_ID`, `daysSince`, types `pipeline-types`).
- Produces: `ProjectBoardPage` — comportement inchangé pour `pipeline`/`tableau`, nouvelle logique pour `carte`.

- [ ] **Step 1: Remplacer tout le contenu du fichier**

Fichier `src/app/(app)/app/p/[projectId]/page.tsx` (remplace entièrement le fichier existant) :

```tsx
import { ViewTabs, type ViewKey } from "@/components/app/ViewTabs";
import { PipelineBoard } from "@/components/app/PipelineBoard";
import { PropertyTable } from "@/components/app/PropertyTable";
import { MapView, type GeolocatedProperty } from "@/components/app/MapView";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { daysSince } from "@/lib/format";
import type { NoteKind, PipelineNote, PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export const dynamic = "force-dynamic";

function hasCoordinates(property: PropertyRow): property is GeolocatedProperty {
  return property.lat !== null && property.lng !== null;
}

export default async function ProjectBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;
  const active: ViewKey = view === "tableau" || view === "carte" ? view : "pipeline";
  const supabase = getDemoClient();

  if (active === "carte") {
    const { data: rawCarteProperties } = await supabase
      .from("properties")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", DEMO_USER_ID);

    const allProperties = rawCarteProperties ?? [];
    const geolocated = allProperties.filter(hasCoordinates);
    const unlocatedCount = allProperties.length - geolocated.length;

    let seedScenario: PropertyScenarioRow | null = null;
    if (geolocated.length > 0) {
      const { data: scenarios } = await supabase
        .from("property_scenarios")
        .select("*")
        .in(
          "property_id",
          geolocated.map((p) => p.id),
        )
        .eq("user_id", DEMO_USER_ID)
        .limit(1);
      seedScenario = scenarios?.[0] ?? null;
    }

    return (
      <div className="flex flex-1 flex-col">
        <ViewTabs projectId={projectId} active={active} />
        <MapView
          properties={geolocated}
          scenario={seedScenario}
          unlocatedCount={unlocatedCount}
          projectId={projectId}
        />
      </div>
    );
  }

  const { data: rawProperties } = await supabase
    .from("properties")
    .select(
      "id, status, board_position, address, city, postal_code, property_type, surface_carrez, asking_price, works_estimate, estimated_rent, max_price, discard_reason, created_at",
    )
    .eq("project_id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .order("board_position");

  const properties = rawProperties ?? [];
  const propertyIds = properties.map((p) => p.id);

  let rawNotes: { id: string; property_id: string; kind: NoteKind; body: string; created_at: string }[] = [];
  let rawHistory: { property_id: string; to_status: PropertyStatus; created_at: string }[] = [];

  if (propertyIds.length > 0) {
    const [notesRes, historyRes] = await Promise.all([
      supabase
        .from("property_notes")
        .select("id, property_id, kind, body, created_at")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("status_history")
        .select("property_id, to_status, created_at")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false }),
    ]);
    rawNotes = notesRes.data ?? [];
    rawHistory = historyRes.data ?? [];
  }

  const notesByProperty = new Map<string, PipelineNote[]>();
  for (const note of rawNotes) {
    const list = notesByProperty.get(note.property_id) ?? [];
    list.push({ id: note.id, kind: note.kind, body: note.body, created_at: note.created_at });
    notesByProperty.set(note.property_id, list);
  }

  const statusByProperty = new Map(properties.map((p) => [p.id, p.status]));
  const lastStatusChangeByProperty = new Map<string, string>();
  for (const entry of rawHistory) {
    if (entry.to_status !== statusByProperty.get(entry.property_id)) continue;
    if (!lastStatusChangeByProperty.has(entry.property_id)) {
      lastStatusChangeByProperty.set(entry.property_id, entry.created_at);
    }
  }

  const pipelineProperties: PipelineProperty[] = properties.map((p) => {
    const referenceDate = lastStatusChangeByProperty.get(p.id) ?? p.created_at;
    return {
      id: p.id,
      status: p.status,
      board_position: p.board_position,
      address: p.address,
      city: p.city,
      postal_code: p.postal_code,
      property_type: p.property_type,
      surface_carrez: p.surface_carrez,
      asking_price: p.asking_price,
      works_estimate: p.works_estimate,
      estimated_rent: p.estimated_rent,
      max_price: p.max_price,
      discard_reason: p.discard_reason,
      daysInStatus: daysSince(referenceDate),
      notes: notesByProperty.get(p.id) ?? [],
    };
  });

  return (
    <div className="flex flex-1 flex-col">
      <ViewTabs projectId={projectId} active={active} />
      {active === "pipeline" ? (
        <PipelineBoard projectId={projectId} initialProperties={pipelineProperties} />
      ) : (
        <PropertyTable projectId={projectId} initialProperties={pipelineProperties} />
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
git add "src/app/(app)/app/p/[projectId]/page.tsx"
git commit -m "feat(carte): branche view=carte génère les données et rend MapView (Plan 6a)"
```

---

### Task 4: Vérification finale (build, lint, QA manuelle)

**Files:** aucun fichier créé — tâche de vérification uniquement.

**Interfaces:** N/A.

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: build réussi, aucune erreur TypeScript ni erreur de build. Si une erreur mentionne `window is not defined` ou un import SSR de `maplibre-gl`, vérifier que l'import dynamique (`import("maplibre-gl")`) est bien resté à l'intérieur du `useEffect` de `MapView.tsx` et non déplacé en tête de fichier.

- [ ] **Step 2: Lint complet**

Run: `npm run lint`
Expected: 0 erreur. Warnings préexistants hors périmètre (fichier `animation-estio/scrub-engine.js`, déjà notés aux Plans 5a/5b/5c) attendus, aucun nouveau warning sur les fichiers touchés par ce plan.

- [ ] **Step 3: QA manuelle**

Run: `npm run dev`, ouvrir dans le navigateur `/app/p/<projectId>?view=carte` pour un projet seedé avec des biens à Lyon.

Vérifier :
- La carte s'affiche avec un fond sombre (style OpenFreeMap `dark`), centrée/zoomée pour englober tous les biens géolocalisés.
- Une épingle colorée apparaît pour chaque bien (couleur cohérente avec le verdict visible sur sa fiche : sauge = pépite/solide, ambre = correct, rose = à éviter).
- Si le projet seedé n'a que des biens géolocalisés (cas attendu du seed démo), le message « N biens sans localisation » n'apparaît pas.
- Naviguer vers un projet sans aucun bien géolocalisé (ou vider temporairement `lat`/`lng` d'un bien en base pour tester) : le message « Aucun bien à afficher sur la carte » + le lien « Voir le tableau → » s'affichent, et le lien fonctionne.
- Les onglets Pipeline/Tableau/Carte restent tous les trois cliquables et cohérents entre eux (aucune régression sur les vues déjà validées).

- [ ] **Step 4: Commit final (si des ajustements ont été faits pendant la QA)**

```bash
git add -A
git commit -m "fix(carte): ajustements post-QA manuelle Plan 6a"
```

(Ne committer que si la QA a nécessité une correction — sinon cette étape est un no-op.)

---

## Self-Review (fait par l'auteur du plan avant remise)

- **Couverture de la spec** (`2026-07-26-plan-6-vue-carte-design.md`) : lib carto MapLibre + OpenFreeMap → Task 1, 2 · architecture & flux de données (query, exclusion des biens sans coordonnées, compteur) → Task 3 · couleur d'épingle = verdict → Task 2 · cas limites « aucun bien géolocalisé » → Task 2 (état vide dans `MapView`). Le panneau de scénario éditable et le recalcul limité au viewport (Plan 6b) et l'aperçu au clic (Plan 6c) sont explicitement hors-scope de ce plan, comme indiqué dans les Global Constraints — pas de tâche correspondante ici par construction.
- **Cohérence des types** : `GeolocatedProperty` défini une seule fois dans `MapView.tsx` (Task 2), réutilisé tel quel par `hasCoordinates`/`page.tsx` (Task 3) — pas de redéfinition divergente. Signature de `MapView` (Task 2) et son appel dans `page.tsx` (Task 3) vérifiés champ par champ (`properties`, `scenario`, `unlocatedCount`, `projectId`).
- **Aucun placeholder** : chaque étape contient le code complet, aucun "TODO"/"à compléter". L'URL de style OpenFreeMap (`https://tiles.openfreemap.org/styles/dark`) a été vérifiée sur la documentation officielle avant d'être écrite dans le plan.
