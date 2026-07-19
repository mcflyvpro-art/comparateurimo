# Phase 1a — Structure : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place toute l'arborescence du site (13 routes) avec des coquilles à liens vivants, une 404, le groupe `(app)` et sa barre de crédits, et une section recharge sur `/tarifs` — sans logique métier.

**Architecture:** Next.js App Router avec deux groupes de routes. `(marketing)` (existant) garde son `SiteHeader`/`SiteFooter`. Nouveau groupe `(app)` avec un `AppHeader` distinct (logo, nav app, solde crédits factice → `/tarifs`, retour au site) et pas de footer. Une `not-found.tsx` racine autonome. Composants React fonctionnels stylés avec les tokens Tailwind existants.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4. Tokens Estio (`bg`, `bg-alt`, `border`, `brand`, `text`, `muted`). Aucune nouvelle dépendance.

**Vérification (lire avant de commencer) :** Le projet n'a **pas** de runner de tests unitaires (scripts = `dev`, `build`, `lint`). La vérification de chaque tâche est donc : (1) `npm run lint` passe, (2) `npm run build` passe (Next échoue au build sur un import cassé ou une route invalide), et (3) contrôle visuel via `npm run dev` sur la route concernée. On n'installe pas de framework de test pour des coquilles statiques (YAGNI). Les steps « test » de ce plan sont des vérifications build/lint/rendu, pas des tests unitaires.

---

### Task 1 : Page 404 (`not-found.tsx`)

**Files:**
- Create: `src/app/not-found.tsx`

La `not-found.tsx` racine s'affiche dans le root layout uniquement (pas les header/footer marketing) — c'est le comportement Next attendu et acceptable pour une 404 autonome ; elle offre un CTA de retour.

- [ ] **Step 1 : Créer la page 404**

```tsx
// src/app/not-found.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable — Estio",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <span className="font-sans text-6xl font-semibold tracking-tight text-brand">
        404
      </span>
      <h1 className="mt-6 font-sans text-2xl font-semibold text-text">
        Cette page n’existe pas.
      </h1>
      <p className="mt-3 text-muted">
        Le lien est peut-être cassé, ou la page a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
```

- [ ] **Step 2 : Vérifier lint + build**

Run: `npm run lint && npm run build`
Expected: PASS, aucune erreur. La route `/nimportequoi` doit rendre la 404 en dev.

- [ ] **Step 3 : Commit**

```bash
git add src/app/not-found.tsx
git commit -m "feat(ui): page 404 Estio"
```

---

### Task 2 : Groupe `(app)` — layout + `AppHeader` + liens app

**Files:**
- Create: `src/components/layout/app-nav-links.ts`
- Create: `src/components/layout/AppHeader.tsx`
- Create: `src/app/(app)/layout.tsx`

- [ ] **Step 1 : Créer la source unique des liens app**

```ts
// src/components/layout/app-nav-links.ts
// Liens de navigation de l'app connectée. Source unique.
export const appNavLinks = [
  { href: "/app", label: "Tableau de bord" },
  { href: "/app/wallet", label: "Wallet" },
] as const;
```

- [ ] **Step 2 : Créer `AppHeader`**

Solde de crédits **factice** (« 3 crédits ») cliquable → `/tarifs`. Pas d'auth en Phase 1.

```tsx
// src/components/layout/AppHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavLinks } from "./app-nav-links";

/** Header applicatif (groupe (app)), distinct du header marketing.
 *  Solde de crédits factice cliquable → /tarifs. Pas d'auth en Phase 1. */
export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/72 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/app"
            className="font-sans text-xl font-semibold tracking-tight text-text"
          >
            estio<span className="text-brand">.</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm sm:flex">
            {appNavLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`transition-colors ${
                    active
                      ? "font-medium text-text underline decoration-brand underline-offset-8"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/tarifs"
            title="Gérer l’abonnement et recharger des crédits"
            className="rounded-full border border-border bg-bg-alt px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-brand"
          >
            3 crédits
          </Link>
          <Link
            href="/"
            className="hidden text-sm text-muted transition-colors hover:text-text sm:block"
          >
            ← Retour au site
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3 : Créer le layout du groupe `(app)`**

```tsx
// src/app/(app)/layout.tsx
import { AppHeader } from "@/components/layout/AppHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
```

- [ ] **Step 4 : Vérifier lint + build**

Note : le build échouera tant qu'aucune page n'existe dans `(app)` — c'est normal, la Task 3 crée `/app`. Pour cette task, vérifier au minimum : `npm run lint` PASS. Le build complet est validé en Task 3.

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add src/components/layout/app-nav-links.ts src/components/layout/AppHeader.tsx "src/app/(app)/layout.tsx"
git commit -m "feat(app): layout (app) + AppHeader avec solde crédits"
```

---

### Task 3 : Coquille `/app` (dashboard inerte)

**Files:**
- Create: `src/app/(app)/app/page.tsx`

- [ ] **Step 1 : Créer le dashboard inerte**

État vide dominant + CTA principal désactivé « bientôt ».

```tsx
// src/app/(app)/app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord — Estio",
  description:
    "Votre espace Estio : analysez un bien et retrouvez-le dans votre wallet.",
};

