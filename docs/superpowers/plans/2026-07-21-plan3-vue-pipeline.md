# Plan 3 — Vue Pipeline (board Kanban + drawer) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le placeholder « Vue Pipeline » de `/app/p/[projectId]` par un vrai board Kanban à 6 colonnes (statuts), avec cartes-biens riches, drag & drop persistant (dnd-kit), et un drawer d'aperçu permettant de changer le statut (avec raison obligatoire pour "Écarté") et d'ajouter une note rapide.

**Architecture:** Un mini moteur de calcul pur (`src/lib/calc/score.ts`, rendement brut → verdict) alimente un badge affiché sur chaque carte et dans le drawer. Le board est un client component (`PipelineBoard`) qui reçoit les données initiales d'un Server Component (`page.tsx`, lecture via `getDemoClient()`), gère l'état local des 6 colonnes, orchestre `@dnd-kit` pour le drag & drop, et appelle deux Server Actions (`moveProperty`, `addQuickNote`) pour persister les changements. Le drawer d'aperçu est piloté par l'état d'URL `?bien=id`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 (tokens `src/design/tokens.css`), Supabase (`@supabase/supabase-js` via `getDemoClient()`), `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (drag & drop).

## Global Constraints

- **Desktop-first** ; pas de traitement mobile particulier (spec §2.1 du build global).
- **Identité = dark grotesk** des tokens existants : `bg-bg`, `bg-bg-alt`, `text-text`, `text-muted`, `text-faint`, `text-brand`, `bg-brand`, `border-border`, `border-border-strong`, `text-score-high`/`bg-score-high`, `text-score-mid`/`bg-score-mid`, `text-score-low`/`bg-score-low`. Aucune couleur hors tokens.
- **Pas de lib d'icônes/UI** : boutons/icônes faits main (texte, `+`, `✕`), cf. mémoire « UI fait main sans lib ». `@dnd-kit` est la seule exception (drag & drop jugé trop fragile en fait-main, décision validée en brainstorm).
- **Aucun framework de test dans ce repo** (confirmé aux Plans 1 et 2 : pas de jest/vitest). Vérification de chaque tâche = `npx tsc --noEmit` après chaque fichier, puis `npm run build` + `npm run lint` en fin de plan (doivent rester verts), + vérification manuelle via `npm run dev`.
- **Accès données** : `getDemoClient()` + filtre explicite `user_id = DEMO_USER_ID` (`@/lib/supabase/demo`) partout. Pas d'auth réelle (Phase 5). Filtrer aussi `project_id` sur les écritures qui touchent une propriété (défense en profondeur).
- **Toute route Server Component qui lit Supabase exporte `export const dynamic = "force-dynamic";`** (déjà le cas sur `page.tsx`, ne pas retirer).
- **Composants app → `src/components/app/`**, helpers purs → `src/lib/`, moteur de calcul → `src/lib/calc/` (zéro I/O, zéro dépendance à un type Next/Supabase — cf. `CLAUDE.md` "le moteur de calcul est déterministe, jamais un LLM").
- **Score/verdict de ce plan = provisoire, mono-critère** (rendement brut). Le vrai scoring pondéré multi-critères arrive avec les profils de priorité (Plan 7) — ne pas le présenter comme définitif.
- **Aucune requête `property_photos` dans ce plan** : le bucket est privé et aucune photo n'est seedée (aucun flow d'upload avant le Plan 5). La carte affiche systématiquement un fallback illustré (initiales du type de bien) — décision validée en brainstorm ("photo optionnel, fallback obligatoire").
- **Hors-scope de ce plan** (arrivent aux plans suivants) : page "Analyse complète" (Plan 5, le bouton du drawer y renvoie mais reste désactivé avec `title` explicite, jamais un lien mort) · upload de photos/documents (Plan 5) · vue Tableau et vue Carte (Plans 4/6, déjà en placeholder, ne pas y toucher) · pondérations/profils de score (Plan 7) · flux d'ajout de bien (Plan 8).

---

### Task 1: Dépendances dnd-kit + types partagés du pipeline

**Files:**
- Modify: `package.json` (ajout dépendances)
- Create: `src/lib/pipeline-types.ts`

