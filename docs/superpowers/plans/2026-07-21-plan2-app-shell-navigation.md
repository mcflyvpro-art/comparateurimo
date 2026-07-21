# Plan 2 — App shell & navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer l'ancien shell `(app)` (header de crédits, wallet — vestiges du modèle pré-pivot) par la vraie structure du CRM : sidebar (projets + switcher + nav), barre du haut par projet, onglets de vues (Pipeline/Tableau/Carte), page `/app/projects` (liste + création), et une racine `/app` qui redirige vers le dernier projet actif ou vers la liste.

**Architecture:** Next.js App Router, groupe `(app)`. Layout racine = sidebar + zone de contenu. Layout imbriqué `/app/p/[projectId]` = barre du haut par projet. La page `/app/p/[projectId]` lit `searchParams.view` et affiche un panneau vide nommant le plan qui l'implémentera (Pipeline → Plan 3, Tableau → Plan 4, Carte → Plan 6). Lecture Supabase en Server Components via `getDemoClient()` (service role, filtré `user_id = DEMO_USER_ID`, comme le Plan 1) ; écriture via une Server Action pour la création de projet.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 (tokens `src/design/tokens.css`), Supabase (`@supabase/supabase-js` via `getDemoClient()`). Pas de lib d'icônes ni de charts.

## Global Constraints

- **Desktop-first** ; pas de traitement mobile particulier dans ce plan (décision spec §2.1).
- **Identité = dark grotesk** des tokens existants (`src/design/tokens.css` / `globals.css`) : classes Tailwind `bg-bg`, `bg-bg-alt`, `text-text`, `text-muted`, `text-faint`, `text-brand`, `bg-brand`, `border-border`, `border-border-strong`, police `font-sans` (grotesque). Pas de nouvelle couleur hors tokens.
- **Routes cibles de ce plan** (spec §5) : `/app` (redirect), `/app/projects`, `/app/p/[projectId]` (board + `?view=pipeline|tableau|carte`). Les routes `/app/p/[projectId]/bien/[propertyId]`, `/app/p/[projectId]/comparer` et `/extension` sont **hors de ce plan** (Plans 5, 7, 8).
- **Toute route Server Component qui lit Supabase exporte `export const dynamic = "force-dynamic";`** — jamais de donnée figée au build (même logique que N2/N3 recalculés à la volée, cf. `CLAUDE.md`).
- **Accès données** : `getDemoClient()` + filtre explicite `user_id = DEMO_USER_ID` (`@/lib/supabase/demo`), comme au Plan 1. Pas d'auth réelle (Phase 5).
- **Composants app réutilisables → `src/components/app/`** (spec §5).
- **Pas de lib d'icônes/UI** : boutons/icônes faits main (texte, `+`, SVG minimal si besoin) — cf. mémoire « UI fait main sans lib ».
- **Aucun framework de test dans ce repo** (confirmé : pas de jest/vitest, pas de fichier `*.test.*`). Vérification de chaque tâche = `npm run build` + `npm run lint` (doivent rester verts) + description de ce qui doit apparaître à l'écran, vérifiable via `npm run dev`. Même convention que le Plan 1.
- **Fonctionnalités explicitement hors de ce plan** (arrivent aux plans suivants, doivent apparaître comme des affordances désactivées avec `title` explicite, jamais comme un lien mort) : recherche de biens (Plan 4), bouton Comparer (Plan 7), bouton + Ajouter un bien (Plan 8), contenu réel des 3 vues (Plans 3/4/6).

---

### Task 1: Helper de formatage des critères de projet

**Files:**
- Create: `src/lib/format-criteria.ts`

**Interfaces:**
- Produces: `type ProjectCriteria = { budget_max?: number; goal?: string; target_type?: string; zone?: string }`, `parseCriteria(criteria: Json): ProjectCriteria`, `formatCriteria(criteria: Json): string`. Consommé par les Tasks 6 (page projets), 7 (AppTopbar).

- [ ] **Step 1: Écrire le helper**

Fichier `src/lib/format-criteria.ts` :