export default function AppDashboard() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Tableau de bord
      </h1>

      <div className="mt-10 rounded-2xl border border-border bg-bg-alt px-6 py-16 text-center">
        <p className="text-lg text-text">Aucun bien analysé pour l’instant.</p>
        <p className="mt-2 text-sm text-muted">
          Importez une annonce pour l’analyser et l’ajouter à votre wallet.
        </p>
        <span
          aria-disabled="true"
          title="Bientôt disponible"
          className="mt-8 inline-flex cursor-not-allowed items-center rounded-full border border-border bg-bg px-5 py-2.5 text-sm font-medium text-muted"
        >
          Importer un bien · bientôt
        </span>
      </div>
    </main>
  );
}
```

- [ ] **Step 2 : Vérifier lint + build**

Run: `npm run lint && npm run build`
Expected: PASS. La route `/app` rend le dashboard avec `AppHeader` (solde crédits visible) en dev.

- [ ] **Step 3 : Commit**

```bash
git add "src/app/(app)/app/page.tsx"
git commit -m "feat(app): coquille /app (dashboard inerte)"
```

---

### Task 4 : Coquille `/app/wallet` (grille factice)

**Files:**
- Create: `src/app/(app)/app/wallet/page.tsx`

- [ ] **Step 1 : Créer la page wallet**

Grille de 3 emplacements factices + texte explicatif.

```tsx
// src/app/(app)/app/wallet/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet — Estio",
  description:
    "Vos biens analysés, réutilisables pour de nouvelles comparaisons sans recoût.",
};

const PLACEHOLDER_SLOTS = [0, 1, 2];

export default function Wallet() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Wallet
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Vos biens analysés vivent ici. Une fois dans le wallet, un bien se
        recompare autant que vous voulez, sans nouveau crédit.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_SLOTS.map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-bg-alt p-5"
          >
            <div className="h-32 rounded-xl bg-bg" />
            <div className="mt-4 h-4 w-2/3 rounded bg-bg" />
            <div className="mt-2 h-4 w-1/2 rounded bg-bg" />
            <p className="mt-4 text-xs uppercase tracking-wide text-muted">
              Emplacement de bien
            </p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted">
        Aperçu — le wallet se remplira dès que l’analyse de biens sera active.
      </p>
    </main>
  );
}
```

- [ ] **Step 2 : Vérifier lint + build**

Run: `npm run lint && npm run build`
Expected: PASS. La route `/app/wallet` rend la grille ; le lien « Wallet » de l'`AppHeader` est actif (souligné).

- [ ] **Step 3 : Commit**

```bash
git add "src/app/(app)/app/wallet/page.tsx"
git commit -m "feat(app): coquille /app/wallet (grille factice)"
```

---

### Task 5 : Section recharge sur `/tarifs`

**Files:**
- Create: `src/components/marketing/CreditRecharge.tsx`
- Modify: `src/app/(marketing)/tarifs/page.tsx`

- [ ] **Step 1 : Créer le composant `CreditRecharge`**

Section grisée sous les cartes, non actionnable en Phase 1.

```tsx
// src/components/marketing/CreditRecharge.tsx
/** Section recharge de crédits, affichée sous les cartes tarifs.
 *  Grisée en Phase 1 : réservée aux abonnés Pro & Expert, pas de paiement câblé. */