**Interfaces:**
- Consumes: `Database` (`@/lib/supabase/types`, existant depuis le Plan 1).
- Produces: `type PropertyStatus`, `type NoteKind`, `type PipelineNote`, `type PipelineProperty`, `const STATUS_COLUMNS`. Consommés par toutes les tâches suivantes (2 à 10).

- [ ] **Step 1: Installer les dépendances**

Run: `npm install @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0 @dnd-kit/utilities@3.2.2`
Expected: `package.json`/`package-lock.json` mis à jour, installation sans erreur.

- [ ] **Step 2: Écrire les types partagés**

Fichier `src/lib/pipeline-types.ts` :

```ts
import type { Database } from "@/lib/supabase/types";

export type PropertyStatus = Database["public"]["Enums"]["property_status"];
export type NoteKind = Database["public"]["Enums"]["note_kind"];

export type PipelineNote = {
  id: string;
  kind: NoteKind;
  body: string;
  created_at: string;
};

/** Vue "pipeline" d'un bien : uniquement les champs nécessaires au board + drawer.
 *  Volontairement plus étroit que la table `properties` complète (N1 exhaustif
 *  arrive avec la fiche complète, Plan 5). */
export type PipelineProperty = {
  id: string;
  status: PropertyStatus;
  board_position: number;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  property_type: string | null;
  surface_carrez: number | null;
  asking_price: number | null;
  works_estimate: number;
  estimated_rent: number | null;
  max_price: number | null;
  discard_reason: string | null;
  daysInStatus: number;
  notes: PipelineNote[];
};

export const STATUS_COLUMNS: { key: PropertyStatus; label: string }[] = [
  { key: "analyser", label: "À analyser" },
  { key: "analyse", label: "Analysé" },
  { key: "visite", label: "Visite" },
  { key: "nego", label: "En négo" },
  { key: "ecarte", label: "Écarté" },
  { key: "offre", label: "Offre" },
];
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/pipeline-types.ts`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/pipeline-types.ts
git commit -m "feat(pipeline): dépendances dnd-kit + types partagés du board"
```

---

### Task 2: Moteur de calcul provisoire (`src/lib/calc/score.ts`)

**Files:**
- Create: `src/lib/calc/score.ts`

**Interfaces:**
- Consumes: rien (module pur, zéro I/O, zéro dépendance externe — respecte `CLAUDE.md` "le moteur de calcul est déterministe, jamais un LLM").
- Produces: `type Verdict = "pepite" | "solide" | "correct" | "a_eviter"`, `computeRendementBrutPct(input): number | null`, `computeVerdict(rendementBrutPct: number | null): Verdict`, `verdictLabel(verdict: Verdict): string`. Consommés par les Tasks 5 (VerdictBadge), 6 (PropertyCard), 7 (PropertyDrawer).

- [ ] **Step 1: Écrire le moteur**

Fichier `src/lib/calc/score.ts` :

```ts
export type Verdict = "pepite" | "solide" | "correct" | "a_eviter";

type ScoreInput = {
  asking_price: number | null;
  works_estimate: number;
  estimated_rent: number | null;
};

const VERDICT_LABELS: Record<Verdict, string> = {
  pepite: "Pépite",
  solide: "Solide",
  correct: "Correct",
  a_eviter: "À éviter",
};

/**
 * Rendement brut annuel = (loyer estimé × 12) / (prix + travaux), en %.
 * Formule provisoire mono-critère (Plan 3) — le vrai scoring pondéré
 * multi-critères arrive avec les profils de priorité (Plan 7).
 * Retourne `null` si les données sont insuffisantes (jamais 0 ou NaN).
 */
export function computeRendementBrutPct(input: ScoreInput): number | null {
  const price = input.asking_price;
  const rent = input.estimated_rent;
  if (!price || price <= 0 || !rent || rent <= 0) return null;
  const totalCost = price + (input.works_estimate ?? 0);
  if (totalCost <= 0) return null;
  return (rent * 12 * 100) / totalCost;
}