```ts
import type { Json } from "@/lib/supabase/types";

/** Forme attendue de `projects.criteria` (jsonb libre, cf. schéma Plan 1). */
export type ProjectCriteria = {
  budget_max?: number;
  goal?: string;
  target_type?: string;
  zone?: string;
};

export function parseCriteria(criteria: Json): ProjectCriteria {
  if (!criteria || typeof criteria !== "object" || Array.isArray(criteria)) {
    return {};
  }
  return criteria as ProjectCriteria;
}

/** Résumé lisible, ex. "T2/T3 · Lyon · ≤ 250 000 € · Cash-flow ≥ 0 €". Chaîne vide si rien. */
export function formatCriteria(criteria: Json): string {
  const c = parseCriteria(criteria);
  const parts: string[] = [];
  if (c.target_type) parts.push(c.target_type);
  if (c.zone) parts.push(c.zone);
  if (typeof c.budget_max === "number" && c.budget_max > 0) {
    parts.push(`≤ ${c.budget_max.toLocaleString("fr-FR")} €`);
  }
  if (c.goal) parts.push(c.goal);
  return parts.join(" · ");
}
```

- [ ] **Step 2: Vérifier la compilation TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/format-criteria.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/format-criteria.ts
git commit -m "feat(app): helper formatCriteria pour les critères de projet"
```

---

### Task 2: Composant `AppSidebar`

**Files:**
- Create: `src/components/app/AppSidebar.tsx`

**Interfaces:**
- Consumes: rien (props uniquement).
- Produces: `AppSidebar({ projects }: { projects: { id: string; name: string; archived: boolean }[] })`. Consommé par la Task 3 (layout racine `(app)`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/AppSidebar.tsx` :

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProject = {
  id: string;
  name: string;
  archived: boolean;
};

/** Sidebar de l'app (groupe (app)) : logo, création de projet, switcher de projets.
 *  Remplace l'ancien AppHeader (crédits/wallet) du modèle pré-pivot. */