export function CreditRecharge() {
  const packs = [
    { credits: 5 },
    { credits: 15 },
    { credits: 40 },
  ];

  return (
    <section
      aria-labelledby="recharge-title"
      className="mx-auto mt-16 max-w-6xl px-6"
    >
      <div className="rounded-2xl border border-border bg-bg-alt p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="recharge-title"
            className="font-sans text-xl font-semibold text-text"
          >
            Recharge de crédits
          </h2>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
            Réservé aux abonnés Pro &amp; Expert
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Besoin de plus d’analyses ? Rechargez ponctuellement des crédits. La
          recharge n’est pas disponible en offre Free.
        </p>

        <div
          aria-disabled="true"
          className="mt-6 grid gap-4 opacity-60 sm:grid-cols-3"
        >
          {packs.map((p) => (
            <div
              key={p.credits}
              className="cursor-not-allowed rounded-xl border border-border bg-bg p-5 text-center"
            >
              <p className="font-sans text-2xl font-semibold text-text">
                {p.credits}
              </p>
              <p className="text-sm text-muted">crédits</p>
              <p className="mt-3 text-sm text-muted">— · bientôt</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Ajouter la section à la page tarifs**

Modifier `src/app/(marketing)/tarifs/page.tsx`. Ajouter l'import et rendre `<CreditRecharge />` après la `<section>` des cartes.

Import à ajouter (sous la ligne `import { PricingTable }`) :

```tsx
import { CreditRecharge } from "@/components/marketing/CreditRecharge";
```

Remplacer le bloc de retour existant :

```tsx
  return (
    <>
      <PageHeader
        eyebrow="Tarifs"
        title="Paie pour analyser, réutilise à volonté."
        intro="Un crédit analyse un bien neuf et l’ajoute à ton wallet. Une fois dedans, tu le recompares autant que tu veux, sans recoût."
      />

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <PricingTable />
        <p className="mt-10 rounded-lg border border-border bg-bg-alt px-4 py-3 text-center text-sm text-muted">
          Tarifs indicatifs, non contractuels — la grille définitive sera
          précisée avant l’ouverture des paiements.
        </p>
      </section>
    </>
  );
```

par :

```tsx
  return (
    <>
      <PageHeader
        eyebrow="Tarifs"
        title="Paie pour analyser, réutilise à volonté."
        intro="Un crédit analyse un bien neuf et l’ajoute à ton wallet. Une fois dedans, tu le recompares autant que tu veux, sans recoût."
      />

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <PricingTable />
        <p className="mt-10 rounded-lg border border-border bg-bg-alt px-4 py-3 text-center text-sm text-muted">
          Tarifs indicatifs, non contractuels — la grille définitive sera
          précisée avant l’ouverture des paiements.
        </p>
      </section>

      <CreditRecharge />

      <div className="h-16" />
    </>
  );
```

- [ ] **Step 3 : Vérifier lint + build**

Run: `npm run lint && npm run build`
Expected: PASS. `/tarifs` affiche la section recharge grisée sous les cartes. Depuis `/app`, cliquer « 3 crédits » mène à `/tarifs`.

- [ ] **Step 4 : Commit**

```bash
git add src/components/marketing/CreditRecharge.tsx "src/app/(marketing)/tarifs/page.tsx"
git commit -m "feat(tarifs): section recharge de crédits (grisée Free)"
```

---

### Task 6 : Passe de cohérence & revue 1a

**Files:**
- Vérification seule (pas de création) ; corrections ponctuelles si nécessaire.

- [ ] **Step 1 : Inventaire des 13 routes**

Run: `npx next build` (déjà couvert par build) puis lister les routes rendues. Vérifier manuellement en dev (`npm run dev`) que ces 13 routes rendent une page stylée :

```
/  /comment-ca-marche  /tarifs  /faq  /a-propos  /contact
/connexion  /mentions-legales  /confidentialite  /cgu
/app  /app/wallet  + 404 (route inexistante)
```

- [ ] **Step 2 : Chasse aux liens morts**

Run: `grep -rn "href=" src/components src/app --include=*.tsx`
Expected: chaque `href` interne pointe vers une route existante de la liste ci-dessus (ou une ancre valide sur la page). Aucun `href` vers `/app/import`, `/app/comparateur`, `/app/compte` (hors périmètre).

- [ ] **Step 3 : Vérifier l'absence de « open data » / « gratuit » (sources) dans l'UI**

Run: `grep -rni "open data\|données ouvertes" src`
Expected: aucune occurrence dans l'UI publique.

- [ ] **Step 4 : Vérifier que chaque page exporte `metadata`**

Run: `grep -rL "export const metadata" --include=page.tsx src/app`
Expected: aucune page listée (toutes ont un `metadata`). Si une page manque, ajouter un bloc `metadata` (title + description) sur le modèle des autres.

- [ ] **Step 5 : Build + lint finaux**

Run: `npm run lint && npm run build`
Expected: les deux PASS, aucune erreur ni warning bloquant.

- [ ] **Step 6 : Commit (si corrections)**

```bash
git add -A
git commit -m "chore(ui): passe de cohérence Phase 1a (liens, metadata, build)"
```

- [ ] **Step 7 : Revue utilisateur**

Présenter à l'utilisateur : les 13 routes navigables, la 404, le groupe `(app)` avec solde crédits → `/tarifs`, la section recharge grisée. **L'utilisateur seul valide et coche** les cases correspondantes du `PROGRESS.md`. Ne rien cocher soi-même.

---

## Notes de mise en œuvre

- **Chemins entre parenthèses** : les groupes `(app)` / `(marketing)` contiennent des parenthèses — les échapper/quoter dans les commandes shell (`"src/app/(app)/..."`).
- **Pas d'auth** : `(app)` est librement accessible ; le gating arrive en Phase 5.
- **404 autonome** : `not-found.tsx` racine n'a pas les header/footer marketing — comportement voulu.
- **Solde « 3 crédits »** : valeur factice codée en dur (offre Free = 3 crédits à vie). Deviendra dynamique en Phase 5.