/**
 * Seuils provisoires (mono-critère, à affiner avec le vrai scoring).
 * `null` (données insuffisantes) retombe sur "correct" par défaut :
 * état neutre, ni positif ni négatif, en attendant les chiffres.
 */
export function computeVerdict(rendementBrutPct: number | null): Verdict {
  if (rendementBrutPct === null) return "correct";
  if (rendementBrutPct >= 7) return "pepite";
  if (rendementBrutPct >= 5.5) return "solide";
  if (rendementBrutPct >= 4) return "correct";
  return "a_eviter";
}

export function verdictLabel(verdict: Verdict): string {
  return VERDICT_LABELS[verdict];
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/score.ts`.

- [ ] **Step 3: Vérification manuelle des seuils (pas de framework de test → petit script jetable)**

Run (PowerShell ou bash avec `npx tsx` si dispo, sinon vérifier à l'œil le fichier ci-dessus) :

```bash
node -e "
const price=189000, works=6000, rent=780;
const total=price+works;
const rendement=(rent*12*100)/total;
console.log('rendement %:', rendement.toFixed(2));
"
```

Expected: `rendement %: 4.98` (bien seedé n°301 : Rue Paul Bert, cohérent avec le verdict "correct" attendu : 4 ≤ 4.98 < 5.5).

- [ ] **Step 4: Commit**

```bash
git add src/lib/calc/score.ts
git commit -m "feat(calc): moteur de score provisoire (rendement brut → verdict)"
```

---

### Task 3: Helpers de formatage (`src/lib/format.ts`)

**Files:**
- Create: `src/lib/format.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `formatEUR(value: number | null): string`, `formatPercent(value: number | null, decimals?: number): string`, `formatM2(value: number | null): string`, `formatPricePerM2(price: number | null, surface: number | null): string`, `daysSince(dateISO: string): number`. Consommés par les Tasks 6 (PropertyCard), 7 (PropertyDrawer), 10 (page.tsx).

- [ ] **Step 1: Écrire les helpers**

Fichier `src/lib/format.ts` :

```ts
export function formatEUR(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function formatPercent(value: number | null, decimals = 1): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals).replace(".", ",")} %`;
}

export function formatM2(value: number | null): string {
  if (value === null) return "—";
  return `${value} m²`;
}

export function formatPricePerM2(price: number | null, surface: number | null): string {
  if (!price || !surface || surface <= 0) return "—";
  return formatEUR(Math.round(price / surface));
}