export function AppSidebar({ projects }: { projects: SidebarProject[] }) {
  const pathname = usePathname();
  const activeProjectId = pathname.match(/^\/app\/p\/([^/]+)/)?.[1];

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-alt">
      <div className="px-5 py-6">
        <Link
          href="/app"
          className="font-sans text-xl font-semibold tracking-tight text-text"
        >
          estio<span className="text-brand">.</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <Link
          href="/app/projects"
          className="mb-4 flex items-center justify-center gap-2 rounded-full border border-border-strong bg-bg px-3 py-2 text-sm font-medium text-text transition-colors hover:border-brand"
        >
          <span aria-hidden>+</span> Nouveau projet
        </Link>

        <p className="mb-2 px-2 text-xs uppercase tracking-wide text-faint">
          Projets actifs
        </p>
        <ul className="space-y-1">
          {active.map((p) => (
            <SidebarProjectLink key={p.id} project={p} isActive={p.id === activeProjectId} />
          ))}
          {active.length === 0 && (
            <li className="px-3 py-2 text-sm text-faint">Aucun projet actif.</li>
          )}
        </ul>

        {archived.length > 0 && (
          <>
            <p className="mb-2 mt-6 px-2 text-xs uppercase tracking-wide text-faint">
              Archivés
            </p>
            <ul className="space-y-1">
              {archived.map((p) => (
                <SidebarProjectLink key={p.id} project={p} isActive={p.id === activeProjectId} />
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <Link
          href="/app/projects"
          className="block text-sm text-muted transition-colors hover:text-text"
        >
          Tous les projets
        </Link>
        <Link
          href="/"
          className="mt-2 block text-sm text-muted transition-colors hover:text-text"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}

function SidebarProjectLink({
  project,
  isActive,
}: {
  project: SidebarProject;
  isActive: boolean;
}) {
  return (
    <li>
      <Link
        href={`/app/p/${project.id}`}
        aria-current={isActive ? "page" : undefined}
        className={`block truncate rounded-xl px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-bg font-medium text-text"
            : "text-muted hover:bg-bg hover:text-text"
        }`}
      >
        {project.name}
      </Link>
    </li>
  );
}
```

- [ ] **Step 2: Vérifier la compilation TypeScript**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/AppSidebar.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/AppSidebar.tsx
git commit -m "feat(app): composant AppSidebar (projets + switcher)"
```

---

### Task 3: Réécriture du layout racine `(app)`

**Files:**
- Modify: `src/app/(app)/layout.tsx`

**Interfaces:**
- Consumes: `AppSidebar` (Task 2), `getDemoClient`/`DEMO_USER_ID` (`@/lib/supabase/demo`, existant depuis le Plan 1).
- Produces: layout racine rendant `<AppSidebar>` + zone de contenu flex. Consommé implicitement par toutes les pages du groupe `(app)`.

- [ ] **Step 1: Réécrire le layout**

Remplacer le contenu de `src/app/(app)/layout.tsx` par :

```tsx
import { AppSidebar } from "@/components/app/AppSidebar";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, archived")
    .eq("user_id", DEMO_USER_ID)
    .order("created_at");

  return (
    <div className="flex min-h-screen bg-bg">
      <AppSidebar projects={projects ?? []} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur. (L'import `AppHeader` a disparu — il sera supprimé à la Task 4.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/layout.tsx"
git commit -m "feat(app): layout racine (app) avec sidebar au lieu du header crédits"
```

---

### Task 4: Suppression du shell pré-pivot (AppHeader, nav crédits, Wallet)

**Files:**
- Delete: `src/components/layout/AppHeader.tsx`
- Delete: `src/components/layout/app-nav-links.ts`
- Delete: `src/app/(app)/app/wallet/page.tsx` (et le dossier `wallet/` s'il devient vide)

**Interfaces:**
- Consumes: rien (aucun fichier restant ne les importe après la Task 3 — vérifié par grep avant ce plan : seuls `AppHeader.tsx`, `app-nav-links.ts` et l'ancien `(app)/layout.tsx` s'y référençaient).
- Produces: rien (nettoyage).

- [ ] **Step 1: Vérifier qu'aucune référence ne subsiste**

Run: `grep -rn "AppHeader\|app-nav-links\|/app/wallet" src/`
Expected: aucun résultat.

- [ ] **Step 2: Supprimer les fichiers**

```bash
git rm src/components/layout/AppHeader.tsx src/components/layout/app-nav-links.ts
git rm "src/app/(app)/app/wallet/page.tsx"
```

Si le dossier `src/app/(app)/app/wallet/` est vide après cette suppression, le supprimer aussi (Git ne suit pas les dossiers vides, rien à faire de plus).

- [ ] **Step 3: Vérifier build + lint**

Run: `npm run build`
Expected: build réussi, aucune erreur d'import manquant.

Run: `npm run lint`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(app): retire AppHeader/wallet du modèle pré-pivot (crédits)"
```

---

### Task 5: Racine `/app` — redirection vers le dernier projet ou la liste

**Files:**
- Modify: `src/app/(app)/app/page.tsx`

**Interfaces:**
- Consumes: `getDemoClient`/`DEMO_USER_ID`.
- Produces: redirection serveur, pas d'export consommé ailleurs.

- [ ] **Step 1: Réécrire la page**

Remplacer le contenu de `src/app/(app)/app/page.tsx` par :

```tsx
import { redirect } from "next/navigation";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export const dynamic = "force-dynamic";

export default async function AppRoot() {
  const supabase = getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", DEMO_USER_ID)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(1);

  const last = projects?.[0];
  redirect(last ? `/app/p/${last.id}` : "/app/projects");
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur. (La route `/app/p/[projectId]` n'existe pas encore — c'est attendu, `redirect()` n'est pas vérifié statiquement par TypeScript ; elle sera créée à la Task 8, avant quoi ce fichier ne doit pas être testé manuellement.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/app/page.tsx"
git commit -m "feat(app): /app redirige vers le dernier projet actif ou la liste"
```

---

### Task 6: Page `/app/projects` — liste + création de projet

**Files:**
- Create: `src/components/app/CreateProjectForm.tsx`
- Create: `src/app/(app)/app/projects/actions.ts`
- Create: `src/app/(app)/app/projects/page.tsx`

**Interfaces:**
- Consumes: `formatCriteria` (Task 1), `getDemoClient`/`DEMO_USER_ID`.
- Produces: route `/app/projects` fonctionnelle (liste actifs/archivés + formulaire de création qui redirige vers `/app/p/[projectId]` — cette redirection ne sera navigable qu'après la Task 8, ce qui est attendu à ce stade du plan).

- [ ] **Step 1: Server Action de création**

Fichier `src/app/(app)/app/projects/actions.ts` :

```ts
"use server";

import { redirect } from "next/navigation";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export async function createProject(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const budgetRaw = String(formData.get("budget_max") ?? "").replace(/\D/g, "");
  const budget_max = budgetRaw ? Number(budgetRaw) : undefined;
  const goal = String(formData.get("goal") ?? "").trim() || undefined;

  const supabase = getDemoClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: DEMO_USER_ID, name, criteria: { budget_max, goal } })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Création du projet impossible.");
  }

  redirect(`/app/p/${data.id}`);
}
```

- [ ] **Step 2: Formulaire client**

Fichier `src/components/app/CreateProjectForm.tsx` :

```tsx
"use client";

import { useState } from "react";
import { createProject } from "@/app/(app)/app/projects/actions";

const GOAL_PRESETS = ["Cash-flow ≥ 0 €", "Rendement ≥ 6 %", "Patrimoine long terme"];

export function CreateProjectForm() {
  const [goal, setGoal] = useState(GOAL_PRESETS[0]);

  return (
    <form
      action={createProject}
      className="h-fit rounded-2xl border border-border bg-bg-alt p-5"
    >
      <h2 className="font-sans text-lg font-medium text-text">Nouveau projet</h2>
      <p className="mt-1 text-sm text-muted">
        Un projet = un achat. Il contient ton pipeline.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs text-muted">
            Nom du projet
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="T2/T3 Lyon locatif"
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
          />
        </div>

        <div>
          <label htmlFor="budget_max" className="mb-1.5 block text-xs text-muted">
            Budget max
          </label>
          <input
            id="budget_max"
            name="budget_max"
            inputMode="numeric"
            placeholder="250 000 €"
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-muted">Objectif</span>
          <input type="hidden" name="goal" value={goal} />
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  goal === g
                    ? "bg-brand text-bg"
                    : "border border-border text-muted hover:border-brand hover:text-text"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-full bg-brand py-2.5 text-sm font-medium text-bg transition-colors hover:bg-brand-hover"
      >
        Créer le projet
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Page projets**

Fichier `src/app/(app)/app/projects/page.tsx` :

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { formatCriteria } from "@/lib/format-criteria";
import { CreateProjectForm } from "@/components/app/CreateProjectForm";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projets — Estio",
  description: "Vos projets d'achat et leurs pipelines.",
};

type ProjectRow = { id: string; name: string; archived: boolean; criteria: Json };

export default async function ProjectsPage() {
  const supabase = getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, archived, criteria")
    .eq("user_id", DEMO_USER_ID)
    .order("created_at");

  const active = (projects ?? []).filter((p) => !p.archived);
  const archived = (projects ?? []).filter((p) => p.archived);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Projets
      </h1>
      <p className="mt-2 text-sm text-muted">
        Un projet = un achat. Chacun porte son propre pipeline de biens.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <ProjectList
            title="Actifs"
            projects={active}
            emptyLabel="Aucun projet actif pour l'instant."
          />
          {archived.length > 0 && (
            <ProjectList title="Archivés" projects={archived} emptyLabel="" />
          )}
        </div>
        <CreateProjectForm />
      </div>
    </main>
  );
}

function ProjectList({
  title,
  projects,
  emptyLabel,
}: {
  title: string;
  projects: ProjectRow[];
  emptyLabel: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wide text-faint">{title}</h2>
      {projects.length === 0 ? (
        <p className="text-sm text-faint">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/p/${p.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-bg-alt px-5 py-4 transition-colors hover:border-brand"
              >
                <div>
                  <span className="font-sans text-lg font-medium text-text">
                    {p.name}
                  </span>
                  <p className="mt-1 text-sm text-muted">
                    {formatCriteria(p.criteria) || "Critères non renseignés"}
                  </p>
                </div>
                {p.archived && (
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                    archivé
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Vérifier build + lint**

Run: `npm run build`
Expected: build réussi (la route `/app/projects` compile même si `/app/p/[projectId]` n'existe pas encore — les `<Link href>` vers elle ne sont pas vérifiés statiquement).

Run: `npm run lint`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/components/app/CreateProjectForm.tsx "src/app/(app)/app/projects/actions.ts" "src/app/(app)/app/projects/page.tsx"
git commit -m "feat(app): page /app/projects (liste actifs/archivés + création)"
```

---

### Task 7: Composants `ViewTabs`, `ViewPlaceholder`, `AppTopbar`

**Files:**
- Create: `src/components/app/ViewTabs.tsx`
- Create: `src/components/app/ViewPlaceholder.tsx`
- Create: `src/components/app/AppTopbar.tsx`

**Interfaces:**
- Consumes: `formatCriteria` (Task 1).
- Produces: `ViewTabs({ projectId, active }: { projectId: string; active: ViewKey })` + `type ViewKey = "pipeline" | "tableau" | "carte"` ; `ViewPlaceholder({ title, plan }: { title: string; plan: string })` ; `AppTopbar({ project }: { project: { name: string; criteria: Json } })`. Consommés par la Task 8.

- [ ] **Step 1: `ViewTabs`**

Fichier `src/components/app/ViewTabs.tsx` :

```tsx
import Link from "next/link";

const VIEWS = [
  { key: "pipeline", label: "Pipeline" },
  { key: "tableau", label: "Tableau" },
  { key: "carte", label: "Carte" },
] as const;

export type ViewKey = (typeof VIEWS)[number]["key"];

export function ViewTabs({
  projectId,
  active,
}: {
  projectId: string;
  active: ViewKey;
}) {
  return (
    <div className="flex gap-1 border-b border-border px-6">
      {VIEWS.map((v) => {
        const isActive = v.key === active;
        return (
          <Link
            key={v.key}
            href={`/app/p/${projectId}?view=${v.key}`}
            aria-current={isActive ? "page" : undefined}
            className={`border-b-2 px-3 py-3 text-sm transition-colors ${
              isActive
                ? "border-brand font-medium text-text"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: `ViewPlaceholder`**

Fichier `src/components/app/ViewPlaceholder.tsx` :

```tsx
export function ViewPlaceholder({ title, plan }: { title: string; plan: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-sans text-xl font-medium text-text">{title}</p>
      <p className="mt-2 text-sm text-muted">{plan}</p>
    </div>
  );
}
```

- [ ] **Step 3: `AppTopbar`**

Fichier `src/components/app/AppTopbar.tsx` :

```tsx
import { formatCriteria } from "@/lib/format-criteria";
import type { Json } from "@/lib/supabase/types";

/** Barre du haut d'un projet : nom + critères, recherche, Comparer, + Ajouter un bien.
 *  Recherche/Comparer/Ajouter sont désactivés dans ce plan (arrivent aux Plans 4/7/8). */
export function AppTopbar({
  project,
}: {
  project: { name: string; criteria: Json };
}) {
  const summary = formatCriteria(project.criteria);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div>
        <h1 className="font-sans text-lg font-medium text-text">{project.name}</h1>
        {summary && <p className="text-sm text-muted">{summary}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher un bien…"
          disabled
          title="Recherche — arrive avec la vue Tableau (Plan 4)"
          className="w-48 rounded-full border border-border bg-bg-alt px-4 py-2 text-sm text-text placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          disabled
          title="Arrive au Plan 7 (Comparer / Arbitrage)"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Comparer
        </button>
        <button
          type="button"
          disabled
          title="Arrive au Plan 8 (Flux Ajouter un bien)"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Ajouter un bien
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/components/app/ViewTabs.tsx src/components/app/ViewPlaceholder.tsx src/components/app/AppTopbar.tsx
git commit -m "feat(app): composants ViewTabs, ViewPlaceholder, AppTopbar"
```

---

### Task 8: Route `/app/p/[projectId]` — layout (topbar) + page (onglets de vues)

**Files:**
- Create: `src/app/(app)/app/p/[projectId]/layout.tsx`
- Create: `src/app/(app)/app/p/[projectId]/page.tsx`

**Interfaces:**
- Consumes: `AppTopbar`, `ViewTabs`, `ViewPlaceholder`, `ViewKey` (Task 7), `getDemoClient`/`DEMO_USER_ID`.
- Produces: route `/app/p/[projectId]?view=pipeline|tableau|carte` navigable. Ferme la boucle des redirections créées aux Tasks 5 et 6.

- [ ] **Step 1: Layout du projet (topbar)**

Fichier `src/app/(app)/app/p/[projectId]/layout.tsx` :

```tsx
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/app/AppTopbar";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export const dynamic = "force-dynamic";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = getDemoClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, criteria")
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (!project) notFound();

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppTopbar project={project} />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Page du projet (onglets de vues)**

Fichier `src/app/(app)/app/p/[projectId]/page.tsx` :

```tsx
import { ViewTabs, type ViewKey } from "@/components/app/ViewTabs";
import { ViewPlaceholder } from "@/components/app/ViewPlaceholder";

export const dynamic = "force-dynamic";

const PLACEHOLDERS: Record<ViewKey, { title: string; plan: string }> = {
  pipeline: {
    title: "Vue Pipeline",
    plan: "Board Kanban à statuts (drag & drop) — arrive au Plan 3.",
  },
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
  const placeholder = PLACEHOLDERS[active];

  return (
    <div className="flex flex-1 flex-col">
      <ViewTabs projectId={projectId} active={active} />
      <ViewPlaceholder title={placeholder.title} plan={placeholder.plan} />
    </div>
  );
}
```

- [ ] **Step 3: Vérifier build + lint**

Run: `npm run build`
Expected: build réussi, aucune route en erreur.

Run: `npm run lint`
Expected: aucune erreur.

- [ ] **Step 4: Vérification manuelle via le serveur de dev**

Run: `npm run dev`, puis dans le navigateur :
- `/app` → redirige vers `/app/p/00000000-0000-0000-0000-000000000101` (le projet actif seedé « T2/T3 Lyon locatif », le plus récent).
- Sidebar : « T2/T3 Lyon locatif » sous *Projets actifs*, « Résidence étudiante » sous *Archivés*, projet courant surligné.
- Barre du haut : nom du projet + résumé des critères (`T2/T3 · Lyon · ≤ 250 000 € · cash-flow ≥ 0`), recherche/Comparer/+Ajouter visibles mais désactivés (tooltip au survol).
- Onglets Pipeline/Tableau/Carte cliquables, chacun affiche son placeholder « arrive au Plan N » et met à jour l'URL (`?view=…`).
- `/app/projects` → liste actifs + archivés + formulaire « Nouveau projet » fonctionnel : créer un projet redirige vers son board.
- Naviguer vers un `projectId` inexistant (`/app/p/xxx`) → page 404 Next.js.

Expected: tous les points ci-dessus vérifiés visuellement. Corriger avant de continuer si un point échoue.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/app/p"
git commit -m "feat(app): route /app/p/[projectId] (topbar + onglets de vues)"
```

---

## Self-Review (fait par Claude après rédaction)

- **Couverture spec** : layout (app) ✅ Task 3 · sidebar (projets+switcher+nav) ✅ Task 2 · barre du haut ✅ Task 7/8 · onglets de vues ✅ Task 7/8 · page projets ✅ Task 6 · refonte `/app` ✅ Task 5 · nettoyage de l'ancien shell crédits/wallet ✅ Task 4.
- **Placeholders interdits** : aucun "TODO"/"à compléter" — chaque vue non construite (Pipeline/Tableau/Carte/Comparer/Ajouter/Recherche) est un état explicite et fonctionnel (désactivé avec `title`, ou panneau nommant le plan cible), pas un renvoi vague.
- **Cohérence des types** : `ViewKey` défini une fois dans `ViewTabs.tsx`, réutilisé tel quel dans `page.tsx` (Task 8) sans redéfinition. `ProjectCriteria`/`formatCriteria` définis une fois (Task 1), réutilisés identiquement dans `AppTopbar` (Task 7) et `ProjectsPage` (Task 6). Signature de `createProject(formData: FormData)` cohérente entre l'action (Task 6 Step 1) et le `<form action={createProject}>` (Task 6 Step 2).
