# Plan 4 — Vue Tableau — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le placeholder « Vue Tableau » de `/app/p/[projectId]?view=tableau` par une table dense et triable de tous les biens du projet, avec colonnes personnalisables (persistées), filtre par statut, tri par colonne, et le même drawer d'aperçu que la vue Pipeline.

**Architecture:** La logique de drawer/statut/note de `PipelineBoard` (Plan 3) est extraite dans un hook partagé `usePropertyDrawer`, réutilisé par `PipelineBoard` (refactor, comportement inchangé) et par le nouveau `PropertyTable`. Les colonnes de la table sont définies déclarativement dans `src/lib/table-columns.tsx` (une config unique pour le picker de colonnes et le rendu des cellules, réutilisant `computeRendementBrutPct`/`computeVerdict` et les formatters du Plan 3). La sélection de colonnes est persistée en `localStorage` via un petit hook générique `useLocalStorageSet`. `page.tsx` fait une seule requête Supabase partagée entre les vues Pipeline et Tableau (la vue Carte reste un placeholder, Plan 6).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 (tokens `src/design/tokens.css`), Supabase (`getDemoClient()`). Pas de nouvelle dépendance npm.

## Global Constraints

- **Desktop-first** ; pas de traitement mobile particulier (spec §2.1 du build global).
- **Identité = dark grotesk** des tokens existants : `bg-bg`, `bg-bg-alt`, `text-text`, `text-muted`, `text-faint`, `text-brand`, `bg-brand`, `border-border`, `border-border-strong`, `text-score-high`/`bg-score-high`, `text-score-mid`/`bg-score-mid`, `text-score-low`/`bg-score-low`. Aucune couleur hors tokens.
- **Pas de lib d'icônes/UI** : tout fait main (texte, `▲`/`▼`, `✕`). Pas de nouvelle dépendance (le picker de colonnes et les chips sont du HTML/CSS fait main, pas de lib de `<select>`/dropdown).
- **Aucun framework de test dans ce repo.** Vérification de chaque tâche = `npx tsc --noEmit` après chaque fichier, puis `npm run build` + `npm run lint` en fin de plan (doivent rester verts), + vérification manuelle via `npm run dev`.
- **Accès données** : `getDemoClient()` + filtre explicite `user_id = DEMO_USER_ID`, `project_id` sur les écritures. Pas d'auth réelle (Phase 5).
- **`page.tsx` garde `export const dynamic = "force-dynamic";`.**
- **Composants app → `src/components/app/`, helpers/hooks purs → `src/lib/`.**
- **Réutiliser tel quel** (ne pas redéfinir) : `PipelineProperty`/`PropertyStatus`/`STATUS_COLUMNS` (`src/lib/pipeline-types.ts`), `computeRendementBrutPct`/`computeVerdict`/`verdictLabel`/`Verdict` (`src/lib/calc/score.ts`), `formatEUR`/`formatM2`/`formatPercent`/`formatPricePerM2` (`src/lib/format.ts`), `computeDropPosition` (`src/lib/board-position.ts`), `moveProperty`/`addQuickNote` (`src/app/(app)/app/p/[projectId]/actions.ts`), `PropertyDrawer`/`DiscardReasonModal`/`VerdictBadge` (`src/components/app/`).
- **Adresse toujours visible dans le tableau, jamais décochable** (garde-fou anti-table-sans-repère).
- **Aucun changement de statut inline dans la table** : uniquement via le drawer (une seule façon de faire l'action, cohérence avec le board).
- **Hors-scope de ce plan** : page "Analyse complète" (Plan 5), vue Carte (Plan 6), pondérations/profils de score (Plan 7), flux d'ajout de bien (Plan 8), upload photos/documents (Plan 5).

---

### Task 1: Extraire `usePropertyDrawer` et refactorer `PipelineBoard`

**Files:**
- Create: `src/lib/hooks/use-property-drawer.ts`
- Modify: `src/components/app/PipelineBoard.tsx`

**Interfaces:**
- Consumes: `PipelineProperty`, `PropertyStatus`, `STATUS_COLUMNS` (`@/lib/pipeline-types`), `computeDropPosition` (`@/lib/board-position`), `moveProperty`, `addQuickNote` (`@/app/(app)/app/p/[projectId]/actions`).
- Produces: `usePropertyDrawer(projectId: string, initialProperties: PipelineProperty[])` retournant `{ properties: PipelineProperty[], columns: Map<PropertyStatus, PipelineProperty[]>, selectedProperty: PipelineProperty | null, error: string | null, pendingDiscard: { propertyId: string; fromStatus: PropertyStatus; newPosition: number } | null, openDrawer(id: string): void, closeDrawer(): void, performMove(propertyId: string, toStatus: PropertyStatus, destIndex: number): void, handleStatusChange(status: PropertyStatus): void, handleAddNote(body: string): Promise<void>, confirmDiscard(reason: string): void, cancelDiscard(): void }`. Consommé par Task 1 (PipelineBoard refactoré) et Task 4 (PropertyTable).

- [ ] **Step 1: Écrire le hook (extraction mécanique de la logique existante de `PipelineBoard`)**

Fichier `src/lib/hooks/use-property-drawer.ts` :

```ts
"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { computeDropPosition } from "@/lib/board-position";
import { moveProperty, addQuickNote } from "@/app/(app)/app/p/[projectId]/actions";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

type PendingDiscard = {
  propertyId: string;
  fromStatus: PropertyStatus;
  newPosition: number;
};

/** Logique partagée entre la vue Pipeline (board) et la vue Tableau : état des
 *  biens, ouverture/fermeture du drawer via le paramètre d'URL `bien`,
 *  déplacement de statut (avec position fractionnée), ajout de note optimiste,
 *  et le passage obligatoire par une raison quand un bien est écarté. */
export function usePropertyDrawer(projectId: string, initialProperties: PipelineProperty[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState(initialProperties);
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const columns = useMemo(() => {
    const grouped = new Map<PropertyStatus, PipelineProperty[]>();
    for (const col of STATUS_COLUMNS) grouped.set(col.key, []);
    for (const property of properties) {
      grouped.get(property.status)?.push(property);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => a.board_position - b.board_position);
    }
    return grouped;
  }, [properties]);

  const selectedId = searchParams.get("bien");
  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  function openDrawer(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bien", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("bien");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function applyMove(
    propertyId: string,
    fromStatus: PropertyStatus,
    toStatus: PropertyStatus,
    newPosition: number,
    discardReason?: string,
  ) {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              status: toStatus,
              board_position: newPosition,
              daysInStatus: 0,
              discard_reason: toStatus === "ecarte" ? (discardReason ?? null) : null,
            }
          : p,
      ),
    );

    startTransition(async () => {
      try {
        await moveProperty({ projectId, propertyId, fromStatus, toStatus, newPosition, discardReason });
      } catch {
        setError("Le déplacement n'a pas pu être enregistré. Réessaie.");
        router.refresh();
      }
    });
  }

  function performMove(propertyId: string, toStatus: PropertyStatus, destIndex: number) {
    const source = properties.find((p) => p.id === propertyId);
    if (!source) return;
    const fromStatus = source.status;
    const destColumn = columns.get(toStatus) ?? [];

    if (fromStatus === toStatus && destIndex === destColumn.findIndex((p) => p.id === propertyId)) {
      return;
    }

    const destOthers = destColumn.filter((p) => p.id !== propertyId);
    const clampedIndex = Math.min(Math.max(destIndex, 0), destOthers.length);
    const newPosition = computeDropPosition(
      destOthers.map((p) => p.board_position),
      clampedIndex,
    );

    if (toStatus === "ecarte" && fromStatus !== "ecarte") {
      setPendingDiscard({ propertyId, fromStatus, newPosition });
      return;
    }

    applyMove(propertyId, fromStatus, toStatus, newPosition);
  }

  function handleStatusChange(status: PropertyStatus) {
    if (!selectedProperty) return;
    performMove(selectedProperty.id, status, (columns.get(status) ?? []).length);
  }

  function confirmDiscard(reason: string) {
    if (!pendingDiscard) return;
    applyMove(pendingDiscard.propertyId, pendingDiscard.fromStatus, "ecarte", pendingDiscard.newPosition, reason);
    setPendingDiscard(null);
  }

  function cancelDiscard() {
    setPendingDiscard(null);
  }

  function handleAddNote(body: string): Promise<void> {
    if (!selectedProperty) return Promise.resolve();
    const propertyId = selectedProperty.id;
    const optimisticNote = {
      id: `optimistic-${Date.now()}`,
      kind: "note" as const,
      body,
      created_at: new Date().toISOString(),
    };
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, notes: [optimisticNote, ...p.notes] } : p)),
    );
    return addQuickNote(propertyId, body)
      .then((saved) => {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  notes: p.notes.map((n) =>
                    n.id === optimisticNote.id ? { ...n, id: saved.id, created_at: saved.created_at } : n,
                  ),
                }
              : p,
          ),
        );
      })
      .catch(() => {
        setError("La note n'a pas pu être enregistrée. Réessaie.");
        router.refresh();
      });
  }

  return {
    properties,
    columns,
    selectedProperty,
    error,
    pendingDiscard,
    openDrawer,
    closeDrawer,
    performMove,
    handleStatusChange,
    handleAddNote,
    confirmDiscard,
    cancelDiscard,
  };
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/hooks/use-property-drawer.ts`.

- [ ] **Step 3: Refactorer `PipelineBoard` pour utiliser le hook**

Remplacer le contenu de `src/components/app/PipelineBoard.tsx` par :

```tsx
"use client";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { PipelineColumn } from "@/components/app/PipelineColumn";
import { PropertyDrawer } from "@/components/app/PropertyDrawer";
import { DiscardReasonModal } from "@/components/app/DiscardReasonModal";
import { usePropertyDrawer } from "@/lib/hooks/use-property-drawer";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

/** Retrouve le statut (donc la colonne) qui contient `propertyId`, à partir du
 *  regroupement exposé par `usePropertyDrawer`. Utilisé par `handleDragEnd`
 *  quand on dépose une carte sur une autre carte plutôt que sur une colonne vide. */
function findPropertyStatus(
  columns: Map<PropertyStatus, PipelineProperty[]>,
  propertyId: string,
): PropertyStatus | null {
  for (const [status, list] of columns) {
    if (list.some((p) => p.id === propertyId)) return status;
  }
  return null;
}

export function PipelineBoard({
  projectId,
  initialProperties,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
}) {
  const {
    columns,
    selectedProperty,
    error,
    pendingDiscard,
    openDrawer,
    closeDrawer,
    performMove,
    handleStatusChange,
    handleAddNote,
    confirmDiscard,
    cancelDiscard,
  } = usePropertyDrawer(projectId, initialProperties);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const propertyId = String(active.id);
    const overId = String(over.id);
    const isColumnId = STATUS_COLUMNS.some((c) => c.key === overId);

    if (isColumnId) {
      const toStatus = overId as PropertyStatus;
      performMove(propertyId, toStatus, (columns.get(toStatus) ?? []).length);
      return;
    }

    const toStatus = findPropertyStatus(columns, overId);
    if (!toStatus) return;
    const destIndex = (columns.get(toStatus) ?? []).findIndex((p) => p.id === overId);
    performMove(propertyId, toStatus, destIndex);
  }

  return (
    <div className="flex flex-1 flex-col">
      {error && (
        <div className="mx-6 mt-3 rounded-xl border border-score-low/40 bg-score-low/10 px-4 py-2 text-sm text-score-low">
          {error}
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto px-6 py-5">
          {STATUS_COLUMNS.map((col) => (
            <PipelineColumn
              key={col.key}
              status={col.key}
              label={col.label}
              properties={columns.get(col.key) ?? []}
              onOpenProperty={openDrawer}
            />
          ))}
        </div>
      </DndContext>

      {selectedProperty && (
        <PropertyDrawer
          property={selectedProperty}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}

      {pendingDiscard && (
        <DiscardReasonModal onCancel={cancelDiscard} onConfirm={confirmDiscard} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/PipelineBoard.tsx`.

- [ ] **Step 5: Vérification manuelle de non-régression (vue Pipeline)**

Run: `npm run dev`, ouvrir `/app/p/<projectId>` (vue Pipeline par défaut).
Expected : les 6 colonnes s'affichent avec les biens seedés, le drag & drop entre colonnes fonctionne, ouvrir une carte ouvre le drawer, changer le statut vers "Écarté" déclenche la modale de raison obligatoire, ajouter une note l'affiche immédiatement (optimistic update) — comportement strictement identique à avant le refactor.

- [ ] **Step 6: Commit**

```bash
git add src/lib/hooks/use-property-drawer.ts src/components/app/PipelineBoard.tsx
git commit -m "refactor(pipeline): extrait usePropertyDrawer, réutilisable par la future vue Tableau"
```

---

### Task 2: Config déclarative des colonnes (`src/lib/table-columns.tsx`)

**Files:**
- Create: `src/lib/table-columns.tsx`

**Interfaces:**
- Consumes: `PipelineProperty`, `PropertyStatus`, `STATUS_COLUMNS` (`@/lib/pipeline-types`), `Verdict`, `verdictLabel` (`@/lib/calc/score`), `formatEUR`/`formatM2`/`formatPercent`/`formatPricePerM2` (`@/lib/format`), `VerdictBadge` (`@/components/app/VerdictBadge`).
- Produces: `type TableRow = { property: PipelineProperty; rendement: number | null; verdict: Verdict }`, `type TableColumnId` (union de 13 ids), `type TableColumn = { id: TableColumnId; label: string; sortValue(row: TableRow): string | number | null; render(row: TableRow): ReactNode }`, `const TABLE_COLUMNS: TableColumn[]`, `const DEFAULT_COLUMN_IDS: TableColumnId[]`, `const REQUIRED_COLUMN_ID: TableColumnId`. Consommés par Task 4 (`PropertyTable`).

- [ ] **Step 1: Écrire la config**

Fichier `src/lib/table-columns.tsx` (extension `.tsx` car `render` retourne du JSX) :

```tsx
import type { ReactNode } from "react";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";
import type { Verdict } from "@/lib/calc/score";
import { formatEUR, formatM2, formatPercent, formatPricePerM2 } from "@/lib/format";
import { VerdictBadge } from "@/components/app/VerdictBadge";

export type TableRow = {
  property: PipelineProperty;
  rendement: number | null;
  verdict: Verdict;
};

export type TableColumnId =
  | "address"
  | "city"
  | "postal_code"
  | "property_type"
  | "status"
  | "asking_price"
  | "surface_carrez"
  | "price_per_m2"
  | "estimated_rent"
  | "rendement"
  | "verdict"
  | "max_price"
  | "daysInStatus";

export type TableColumn = {
  id: TableColumnId;
  label: string;
  /** Valeur comparable pour le tri. `null` = toujours trié en dernier, quel que soit le sens. */
  sortValue: (row: TableRow) => string | number | null;
  render: (row: TableRow) => ReactNode;
};

const STATUS_LABEL = Object.fromEntries(
  STATUS_COLUMNS.map((c) => [c.key, c.label]),
) as Record<PropertyStatus, string>;

const VERDICT_ORDER: Record<Verdict, number> = {
  pepite: 4,
  solide: 3,
  correct: 2,
  a_eviter: 1,
};

export const TABLE_COLUMNS: TableColumn[] = [
  {
    id: "address",
    label: "Adresse",
    sortValue: (r) => r.property.address,
    render: (r) => r.property.address ?? "Adresse non renseignée",
  },
  {
    id: "city",
    label: "Ville",
    sortValue: (r) => r.property.city,
    render: (r) => r.property.city ?? "—",
  },
  {
    id: "postal_code",
    label: "Code postal",
    sortValue: (r) => r.property.postal_code,
    render: (r) => r.property.postal_code ?? "—",
  },
  {
    id: "property_type",
    label: "Type de bien",
    sortValue: (r) => r.property.property_type,
    render: (r) => r.property.property_type ?? "—",
  },
  {
    id: "status",
    label: "Statut",
    sortValue: (r) => STATUS_LABEL[r.property.status],
    render: (r) => STATUS_LABEL[r.property.status],
  },
  {
    id: "asking_price",
    label: "Prix",
    sortValue: (r) => r.property.asking_price,
    render: (r) => formatEUR(r.property.asking_price),
  },
  {
    id: "surface_carrez",
    label: "Surface",
    sortValue: (r) => r.property.surface_carrez,
    render: (r) => formatM2(r.property.surface_carrez),
  },
  {
    id: "price_per_m2",
    label: "Prix / m²",
    sortValue: (r) =>
      r.property.asking_price && r.property.surface_carrez && r.property.surface_carrez > 0
        ? r.property.asking_price / r.property.surface_carrez
        : null,
    render: (r) => formatPricePerM2(r.property.asking_price, r.property.surface_carrez),
  },
  {
    id: "estimated_rent",
    label: "Loyer estimé",
    sortValue: (r) => r.property.estimated_rent,
    render: (r) => formatEUR(r.property.estimated_rent),
  },
  {
    id: "rendement",
    label: "Rendement brut",
    sortValue: (r) => r.rendement,
    render: (r) => formatPercent(r.rendement),
  },
  {
    id: "verdict",
    label: "Verdict",
    sortValue: (r) => VERDICT_ORDER[r.verdict],
    render: (r) => <VerdictBadge verdict={r.verdict} />,
  },
  {
    id: "max_price",
    label: "Prix max",
    sortValue: (r) => r.property.max_price,
    render: (r) => formatEUR(r.property.max_price),
  },
  {
    id: "daysInStatus",
    label: "Jours dans statut",
    sortValue: (r) => r.property.daysInStatus,
    render: (r) => `${r.property.daysInStatus} j`,
  },
];

export const DEFAULT_COLUMN_IDS: TableColumnId[] = [
  "address",
  "city",
  "status",
  "asking_price",
  "surface_carrez",
  "rendement",
  "verdict",
  "daysInStatus",
];

export const REQUIRED_COLUMN_ID: TableColumnId = "address";
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/table-columns.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/table-columns.tsx
git commit -m "feat(table): config déclarative des colonnes (tri + rendu + picker, source unique)"
```

---

### Task 3: Hook `useLocalStorageSet` (persistance du choix de colonnes)

**Files:**
- Create: `src/lib/hooks/use-local-storage-set.ts`

**Interfaces:**
- Consumes: rien (module autonome, `window.localStorage`).
- Produces: `useLocalStorageSet(key: string, defaultValues: string[]): [Set<string>, (next: Set<string>) => void]`. Consommé par Task 4 (`PropertyTable`).

- [ ] **Step 1: Écrire le hook**

Fichier `src/lib/hooks/use-local-storage-set.ts` :

```ts
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
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/hooks/use-local-storage-set.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/use-local-storage-set.ts
git commit -m "feat(table): hook useLocalStorageSet (persistance générique d'un Set en localStorage)"
```

---

### Task 4: Composant `PropertyTable`

**Files:**
- Create: `src/components/app/PropertyTable.tsx`

**Interfaces:**
- Consumes: `usePropertyDrawer` (`@/lib/hooks/use-property-drawer`), `useLocalStorageSet` (`@/lib/hooks/use-local-storage-set`), `TABLE_COLUMNS`/`DEFAULT_COLUMN_IDS`/`REQUIRED_COLUMN_ID`/`TableColumnId`/`TableRow` (`@/lib/table-columns`), `computeRendementBrutPct`/`computeVerdict` (`@/lib/calc/score`), `STATUS_COLUMNS`/`PipelineProperty`/`PropertyStatus` (`@/lib/pipeline-types`), `PropertyDrawer`, `DiscardReasonModal` (`@/components/app/`).
- Produces: `PropertyTable({ projectId: string; initialProperties: PipelineProperty[] })`. Consommé par Task 5 (`page.tsx`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/PropertyTable.tsx` :

```tsx
"use client";

import { useMemo, useState } from "react";
import { computeRendementBrutPct, computeVerdict } from "@/lib/calc/score";
import { usePropertyDrawer } from "@/lib/hooks/use-property-drawer";
import { useLocalStorageSet } from "@/lib/hooks/use-local-storage-set";
import {
  DEFAULT_COLUMN_IDS,
  REQUIRED_COLUMN_ID,
  TABLE_COLUMNS,
  type TableColumn,
  type TableColumnId,
  type TableRow,
} from "@/lib/table-columns";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";
import { PropertyDrawer } from "@/components/app/PropertyDrawer";
import { DiscardReasonModal } from "@/components/app/DiscardReasonModal";

const COLUMNS_STORAGE_KEY = "estio.table.columns";
const KNOWN_COLUMN_IDS = new Set(TABLE_COLUMNS.map((c) => c.id));

type SortState = { id: TableColumnId; direction: "asc" | "desc" };

function compareRows(a: TableRow, b: TableRow, column: TableColumn, direction: "asc" | "desc"): number {
  const va = column.sortValue(a);
  const vb = column.sortValue(b);
  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;
  const cmp =
    typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "fr");
  return direction === "asc" ? cmp : -cmp;
}

export function PropertyTable({
  projectId,
  initialProperties,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
}) {
  const {
    properties,
    selectedProperty,
    error,
    pendingDiscard,
    openDrawer,
    closeDrawer,
    handleStatusChange,
    handleAddNote,
    confirmDiscard,
    cancelDiscard,
  } = usePropertyDrawer(projectId, initialProperties);

  const [statusFilter, setStatusFilter] = useState<Set<PropertyStatus>>(new Set());
  const [sort, setSort] = useState<SortState>({ id: "daysInStatus", direction: "desc" });
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [storedColumnIds, setStoredColumnIds] = useLocalStorageSet(COLUMNS_STORAGE_KEY, DEFAULT_COLUMN_IDS);

  const selectedColumnIds = useMemo(() => {
    const valid = new Set(
      Array.from(storedColumnIds).filter((id): id is TableColumnId => KNOWN_COLUMN_IDS.has(id as TableColumnId)),
    );
    valid.add(REQUIRED_COLUMN_ID);
    return valid;
  }, [storedColumnIds]);

  const visibleColumns = useMemo(
    () => TABLE_COLUMNS.filter((c) => selectedColumnIds.has(c.id)),
    [selectedColumnIds],
  );

  const rows = useMemo<TableRow[]>(() => {
    const filtered =
      statusFilter.size === 0 ? properties : properties.filter((p) => statusFilter.has(p.status));
    return filtered.map((property) => {
      const rendement = computeRendementBrutPct(property);
      return { property, rendement, verdict: computeVerdict(rendement) };
    });
  }, [properties, statusFilter]);

  const sortedRows = useMemo(() => {
    const column = TABLE_COLUMNS.find((c) => c.id === sort.id) ?? TABLE_COLUMNS[0];
    return [...rows].sort((a, b) => compareRows(a, b, column, sort.direction));
  }, [rows, sort]);

  function toggleSort(id: TableColumnId) {
    setSort((prev) => (prev.id === id ? { id, direction: prev.direction === "asc" ? "desc" : "asc" } : { id, direction: "asc" }));
  }

  function toggleStatusChip(status: PropertyStatus) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function toggleColumn(id: TableColumnId) {
    if (id === REQUIRED_COLUMN_ID) return;
    const next = new Set(storedColumnIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setStoredColumnIds(next);
  }

  return (
    <div className="flex flex-1 flex-col">
      {error && (
        <div className="mx-6 mt-3 rounded-xl border border-score-low/40 bg-score-low/10 px-4 py-2 text-sm text-score-low">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-6 py-4">
        {STATUS_COLUMNS.map((s) => {
          const active = statusFilter.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleStatusChip(s.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "border-brand bg-brand text-bg" : "border-border text-muted hover:text-text"
              }`}
            >
              {s.label}
            </button>
          );
        })}

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setColumnsMenuOpen((v) => !v)}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-text"
          >
            Colonnes
          </button>
          {columnsMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setColumnsMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-border bg-bg-alt p-3 shadow-lg">
                {TABLE_COLUMNS.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text hover:bg-bg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumnIds.has(c.id)}
                      disabled={c.id === REQUIRED_COLUMN_ID}
                      onChange={() => toggleColumn(c.id)}
                      className="accent-brand"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {properties.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted">Aucun bien dans ce projet.</p>
      ) : sortedRows.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted">Aucun bien pour ce filtre.</p>
      ) : (
        <div className="flex-1 overflow-auto px-6 pb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {visibleColumns.map((c) => (
                  <th key={c.id} className="px-3 py-2 font-normal">
                    <button
                      type="button"
                      onClick={() => toggleSort(c.id)}
                      className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-text"
                    >
                      {c.label}
                      {sort.id === c.id && <span>{sort.direction === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.property.id}
                  onClick={() => openDrawer(row.property.id)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-bg-alt"
                >
                  {visibleColumns.map((c) => (
                    <td key={c.id} className="px-3 py-2.5 text-text">
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProperty && (
        <PropertyDrawer
          property={selectedProperty}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}

      {pendingDiscard && <DiscardReasonModal onCancel={cancelDiscard} onConfirm={confirmDiscard} />}
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/PropertyTable.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/PropertyTable.tsx
git commit -m "feat(table): composant PropertyTable (chips statut, picker colonnes, tri, drawer partagé)"
```

---

### Task 5: Brancher `PropertyTable` dans `page.tsx`

**Files:**
- Modify: `src/app/(app)/app/p/[projectId]/page.tsx`

**Interfaces:**
- Consumes: `PropertyTable` (`@/components/app/PropertyTable`, Task 4).
- Produces: route `/app/p/[projectId]?view=tableau` fonctionnelle (plus de placeholder pour `tableau`, seule `carte` reste en placeholder).

- [ ] **Step 1: Réécrire le fichier**

Remplacer le contenu de `src/app/(app)/app/p/[projectId]/page.tsx` par :

```tsx
import { ViewTabs, type ViewKey } from "@/components/app/ViewTabs";
import { ViewPlaceholder } from "@/components/app/ViewPlaceholder";
import { PipelineBoard } from "@/components/app/PipelineBoard";
import { PropertyTable } from "@/components/app/PropertyTable";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { daysSince } from "@/lib/format";
import type { NoteKind, PipelineNote, PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";

export const dynamic = "force-dynamic";

const CARTE_PLACEHOLDER = {
  title: "Vue Carte",
  plan: "Carte MapLibre, épingles par score — arrive au Plan 6.",
};

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

  if (active === "carte") {
    return (
      <div className="flex flex-1 flex-col">
        <ViewTabs projectId={projectId} active={active} />
        <ViewPlaceholder title={CARTE_PLACEHOLDER.title} plan={CARTE_PLACEHOLDER.plan} />
      </div>
    );
  }

  const supabase = getDemoClient();
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
git commit -m "feat(table): branche la vue Tableau sur les données réelles (fetch partagé avec le board)"
```

---

### Task 6: Vérification finale (build + lint + QA manuelle) et mise à jour des repères techniques

**Files:**
- Modify: `PROGRESS.md` (section « Repères techniques »)

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: repo vert (`build`/`lint`), documentation à jour pour la reprise de session suivante (Plan 5).

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: build réussi, aucune erreur TypeScript/Next.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: aucune erreur (warnings existants préexistants tolérés, ne pas en introduire de nouveaux).

- [ ] **Step 3: QA manuelle**

Run: `npm run dev`, ouvrir `/app/p/<projectId>?view=tableau`.

Vérifier :
- Les biens seedés s'affichent avec les colonnes par défaut (Adresse, Ville, Statut, Prix, Surface, Rendement brut, Verdict, Jours).
- Cliquer un en-tête de colonne trie (flèche visible), un second clic inverse le sens.
- Un bien sans `asking_price` (si présent dans le seed) apparaît toujours en dernier quel que soit le sens du tri sur "Prix".
- Cliquer une chip de statut filtre la table ; désactiver toutes les chips réaffiche tout.
- Ouvrir "Colonnes", cocher "Loyer estimé" et "Prix / m²" : les colonnes apparaissent immédiatement. Recharger la page (F5) : la sélection est conservée (persistance `localStorage`).
- La case "Adresse" est cochée et grisée (non décochable).
- Cliquer une ligne ouvre le même `PropertyDrawer` que la vue Pipeline ; changer le statut vers "Écarté" déclenche la modale de raison ; la ligne reste en place et sa cellule Statut se met à jour après fermeture.
- Retourner sur `/app/p/<projectId>?view=pipeline` : le board fonctionne toujours normalement (non-régression du refactor Task 1).

- [ ] **Step 4: Mettre à jour `PROGRESS.md` (Repères techniques)**

Dans `PROGRESS.md`, remplacer la ligne (actuellement au format ci-dessous, section « Repères techniques ») :

```
- **Pour le Plan 4 (Vue Tableau)** : réutiliser directement `computeRendementBrutPct`/`computeVerdict` (Task 2 du Plan 3) et les formatters de `src/lib/format.ts` — ne pas les redéfinir. Colonnes de la table = mêmes champs que `PipelineProperty`.
```

par :

```
- **Tableau (Plan 4)** : `src/lib/hooks/use-property-drawer.ts` (hook partagé board+table : `properties`, `columns`, `selectedProperty`, `openDrawer`/`closeDrawer`, `performMove`, `handleStatusChange`, `handleAddNote`, `pendingDiscard`/`confirmDiscard`/`cancelDiscard` — `PipelineBoard` en a été refactoré pour l'utiliser) · `src/lib/table-columns.tsx` (`TABLE_COLUMNS`, `DEFAULT_COLUMN_IDS`, `REQUIRED_COLUMN_ID`, types `TableColumn`/`TableColumnId`/`TableRow` — source unique colonnes/tri/rendu, à réutiliser tel quel) · `src/lib/hooks/use-local-storage-set.ts` (persistance générique) · composant `PropertyTable` (`src/components/app/`).
- **Pour le Plan 5 (Fiche complète)** : le bouton "Analyse complète →" du `PropertyDrawer` (`src/components/app/PropertyDrawer.tsx:124-131`) est désactivé avec `title` explicite, pointant vers ce plan — l'activer et créer la route associée.
```

- [ ] **Step 5: Commit**

```bash
git add PROGRESS.md
git commit -m "docs(progress): met à jour les repères techniques après le Plan 4 (vue Tableau)"
```

---

## Résumé pour la reprise de session

Après ce plan : les vues **Pipeline** et **Tableau** sont toutes deux fonctionnelles sur données réelles, partagent la même logique de drawer/statut/note (`usePropertyDrawer`). Reste **hors-scope** : vue Carte (Plan 6), fiche complète (Plan 5), comparer/arbitrage (Plan 7), flux d'ajout (Plan 8). Le pointeur de reprise après validation Vercel : **Plan 5 — Fiche complète**.