/** Nombre de jours entiers écoulés depuis une date ISO (toujours ≥ 0). */
export function daysSince(dateISO: string): number {
  const ms = Date.now() - new Date(dateISO).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/format.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/format.ts
git commit -m "feat(app): helpers de formatage (EUR, pourcentage, m², jours écoulés)"
```

---

### Task 4: Helper de position (`src/lib/board-position.ts`)

**Files:**
- Create: `src/lib/board-position.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `computeDropPosition(orderedPositions: number[], targetIndex: number): number`. Consommé par la Task 9 (PipelineBoard).

- [ ] **Step 1: Écrire le helper**

Fichier `src/lib/board-position.ts` :

```ts
/**
 * Calcule la `board_position` d'une carte déposée à `targetIndex` parmi les
 * positions (triées, en ordre visuel) des AUTRES cartes déjà présentes dans
 * la colonne cible (la carte déplacée elle-même est exclue de ce tableau).
 * Pattern de fractional indexing : moyenne entre les deux voisins.
 */
export function computeDropPosition(orderedPositions: number[], targetIndex: number): number {
  const before = orderedPositions[targetIndex - 1];
  const after = orderedPositions[targetIndex];
  if (before !== undefined && after !== undefined) return (before + after) / 2;
  if (before !== undefined) return before + 1;
  if (after !== undefined) return after - 1;
  return 1;
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Vérification manuelle rapide**

Run:

```bash
node -e "
function computeDropPosition(positions, targetIndex) {
  const before = positions[targetIndex - 1];
  const after = positions[targetIndex];
  if (before !== undefined && after !== undefined) return (before + after) / 2;
  if (before !== undefined) return before + 1;
  if (after !== undefined) return after - 1;
  return 1;
}
console.log(computeDropPosition([], 0));       // 1 (colonne vide)
console.log(computeDropPosition([1,2,3], 3));  // 4 (fin de colonne)
console.log(computeDropPosition([1,2,3], 0));  // 0 (début de colonne)
console.log(computeDropPosition([1,2,3], 1));  // 1.5 (entre 1 et 2)
"
```

Expected: `1`, `4`, `0`, `1.5` dans cet ordre.

- [ ] **Step 4: Commit**

```bash
git add src/lib/board-position.ts
git commit -m "feat(pipeline): helper de calcul de board_position (fractional indexing)"
```

---

### Task 5: `VerdictBadge` + `DiscardReasonModal`

**Files:**
- Create: `src/components/app/VerdictBadge.tsx`
- Create: `src/components/app/DiscardReasonModal.tsx`

**Interfaces:**
- Consumes: `Verdict`, `verdictLabel` (Task 2).
- Produces: `VerdictBadge({ verdict }: { verdict: Verdict })` ; `DiscardReasonModal({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void })`. Consommés par les Tasks 6, 7, 9.

- [ ] **Step 1: `VerdictBadge`**

Fichier `src/components/app/VerdictBadge.tsx` :

```tsx
import type { Verdict } from "@/lib/calc/score";
import { verdictLabel } from "@/lib/calc/score";

const VERDICT_CLASSES: Record<Verdict, string> = {
  pepite: "border-score-high/40 bg-score-high/20 text-score-high",
  solide: "border-score-high/25 bg-score-high/10 text-score-high",
  correct: "border-score-mid/30 bg-score-mid/15 text-score-mid",
  a_eviter: "border-score-low/30 bg-score-low/15 text-score-low",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${VERDICT_CLASSES[verdict]}`}
    >
      {verdictLabel(verdict)}
    </span>
  );
}
```

- [ ] **Step 2: `DiscardReasonModal`**

Fichier `src/components/app/DiscardReasonModal.tsx` :

```tsx
"use client";

import { useState } from "react";

/** Modale bloquante affichée quand un bien passe au statut "Écarté" (drag ou dropdown).
 *  Garantit que `discard_reason` n'est jamais vide (décision validée en brainstorm). */
export function DiscardReasonModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-alt p-5">
        <h2 className="font-sans text-base font-medium text-text">Pourquoi écarter ce bien ?</h2>
        <p className="mt-1 text-sm text-muted">
          La raison reste visible sur le bien, utile pour ne pas y revenir plus tard.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex. travaux trop lourds, budget dépassé…"
          rows={3}
          className="mt-3 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-bg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Écarter le bien
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/VerdictBadge.tsx src/components/app/DiscardReasonModal.tsx
git commit -m "feat(app): composants VerdictBadge et DiscardReasonModal"
```

---

### Task 6: `PropertyCard` + `PipelineColumn`

**Files:**
- Create: `src/components/app/PropertyCard.tsx`
- Create: `src/components/app/PipelineColumn.tsx`

**Interfaces:**
- Consumes: `PipelineProperty`, `PropertyStatus` (Task 1) ; `computeRendementBrutPct`, `computeVerdict` (Task 2) ; `formatEUR`, `formatM2` (Task 3) ; `VerdictBadge` (Task 5) ; `useSortable`/`CSS` (`@dnd-kit/sortable`, `@dnd-kit/utilities`) ; `useDroppable` (`@dnd-kit/core`).
- Produces: `PropertyCard({ property, onOpen }: { property: PipelineProperty; onOpen: (id: string) => void })` ; `PipelineColumn({ status, label, properties, onOpenProperty }: { status: PropertyStatus; label: string; properties: PipelineProperty[]; onOpenProperty: (id: string) => void })`. Consommés par la Task 9 (PipelineBoard).

- [ ] **Step 1: `PropertyCard`**

Fichier `src/components/app/PropertyCard.tsx` :

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { computeRendementBrutPct, computeVerdict } from "@/lib/calc/score";
import { formatEUR, formatM2 } from "@/lib/format";
import { VerdictBadge } from "@/components/app/VerdictBadge";
import type { PipelineProperty } from "@/lib/pipeline-types";

/** Fallback illustré quand aucune photo n'est disponible (aucun upload avant le Plan 5). */
function TypeThumbnail({ propertyType }: { propertyType: string | null }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg text-xs font-medium text-muted">
      {propertyType ?? "—"}
    </div>
  );
}

export function PropertyCard({
  property,
  onOpen,
}: {
  property: PipelineProperty;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: property.id,
  });

  const rendement = computeRendementBrutPct(property);
  const verdict = computeVerdict(rendement);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(property.id)}
      className="cursor-grab rounded-2xl border border-border bg-bg-alt p-3.5 transition-colors hover:border-border-strong active:cursor-grabbing"
    >
      <div className="flex gap-3">
        <TypeThumbnail propertyType={property.property_type} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">
            {property.address ?? "Adresse non renseignée"}
          </p>
          <p className="truncate text-xs text-muted">{property.city ?? "—"}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-text">
        <span>{formatEUR(property.asking_price)}</span>
        <span className="text-muted">{formatM2(property.surface_carrez)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <VerdictBadge verdict={verdict} />
        <span className="text-xs text-faint">{property.daysInStatus} j</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `PipelineColumn`**

Fichier `src/components/app/PipelineColumn.tsx` :

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PropertyCard } from "@/components/app/PropertyCard";
import type { PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";

export function PipelineColumn({
  status,
  label,
  properties,
  onOpenProperty,
}: {
  status: PropertyStatus;
  label: string;
  properties: PipelineProperty[];
  onOpenProperty: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h3 className="text-sm font-medium text-text">{label}</h3>
        <span className="text-xs text-faint">{properties.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-1 flex-col gap-2.5 rounded-2xl p-2 transition-colors ${
          isOver ? "bg-bg-alt" : ""
        }`}
      >
        <SortableContext items={properties.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} onOpen={onOpenProperty} />
          ))}
        </SortableContext>
        {properties.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-faint">Aucun bien ici.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/PropertyCard.tsx src/components/app/PipelineColumn.tsx
git commit -m "feat(app): composants PropertyCard (draggable) et PipelineColumn (droppable)"
```

---

### Task 7: `PropertyDrawer`

**Files:**
- Create: `src/components/app/PropertyDrawer.tsx`

**Interfaces:**
- Consumes: `PipelineProperty`, `PropertyStatus`, `STATUS_COLUMNS` (Task 1) ; `computeRendementBrutPct`, `computeVerdict` (Task 2) ; `formatEUR`, `formatM2`, `formatPercent`, `formatPricePerM2` (Task 3) ; `VerdictBadge` (Task 5).
- Produces: `PropertyDrawer({ property, onClose, onStatusChange, onAddNote }: { property: PipelineProperty; onClose: () => void; onStatusChange: (status: PropertyStatus) => void; onAddNote: (body: string) => Promise<void> })`. Consommé par la Task 9 (PipelineBoard).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/PropertyDrawer.tsx` :

```tsx
"use client";

import { useState, useTransition } from "react";
import { computeRendementBrutPct, computeVerdict } from "@/lib/calc/score";
import { formatEUR, formatM2, formatPercent, formatPricePerM2 } from "@/lib/format";
import { VerdictBadge } from "@/components/app/VerdictBadge";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

export function PropertyDrawer({
  property,
  onClose,
  onStatusChange,
  onAddNote,
}: {
  property: PipelineProperty;
  onClose: () => void;
  onStatusChange: (status: PropertyStatus) => void;
  onAddNote: (body: string) => Promise<void>;
}) {
  const [noteBody, setNoteBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const rendement = computeRendementBrutPct(property);
  const verdict = computeVerdict(rendement);

  function handleAddNote() {
    const trimmed = noteBody.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await onAddNote(trimmed);
      setNoteBody("");
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-bg-alt p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-medium text-text">
              {property.address ?? "Adresse non renseignée"}
            </h2>
            <p className="text-sm text-muted">{property.city ?? "—"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full border border-border px-2.5 py-1 text-sm text-muted transition-colors hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <VerdictBadge verdict={verdict} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <Metric label="Prix" value={formatEUR(property.asking_price)} />
          <Metric label="Surface" value={formatM2(property.surface_carrez)} />
          <Metric label="Rendement brut" value={formatPercent(rendement)} />
          <Metric
            label="Prix / m²"
            value={formatPricePerM2(property.asking_price, property.surface_carrez)}
          />
        </dl>

        <div className="mt-6">
          <label htmlFor="status" className="mb-1.5 block text-xs text-muted">
            Statut
          </label>
          <select
            id="status"
            value={property.status}
            onChange={(e) => onStatusChange(e.target.value as PropertyStatus)}
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none focus:border-brand"
          >
            {STATUS_COLUMNS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          {property.status === "ecarte" && property.discard_reason && (
            <p className="mt-2 text-sm text-faint">Raison : {property.discard_reason}</p>
          )}
        </div>

        <div className="mt-6 flex-1">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-faint">Notes</h3>
          <ul className="space-y-2">
            {property.notes.length === 0 && (
              <li className="text-sm text-faint">Aucune note pour l&apos;instant.</li>
            )}
            {property.notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-border bg-bg p-3 text-sm text-text">
                {note.body}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex gap-2">
            <input
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Ajouter une note…"
              className="flex-1 rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
            />
            <button
              type="button"
              disabled={isPending || !noteBody.trim()}
              onClick={handleAddNote}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-bg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ajouter
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled
          title="Arrive au Plan 5 (Fiche complète)"
          className="mt-6 w-full rounded-full border border-border py-2.5 text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Analyse complète →
        </button>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/PropertyDrawer.tsx
git commit -m "feat(app): composant PropertyDrawer (aperçu + changement de statut + note rapide)"
```

---

### Task 8: Server Actions (`moveProperty`, `addQuickNote`)

**Files:**
- Create: `src/app/(app)/app/p/[projectId]/actions.ts`

**Interfaces:**
- Consumes: `getDemoClient`, `DEMO_USER_ID` (`@/lib/supabase/demo`) ; `PropertyStatus` (Task 1).
- Produces: `moveProperty(input: { projectId: string; propertyId: string; fromStatus: PropertyStatus; toStatus: PropertyStatus; newPosition: number; discardReason?: string }): Promise<void>` ; `addQuickNote(propertyId: string, body: string): Promise<{ id: string; created_at: string }>`. Consommés par la Task 9 (PipelineBoard).

- [ ] **Step 1: Écrire le fichier**

Fichier `src/app/(app)/app/p/[projectId]/actions.ts` :

```ts
"use server";

import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import type { PropertyStatus } from "@/lib/pipeline-types";

export async function moveProperty(input: {
  projectId: string;
  propertyId: string;
  fromStatus: PropertyStatus;
  toStatus: PropertyStatus;
  newPosition: number;
  discardReason?: string;
}): Promise<void> {
  const { projectId, propertyId, fromStatus, toStatus, newPosition, discardReason } = input;
  const supabase = getDemoClient();

  const update: {
    status: PropertyStatus;
    board_position: number;
    discard_reason?: string | null;
  } = {
    status: toStatus,
    board_position: newPosition,
  };
  if (toStatus === "ecarte") {
    update.discard_reason = discardReason ?? null;
  } else if (fromStatus === "ecarte") {
    update.discard_reason = null;
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update(update)
    .eq("id", propertyId)
    .eq("project_id", projectId)
    .eq("user_id", DEMO_USER_ID);

  if (updateError) throw new Error(updateError.message);

  const { error: historyError } = await supabase.from("status_history").insert({
    property_id: propertyId,
    user_id: DEMO_USER_ID,
    from_status: fromStatus,
    to_status: toStatus,
    reason: toStatus === "ecarte" ? (discardReason ?? null) : null,
  });

  if (historyError) throw new Error(historyError.message);
}

export async function addQuickNote(
  propertyId: string,
  body: string,
): Promise<{ id: string; created_at: string }> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("La note est vide.");

  const supabase = getDemoClient();
  const { data, error } = await supabase
    .from("property_notes")
    .insert({ property_id: propertyId, user_id: DEMO_USER_ID, kind: "note", body: trimmed })
    .select("id, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Ajout de la note impossible.");
  return data;
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/actions.ts"
git commit -m "feat(pipeline): server actions moveProperty et addQuickNote"
```

---

### Task 9: `PipelineBoard` — orchestration (drag & drop, drawer, modale)

**Files:**
- Create: `src/components/app/PipelineBoard.tsx`

**Interfaces:**
- Consumes: `STATUS_COLUMNS`, `PipelineProperty`, `PropertyStatus` (Task 1) ; `computeDropPosition` (Task 4) ; `PipelineColumn` (Task 6) ; `PropertyDrawer` (Task 7) ; `DiscardReasonModal` (Task 5) ; `moveProperty`, `addQuickNote` (Task 8) ; `DndContext`, `PointerSensor`, `closestCorners`, `useSensor`, `useSensors`, `type DragEndEvent` (`@dnd-kit/core`).
- Produces: `PipelineBoard({ projectId, initialProperties }: { projectId: string; initialProperties: PipelineProperty[] })`. Consommé par la Task 10 (`page.tsx`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/PipelineBoard.tsx` :

```tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { computeDropPosition } from "@/lib/board-position";
import { moveProperty, addQuickNote } from "@/app/(app)/app/p/[projectId]/actions";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";

type PendingDiscard = {
  propertyId: string;
  fromStatus: PropertyStatus;
  newPosition: number;
};

export function PipelineBoard({
  projectId,
  initialProperties,
}: {
  projectId: string;
  initialProperties: PipelineProperty[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState(initialProperties);
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

    const overProperty = properties.find((p) => p.id === overId);
    if (!overProperty) return;
    const toStatus = overProperty.status;
    const destIndex = (columns.get(toStatus) ?? []).findIndex((p) => p.id === overId);
    performMove(propertyId, toStatus, destIndex);
  }

  function handleStatusChange(status: PropertyStatus) {
    if (!selectedProperty) return;
    performMove(selectedProperty.id, status, (columns.get(status) ?? []).length);
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
        <DiscardReasonModal
          onCancel={() => setPendingDiscard(null)}
          onConfirm={(reason) => {
            applyMove(pendingDiscard.propertyId, pendingDiscard.fromStatus, "ecarte", pendingDiscard.newPosition, reason);
            setPendingDiscard(null);
          }}
        />
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
git add src/components/app/PipelineBoard.tsx
git commit -m "feat(app): composant PipelineBoard (drag & drop, drawer, modale Écarté)"
```

---

### Task 10: Wiring `page.tsx` + vérification finale

**Files:**
- Modify: `src/app/(app)/app/p/[projectId]/page.tsx`

**Interfaces:**
- Consumes: `ViewTabs`, `type ViewKey`, `ViewPlaceholder` (existants, Plan 2) ; `PipelineBoard` (Task 9) ; `getDemoClient`, `DEMO_USER_ID` (`@/lib/supabase/demo`) ; `daysSince` (Task 3) ; `PipelineProperty`, `PipelineNote`, `NoteKind`, `PropertyStatus` (Task 1).
- Produces: page branchée réellement à la vue Pipeline (vues Tableau/Carte inchangées, toujours en placeholder).

- [ ] **Step 1: Réécrire la page**

Remplacer le contenu de `src/app/(app)/app/p/[projectId]/page.tsx` par :

```tsx
import { ViewTabs, type ViewKey } from "@/components/app/ViewTabs";
import { ViewPlaceholder } from "@/components/app/ViewPlaceholder";
import { PipelineBoard } from "@/components/app/PipelineBoard";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { daysSince } from "@/lib/format";
import type { NoteKind, PipelineNote, PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";

export const dynamic = "force-dynamic";

const PLACEHOLDERS: Record<Exclude<ViewKey, "pipeline">, { title: string; plan: string }> = {
  tableau: {
    title: "Vue Tableau",
    plan: "Table dense et triable, colonnes chiffrées — arrive au Plan 4.",
  },
  carte: {
    title: "Vue Carte",
    plan: "Carte MapLibre, épingles par score — arrive au Plan 6.",
  },
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

  if (active !== "pipeline") {
    const placeholder = PLACEHOLDERS[active];
    return (
      <div className="flex flex-1 flex-col">
        <ViewTabs projectId={projectId} active={active} />
        <ViewPlaceholder title={placeholder.title} plan={placeholder.plan} />
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
      <PipelineBoard projectId={projectId} initialProperties={pipelineProperties} />
    </div>
  );
}
```

- [ ] **Step 2: Vérifier build + lint**

Run: `npm run build`
Expected: build réussi, aucune route en erreur.

Run: `npm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Vérification manuelle via le serveur de dev**

Run: `npm run dev`, puis dans le navigateur sur `/app/p/00000000-0000-0000-0000-000000000101?view=pipeline` :

- 6 colonnes visibles : À analyser (2 biens), Analysé (1), Visite (1), En négo (1), Écarté (1), Offre (0, état "Aucun bien ici.").
- Chaque carte affiche : type de bien (fallback texte, pas de photo), adresse, ville, prix, surface, badge verdict pastel, "X j".
- Glisser une carte de "À analyser" vers "Analysé" → la carte se déplace, reste après un `npm run dev` refresh (persisté en base).
- Glisser une carte vers "Écarté" → modale bloquante apparaît ; "Écarter le bien" désactivé tant que le champ est vide ; taper une raison et confirmer → la carte atterrit dans "Écarté" ; annuler → la carte reste dans sa colonne d'origine.
- Cliquer sur une carte → drawer s'ouvre à droite (`?bien=` apparaît dans l'URL), affiche score/verdict, 4 chiffres clés, statut courant, notes existantes (le bien "Rue Paul Bert" a une note seedée).
- Dans le drawer : changer le statut via le menu déroulant → carte déplacée dans le board sans fermer le drawer ; passer à "Écarté" depuis le drawer déclenche aussi la modale.
- Ajouter une note rapide dans le drawer → apparaît immédiatement en tête de liste.
- Fermer le drawer (✕ ou clic en dehors) → `?bien=` disparaît de l'URL.
- Bouton "Analyse complète →" visible mais désactivé avec tooltip "Arrive au Plan 5 (Fiche complète)".

Expected: tous les points ci-dessus vérifiés visuellement. Corriger avant de continuer si un point échoue.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/page.tsx"
git commit -m "feat(pipeline): branche la vue Pipeline sur les données réelles (board + drawer)"
```

---

## Self-Review (fait par Claude après rédaction)

- **Couverture spec** : moteur de score provisoire ✅ Task 2 · carte-bien riche avec fallback photo ✅ Task 6 · drag & drop dnd-kit + `status_history` ✅ Tasks 8/9 · drawer d'aperçu interactif (statut + note) ✅ Task 7 · modale bloquante raison d'écart ✅ Tasks 5/9 · board_position par moyenne entre voisins ✅ Task 4 · bouton "Analyse complète →" en placeholder désactivé (pas de lien mort) ✅ Task 7.
- **Placeholders interdits** : aucun "TODO"/"à compléter" — le bouton "Analyse complète →" est un état désactivé explicite avec `title`, pas un renvoi vague ; les vues Tableau/Carte restent inchangées (déjà en placeholder nommé depuis le Plan 2).
- **Cohérence des types** : `PipelineProperty`/`PropertyStatus`/`NoteKind`/`STATUS_COLUMNS` définis une seule fois (Task 1, `src/lib/pipeline-types.ts`), réutilisés à l'identique dans `PropertyCard`, `PipelineColumn`, `PropertyDrawer`, `PipelineBoard`, `actions.ts` et `page.tsx`. Signature de `moveProperty` cohérente entre l'action (Task 8) et son appel dans `applyMove` (Task 9). Signature de `addQuickNote` cohérente entre l'action (Task 8) et `handleAddNote` (Task 9).
- **Limitation connue (documentée, pas bloquante)** : la détection de collision `closestCorners` de dnd-kit peut, en zone limite entre le bas d'une colonne pleine et son conteneur, indexer la carte à une position légèrement différente de l'intention visuelle exacte du survol — le bien atterrit toujours dans la bonne colonne, seul l'ordre fin peut nécessiter un petit ajustement manuel après coup (acceptable pour ce plan, pas un bug de persistance).
