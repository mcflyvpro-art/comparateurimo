# Site public Estio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer le site public Estio complet et navigable : header refait, footer enrichi, pages marketing + légales en coquilles stylées, sans logique métier.

**Architecture:** Groupe de routes Next `(marketing)` avec un `layout.tsx` partageant `SiteHeader` + `SiteFooter`. Pages = coquilles réutilisant les tokens Estio, `Reveal`, `MagneticButton`. Composants interactifs (menu mobile, pricing, FAQ, formulaires) isolés en client components. Aucun backend.

**Tech Stack:** Next.js 16 (App Router, route groups), Tailwind 4, TypeScript, `motion`, tokens Estio.

**Note vérification :** pas de tests unitaires (pages statiques + coquilles). Vérification par tâche = `npm run build` sans erreur + `npm run lint` (en fin de lot) + contrôle visuel. Source de vérité : `docs/superpowers/specs/2026-07-19-site-public-design.md`. **Règle transverse : jamais « open data » / « gratuit » à propos des sources dans l’UI.** Tout texte JSX utilise l’apostrophe typographique `’` (le lint `react/no-unescaped-entities` rejette `'`).

---

### Task 1: Données de nav + Footer + PageHeader

**Files:**
- Create: `src/components/layout/nav-links.ts`
- Create: `src/components/layout/SiteFooter.tsx`
- Create: `src/components/marketing/PageHeader.tsx`

- [ ] **Step 1: Créer `src/components/layout/nav-links.ts`**

```ts
// Liens de navigation partagés (header + footer). Source unique.
export const navLinks = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
  { href: "/a-propos", label: "À propos" },
] as const;

export const footerGroups = [
  {
    title: "Produit",
    links: [
      { href: "/comment-ca-marche", label: "Comment ça marche" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
    ],
  },
] as const;
```

- [ ] **Step 2: Créer `src/components/layout/SiteFooter.tsx`**

```tsx
import Link from "next/link";
import { footerGroups } from "./nav-links";

/** Pied de page enrichi : marque + 3 colonnes de liens + barre légale. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-text"
          >
            estio<span className="text-brand">.</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Le bon bien, chiffres à l’appui. Données de marché officielles,
            calcul transparent.
          </p>
          <p className="mt-3 text-sm text-faint">estio.immo</p>
        </div>

        {footerGroups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-sm font-semibold text-text">{g.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-faint">
          © 2026 Estio
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Créer `src/components/marketing/PageHeader.tsx`**

```tsx
import { Reveal } from "@/components/landing/Reveal";

/** En-tête réutilisable des pages secondaires : eyebrow + titre + intro. */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 lg:pt-24">
      <Reveal>
        <span className="text-sm font-medium uppercase tracking-wide text-brand">
          {eyebrow}
        </span>
        <h1 className="mt-4 max-w-3xl font-sans text-4xl font-semibold tracking-[-0.03em] text-text md:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {intro}
          </p>
        ) : null}
      </Reveal>
    </div>
  );
}
```

- [ ] **Step 4: Vérifier le typage**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/nav-links.ts src/components/layout/SiteFooter.tsx src/components/marketing/PageHeader.tsx
git commit -m "feat(site): données de nav, footer enrichi, PageHeader"
```

---

### Task 2: Header refait + menu mobile

**Files:**
- Create: `src/components/layout/MobileMenu.tsx`
- Create: `src/components/layout/SiteHeader.tsx`

- [ ] **Step 1: Créer `src/components/layout/MobileMenu.tsx`**

```tsx
"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { navLinks } from "./nav-links";

/** Panneau plein écran (mobile) : liens + actions. Spring + reduced-motion. */
export function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -8 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="fixed inset-0 z-50 bg-bg px-6 pt-4 sm:hidden"
        >
          <div className="flex items-center justify-between py-2">
            <Link
              href="/"
              onClick={onClose}
              className="font-sans text-xl font-semibold tracking-tight text-text"
            >
              estio<span className="text-brand">.</span>
            </Link>
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="cursor-pointer p-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className={`font-sans text-2xl tracking-tight ${
                  pathname === l.href ? "text-brand" : "text-text"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 flex flex-col gap-3">
            <Link
              href="/connexion"
              onClick={onClose}
              className="rounded-full border border-border px-6 py-3 text-center font-medium text-text"
            >
              Se connecter
            </Link>
            <Link
              href="/connexion"
              onClick={onClose}
              className="rounded-full bg-brand px-6 py-3 text-center font-medium text-white"
            >
              Ajouter un bien
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Créer `src/components/layout/SiteHeader.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "./nav-links";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { MobileMenu } from "./MobileMenu";

/** Header translucide. Liens vers les vraies pages, état actif, menu mobile. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/72 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-sans text-xl font-semibold tracking-tight text-text"
        >
          estio<span className="text-brand">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm sm:flex">
          {navLinks.map((l) => {
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

        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/connexion"
            className="text-sm text-muted transition-colors hover:text-text"
          >
            Se connecter
          </Link>
          <MagneticButton href="/connexion" className="px-4 py-2 text-sm">
            Ajouter un bien
          </MagneticButton>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="cursor-pointer p-2 sm:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        </button>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </header>
  );
}
```

- [ ] **Step 3: Vérifier le typage**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/SiteHeader.tsx src/components/layout/MobileMenu.tsx
git commit -m "feat(site): header refait (vraies pages, état actif, menu mobile)"
```

---

### Task 3: Layout marketing + déplacement/nettoyage de la landing

**Files:**
- Create: `src/app/(marketing)/layout.tsx`
- Move: `src/app/page.tsx` → `src/app/(marketing)/page.tsx` (contenu réécrit)
- Delete: `src/components/landing/SiteNav.tsx`

- [ ] **Step 1: Créer `src/app/(marketing)/layout.tsx`**

```tsx
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 2: Déplacer la landing**

Run: `git mv src/app/page.tsx "src/app/(marketing)/page.tsx"`
Expected: fichier déplacé.

- [ ] **Step 3: Réécrire `src/app/(marketing)/page.tsx`** (retirer header/footer inline, corriger « open data »)

```tsx
import { Reveal } from "@/components/landing/Reveal";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { ScoreProfiles } from "@/components/landing/ScoreProfiles";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";
import { MagneticButton } from "@/components/landing/MagneticButton";

const niveaux = [
  {
    n: "N1",
    titre: "Le bien",
    texte:
      "Tu saisis l’essentiel : adresse, prix, surface, DPE. Huit champs, pas une page entière à recopier.",
  },
  {
    n: "N2",
    titre: "Le marché",
    texte:
      "Déduit de l’adresse : prix/m² notarié (DVF), loyer estimé, tension locative, risques naturels et techno.",
  },
  {
    n: "N3",
    titre: "Les scénarios",
    texte:
      "Tu règles l’apport, l’emprunt, la stratégie et l’horizon. Le moteur calcule rendement, cash-flow et TRI.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-wide text-brand">
              Comparateur immobilier d’investissement
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-5 font-sans text-4xl font-semibold leading-[1.03] tracking-[-0.03em] text-text md:text-6xl">
              Compare tes biens.
              <br />
              Laisse les chiffres trancher.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
              Estio met tes annonces côte à côte, du point de vue de
              l’investissement. Une adresse suffit : elle déverrouille les
              données de marché, et le score reflète <em>tes</em> priorités.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <MagneticButton href="/connexion">Ajouter un bien</MagneticButton>
              <MagneticButton href="/comment-ca-marche" variant="ghost">
                Comment ça marche
              </MagneticButton>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-8 text-sm text-faint">
              Données de marché officielles · BAN · DVF · INSEE · Géorisques
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="flex justify-center lg:justify-end">
          <HeroVisual />
        </Reveal>
      </section>

      {/* Principe — zig-zag */}
      <section id="principe" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
        <Reveal>
          <span className="text-sm font-medium uppercase tracking-wide text-brand">
            Le principe
          </span>
          <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
            L’adresse déverrouille 80 % de la donnée.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Le formulaire est court parce que l’essentiel apparaît en résultat,
            pas en saisie. Trois niveaux se superposent.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-12 md:gap-16">
          {niveaux.map((niv, i) => (
            <Reveal key={niv.n} delay={i * 0.05}>
              <div className="grid items-center gap-4 md:grid-cols-2 md:gap-12">
                <div
                  className={`font-sans text-[4.5rem] font-semibold leading-none tracking-tighter text-brand/20 md:text-[7rem] ${
                    i % 2 === 1 ? "md:order-2 md:text-right" : ""
                  }`}
                >
                  {niv.n}
                </div>
                <div>
                  <h3 className="font-sans text-2xl font-semibold tracking-tight text-text">
                    {niv.titre}
                  </h3>
                  <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">
                    {niv.texte}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Score */}
      <section id="score" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-wide text-brand">
              Le score
            </span>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
              C’est <em>ton</em> score, pas le nôtre.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Choisis un profil, ou règle finement les pondérations. Le score se
              recalcule en direct, et on affiche toujours le détail : pourquoi ce
              bien l’emporte, critère par critère. Jamais de boîte noire.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ScoreProfiles />
          </Reveal>
        </div>
      </section>

      {/* Données */}
      <section id="donnees" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
        <Reveal>
          <span className="text-sm font-medium uppercase tracking-wide text-brand">
            Les données
          </span>
          <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
            De la donnée publique, un calcul transparent.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Toutes les sources sont publiques et officielles. Le moteur de calcul
            est déterministe : chaque chiffre financier est vérifiable, jamais
            produit par une IA.
          </p>
        </Reveal>
        <div className="mt-12">
          <SourcesMarquee />
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border py-24">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[1.4fr_0.6fr] md:items-end">
            <h2 className="font-sans text-4xl font-semibold tracking-[-0.02em] text-text md:text-5xl">
              Ajoute ton premier bien.
            </h2>
            <div className="md:justify-self-end md:text-right">
              <p className="mb-4 text-muted">Colle une adresse, on s’occupe du reste.</p>
              <MagneticButton href="/connexion" className="px-8 py-3.5">
                Commencer
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Supprimer l’ancien header de landing**

Run: `git rm src/components/landing/SiteNav.tsx`
Expected: fichier supprimé (il était importé uniquement par l’ancienne `page.tsx`, désormais réécrite).

- [ ] **Step 5: Vérifier le build**

Run: `npm run build`
Expected: succès ; route `/` rendue avec header + footer partagés ; aucune référence à `SiteNav`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(site): layout marketing partagé + landing nettoyée (no open data)"
```

---

### Task 4: Page « Comment ça marche »

**Files:**
- Create: `src/app/(marketing)/comment-ca-marche/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Reveal } from "@/components/landing/Reveal";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";

export const metadata: Metadata = {
  title: "Comment ça marche — Estio",
  description:
    "Une adresse déverrouille les données de marché. Estio superpose trois niveaux — le bien, le marché, les scénarios — et en tire un score personnalisé.",
};

const niveaux = [
  {
    n: "N1",
    titre: "Le bien",
    texte:
      "Tu renseignes huit champs : adresse, prix, surface, DPE. L’adresse est le champ clé — une fois géocodée, elle ouvre le reste.",
  },
  {
    n: "N2",
    titre: "Le marché",
    texte:
      "Dérivé automatiquement de l’adresse : prix/m² notarié, loyer estimé, tension locative, zonage, risques naturels et technologiques.",
  },
  {
    n: "N3",
    titre: "Les scénarios",
    texte:
      "Après comparaison, tu règles apport, emprunt, stratégie fiscale et horizon. Le moteur recalcule rendement, cash-flow et TRI.",
  },
];

export default function CommentCaMarche() {
  return (
    <>
      <PageHeader
        eyebrow="Comment ça marche"
        title="Une adresse, et tout se déverrouille."
        intro="Estio superpose trois niveaux de données. Tu ne saisis que le premier ; les deux autres apparaissent en résultat."
      />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-12 md:gap-16">
          {niveaux.map((niv, i) => (
            <Reveal key={niv.n} delay={i * 0.05}>
              <div className="grid items-center gap-4 md:grid-cols-2 md:gap-12">
                <div
                  className={`font-sans text-[4.5rem] font-semibold leading-none tracking-tighter text-brand/20 md:text-[7rem] ${
                    i % 2 === 1 ? "md:order-2 md:text-right" : ""
                  }`}
                >
                  {niv.n}
                </div>
                <div>
                  <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
                    {niv.titre}
                  </h2>
                  <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">
                    {niv.texte}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t border-border px-6 py-16">
        <Reveal>
          <h2 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text">
            Le score, transparent de bout en bout.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Tu choisis un profil (rentabilité, patrimoine, sécurité, équilibré)
            ou tu règles les pondérations. Elles se normalisent à 100 %, et le
            détail du calcul reste visible, critère par critère.
          </p>
        </Reveal>
        <div className="mt-12">
          <SourcesMarquee />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run build`
Expected: route `/comment-ca-marche` générée.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/comment-ca-marche/page.tsx"
git commit -m "feat(site): page Comment ça marche"
```

---

### Task 5: Table de tarifs + page Tarifs

**Files:**
- Create: `src/components/marketing/PricingTable.tsx`
- Create: `src/app/(marketing)/tarifs/page.tsx`

- [ ] **Step 1: Créer `src/components/marketing/PricingTable.tsx`**

```tsx
"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/landing/MagneticButton";

type Offre = {
  nom: string;
  prix: { mois: number; an: number };
  credits: string;
  wallet: string;
  features: string[];
  populaire: boolean;
};

const OFFRES: Offre[] = [
  {
    nom: "Free",
    prix: { mois: 0, an: 0 },
    credits: "3 crédits à vie",
    wallet: "Wallet 1 bien",
    features: ["Score personnalisé", "Comparaison de base", "Données de marché"],
    populaire: false,
  },
  {
    nom: "Pro",
    prix: { mois: 9, an: 90 },
    credits: "X crédits / mois",
    wallet: "Wallet capacité moyenne",
    features: [
      "Tout le plan Free",
      "Plus de stats & de précision",
      "Infos marché détaillées",
      "Recharge de crédits à la demande",
    ],
    populaire: true,
  },
  {
    nom: "Expert",
    prix: { mois: 19, an: 190 },
    credits: "XX crédits / mois",
    wallet: "Wallet grande capacité",
    features: [
      "Tout le plan Pro",
      "Fiscalité poussée (LMNP, TRI, plus-value)",
      "Scénarios avancés",
      "Wallet étendu",
    ],
    populaire: false,
  },
];

export function PricingTable() {
  const [annuel, setAnnuel] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span className={annuel ? "text-muted" : "font-medium text-text"}>
          Mensuel
        </span>
        <button
          onClick={() => setAnnuel((v) => !v)}
          role="switch"
          aria-checked={annuel}
          aria-label="Basculer mensuel / annuel"
          className="relative h-7 w-12 cursor-pointer rounded-full bg-bg-alt transition-colors"
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-brand transition-all ${
              annuel ? "left-6" : "left-1"
            }`}
          />
        </button>
        <span className={annuel ? "font-medium text-text" : "text-muted"}>
          Annuel <span className="text-score-high">−2 mois</span>
        </span>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {OFFRES.map((o) => (
          <div
            key={o.nom}
            className={`flex flex-col rounded-xl border bg-bg-elevated p-8 ${
              o.populaire
                ? "border-brand shadow-[0_20px_40px_-24px_rgba(70,50,30,0.35)]"
                : "border-border"
            }`}
          >
            {o.populaire ? (
              <span className="mb-3 self-start rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
                Le plus choisi
              </span>
            ) : null}
            <h3 className="font-sans text-xl font-semibold tracking-tight text-text">
              {o.nom}
            </h3>
            <div className="mt-4 font-sans text-4xl font-semibold tracking-tight text-text">
              {o.prix.mois === 0
                ? "0 €"
                : `${annuel ? o.prix.an : o.prix.mois} €`}
              <span className="text-base font-medium text-faint">
                {o.prix.mois === 0 ? "" : annuel ? " / an" : " / mois"}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-brand">{o.credits}</p>
            <p className="mt-1 text-sm text-muted">{o.wallet}</p>

            <ul className="mt-6 flex-1 space-y-3">
              {o.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-muted">
                  <svg className="mt-0.5 size-4 shrink-0 text-score-high" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10l4 4 8-8" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <MagneticButton
                href="/connexion"
                variant={o.populaire ? "primary" : "ghost"}
                className="w-full"
              >
                {o.nom === "Free" ? "Commencer" : `Choisir ${o.nom}`}
              </MagneticButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Créer `src/app/(marketing)/tarifs/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PricingTable } from "@/components/marketing/PricingTable";

export const metadata: Metadata = {
  title: "Tarifs — Estio",
  description:
    "Un crédit analyse un bien neuf et l’ajoute à ton wallet, réutilisable ensuite gratuitement. Free, Pro, Expert.",
};

export default function Tarifs() {
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
}
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run build`
Expected: route `/tarifs` générée.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/PricingTable.tsx "src/app/(marketing)/tarifs/page.tsx"
git commit -m "feat(site): page Tarifs (3 offres, toggle mensuel/annuel)"
```

---

### Task 6: Accordéon FAQ + page FAQ

**Files:**
- Create: `src/components/marketing/FaqAccordion.tsx`
- Create: `src/app/(marketing)/faq/page.tsx`

- [ ] **Step 1: Créer `src/components/marketing/FaqAccordion.tsx`**

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const FAQ = [
  {
    q: "D’où viennent les chiffres ?",
    r: "De sources publiques officielles : transactions notariées (DVF), loyers de référence, données INSEE, risques Géorisques, DPE ADEME. Estio les agrège et les met en perspective.",
  },
  {
    q: "Les calculs sont-ils fiables ?",
    r: "Le moteur de calcul est déterministe : rendement, cash-flow, fiscalité et TRI sont des maths exactes et auditables. Aucun chiffre financier n’est produit par une IA.",
  },
  {
    q: "Est-ce que mes données sont en sécurité ?",
    r: "Tes biens et comparaisons te sont privés. Nous ne revendons pas de données personnelles. Détails dans la politique de confidentialité.",
  },
  {
    q: "C’est quoi un crédit ?",
    r: "Un crédit analyse un bien neuf et l’ajoute à ton wallet. Ensuite, tu le recompares gratuitement. Tu ne paies que pour un bien encore jamais analysé.",
  },
  {
    q: "Quelle est la couverture géographique ?",
    r: "La France, dans la limite des données publiques disponibles pour chaque commune. La granularité varie selon les sources.",
  },
  {
    q: "Les projections de revente sont-elles garanties ?",
    r: "Non. Ce sont des scénarios explicites fondés sur des hypothèses, pas des prédictions. Estio le signale toujours clairement.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="divide-y divide-border border-y border-border">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-sans text-lg font-medium text-text">
                {item.q}
              </span>
              <svg
                className={`size-5 shrink-0 text-brand transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="10" y1="4" x2="10" y2="16" />
                <line x1="4" y1="10" x2="16" y2="10" />
              </svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    reduce ? { duration: 0.15 } : { type: "spring", stiffness: 120, damping: 22 }
                  }
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-10 leading-relaxed text-muted">{item.r}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Créer `src/app/(marketing)/faq/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Estio",
  description:
    "Sources de données, fiabilité des calculs, crédits, confidentialité : les réponses aux questions fréquentes sur Estio.",
};

export default function Faq() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Les questions qu’on nous pose."
      />
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <FaqAccordion />
      </section>
    </>
  );
}
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run build`
Expected: route `/faq` générée.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/FaqAccordion.tsx "src/app/(marketing)/faq/page.tsx"
git commit -m "feat(site): page FAQ (accordéon)"
```

---

### Task 7: Page « À propos »

**Files:**
- Create: `src/app/(marketing)/a-propos/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Reveal } from "@/components/landing/Reveal";

export const metadata: Metadata = {
  title: "À propos — Estio",
  description:
    "Estio aide les investisseurs à décider, chiffres à l’appui. Un score personnalisé, transparent, jamais une boîte noire.",
};

const blocs = [
  {
    titre: "Aider à décider, chiffres à l’appui.",
    texte:
      "Acheter pour investir se joue sur des chiffres — rendement, fiscalité, risques. Estio les rassemble, les calcule et les compare, pour que le choix soit clair plutôt qu’intuitif.",
  },
  {
    titre: "C’est ton score, pas le nôtre.",
    texte:
      "Le score reflète tes priorités : tu choisis ce qui compte. Et on montre toujours pourquoi un bien l’emporte, critère par critère. Un argument défendable, pas une opinion.",
  },
  {
    titre: "Honnêtes sur l’incertitude.",
    texte:
      "Les projections de revente sont des scénarios, pas des promesses. La granularité des données varie. On le dit clairement, à chaque fois.",
  },
];

export default function APropos() {
  return (
    <>
      <PageHeader
        eyebrow="À propos"
        title="Un comparateur qui assume ses chiffres."
        intro="Estio est né d’un constat simple : comparer deux biens du point de vue de l’investissement demande trop de calculs éparpillés. On les a réunis."
      />

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="flex flex-col gap-12">
          {blocs.map((b, i) => (
            <Reveal key={b.titre} delay={i * 0.05}>
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
                {b.titre}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">{b.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run build`
Expected: route `/a-propos` générée.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/a-propos/page.tsx"
git commit -m "feat(site): page À propos"
```

---

### Task 8: Formulaire de contact + page Contact

**Files:**
- Create: `src/components/marketing/ContactForm.tsx`
- Create: `src/app/(marketing)/contact/page.tsx`

- [ ] **Step 1: Créer `src/components/marketing/ContactForm.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";

/** Formulaire de contact — coquille : validation visuelle, aucun envoi réel. */
export function ContactForm() {
  const [envoye, setEnvoye] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div
        role="status"
        className="rounded-xl border border-border bg-bg-elevated p-8 text-center"
      >
        <p className="font-sans text-lg font-semibold text-text">
          Message bien reçu.
        </p>
        <p className="mt-2 text-muted">
          Démo : l’envoi n’est pas encore connecté. On te répondra dès que le
          service sera en ligne.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="nom" className="text-sm font-medium text-text">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          required
          autoComplete="name"
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-text">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-text">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        className="cursor-pointer self-start rounded-full bg-brand px-6 py-3 font-medium text-white transition-[transform,background-color] duration-100 hover:bg-brand-hover active:scale-[0.97]"
      >
        Envoyer
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Créer `src/app/(marketing)/contact/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Estio",
  description: "Une question, une remarque ? Écris-nous.",
};

export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Parlons-en."
        intro="Une question sur Estio, une suggestion, un partenariat ? Écris-nous, on lit tout."
      />
      <section className="mx-auto grid max-w-5xl gap-12 px-6 pb-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-sans text-lg font-semibold text-text">Par email</h2>
          <a
            href="mailto:contact@estio.immo"
            className="mt-2 inline-block text-brand hover:underline"
          >
            contact@estio.immo
          </a>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            On répond en général sous quelques jours ouvrés.
          </p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run build`
Expected: route `/contact` générée.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/ContactForm.tsx "src/app/(marketing)/contact/page.tsx"
git commit -m "feat(site): page Contact (formulaire coquille)"
```

---

### Task 9: Formulaire de connexion + page Connexion

**Files:**
- Create: `src/components/marketing/LoginForm.tsx`
- Create: `src/app/(marketing)/connexion/page.tsx`

- [ ] **Step 1: Créer `src/components/marketing/LoginForm.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";

/** Connexion — coquille : aucune auth réelle (viendra avec Supabase, E7). */
export function LoginForm() {
  const [info, setInfo] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfo(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-text">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-text">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-text outline-none focus:border-brand"
        />
      </div>

      {info ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-bg-alt px-4 py-3 text-sm text-muted"
        >
          La connexion n’est pas encore disponible — elle arrive bientôt.
        </p>
      ) : null}

      <button
        type="submit"
        className="cursor-pointer rounded-full bg-brand px-6 py-3 font-medium text-white transition-[transform,background-color] duration-100 hover:bg-brand-hover active:scale-[0.97]"
      >
        Se connecter
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Créer `src/app/(marketing)/connexion/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/marketing/LoginForm";

export const metadata: Metadata = {
  title: "Se connecter — Estio",
  description: "Accède à ton espace Estio.",
};

export default function Connexion() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="font-sans text-2xl font-semibold tracking-tight text-text"
      >
        estio<span className="text-brand">.</span>
      </Link>
      <h1 className="mt-8 font-sans text-3xl font-semibold tracking-[-0.02em] text-text">
        Content de te revoir.
      </h1>
      <p className="mt-2 text-muted">
        Connecte-toi pour retrouver ton wallet et tes comparaisons.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-faint">
        Pas encore de compte ? La création arrive bientôt.
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run build`
Expected: route `/connexion` générée.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/LoginForm.tsx "src/app/(marketing)/connexion/page.tsx"
git commit -m "feat(site): page Connexion (coquille)"
```

---

### Task 10: Gabarit légal + 3 pages légales

**Files:**
- Create: `src/components/marketing/LegalPage.tsx`
- Create: `src/app/(marketing)/mentions-legales/page.tsx`
- Create: `src/app/(marketing)/confidentialite/page.tsx`
- Create: `src/app/(marketing)/cgu/page.tsx`

- [ ] **Step 1: Créer `src/components/marketing/LegalPage.tsx`**

```tsx
import { PageHeader } from "./PageHeader";

export type LegalSection = { heading: string; body: string };

/** Gabarit des pages légales : en-tête + bandeau « à compléter » + sections. */
export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow="Mentions légales" title={title} />
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <p className="mb-10 rounded-lg border border-border bg-bg-alt px-4 py-3 text-sm text-muted">
          Gabarit à compléter avant mise en ligne (informations éditeur,
          hébergeur, responsable de traitement…).
        </p>
        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-sans text-xl font-semibold tracking-tight text-text">
                {s.heading}
              </h2>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Créer `src/app/(marketing)/mentions-legales/page.tsx`**

```tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales — Estio",
  description: "Mentions légales du site Estio.",
};

export default function MentionsLegales() {
  return (
    <LegalPage
      title="Mentions légales"
      sections={[
        {
          heading: "Éditeur du site",
          body: "Estio — [raison sociale, forme juridique, capital, RCS, adresse] à compléter avant mise en ligne.",
        },
        {
          heading: "Directeur de la publication",
          body: "[Nom du responsable de la publication] à compléter.",
        },
        {
          heading: "Hébergement",
          body: "Site hébergé par Vercel Inc. — [adresse de l’hébergeur] à compléter.",
        },
        {
          heading: "Propriété intellectuelle",
          body: "Les contenus du site (marque, textes, interface) sont protégés. Les données de marché proviennent de sources publiques officielles et restent la propriété de leurs producteurs respectifs.",
        },
      ]}
    />
  );
}
```

- [ ] **Step 3: Créer `src/app/(marketing)/confidentialite/page.tsx`**

```tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Confidentialité — Estio",
  description: "Politique de confidentialité et traitement des données personnelles.",
};

export default function Confidentialite() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      sections={[
        {
          heading: "Responsable de traitement",
          body: "[Entité responsable du traitement des données personnelles] à compléter avant mise en ligne.",
        },
        {
          heading: "Données collectées",
          body: "Compte (email), biens et comparaisons que tu enregistres. Ces informations te sont privées et ne sont pas revendues.",
        },
        {
          heading: "Finalités",
          body: "Fournir le service (analyse, comparaison, wallet), gérer ton compte et tes crédits.",
        },
        {
          heading: "Tes droits (RGPD)",
          body: "Accès, rectification, effacement, portabilité. [Adresse de contact du DPO / procédure] à compléter.",
        },
      ]}
    />
  );
}
```

- [ ] **Step 4: Créer `src/app/(marketing)/cgu/page.tsx`**

```tsx
import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "CGU — Estio",
  description: "Conditions générales d’utilisation d’Estio.",
};

export default function Cgu() {
  return (
    <LegalPage
      title="Conditions générales d’utilisation"
      sections={[
        {
          heading: "Objet",
          body: "Les présentes conditions régissent l’utilisation d’Estio, comparateur immobilier d’investissement. Version à compléter avant mise en ligne.",
        },
        {
          heading: "Nature du service",
          body: "Estio fournit des analyses et comparaisons à titre informatif. Les résultats ne constituent pas un conseil en investissement ; les projections sont des scénarios, pas des garanties.",
        },
        {
          heading: "Crédits et abonnements",
          body: "L’usage repose sur des crédits et des offres (Free, Pro, Expert). Les modalités détaillées de facturation seront précisées avant l’ouverture des paiements.",
        },
        {
          heading: "Responsabilité",
          body: "L’utilisateur reste seul responsable de ses décisions d’investissement. [Clauses de responsabilité complètes] à compléter.",
        },
      ]}
    />
  );
}
```

- [ ] **Step 5: Vérifier le build**

Run: `npm run build`
Expected: routes `/mentions-legales`, `/confidentialite`, `/cgu` générées.

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/LegalPage.tsx "src/app/(marketing)/mentions-legales" "src/app/(marketing)/confidentialite" "src/app/(marketing)/cgu"
git commit -m "feat(site): pages légales (gabarit + mentions, confidentialité, CGU)"
```

---

### Task 11: Vérification finale

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: succès, les 10 routes présentes (`/`, `/comment-ca-marche`, `/tarifs`, `/faq`, `/a-propos`, `/contact`, `/connexion`, `/mentions-legales`, `/confidentialite`, `/cgu`).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: aucune erreur (notamment aucune apostrophe `'` non échappée en JSX).

- [ ] **Step 3: Vérifier l’absence de « open data » dans le code source**

Run: `grep -rin "open data" src/ ; grep -rin "gratuit" src/`
Expected: aucune occurrence à propos des sources (le mot « gratuit » peut rester s’il qualifie l’offre Free, pas les données).

- [ ] **Step 4: Commit (si changement de lint)**

```bash
git add -A
git commit -m "chore(site): vérification build + lint OK" || echo "rien à committer"
```

---

## Critères d’acceptation (rappel spec §9)

1. 10 routes rendues, aucun lien mort header/footer. ✔ Tasks 3–10
2. Header : état actif + menu mobile. ✔ Task 2
3. Zéro « open data » dans l’UI, landing incluse. ✔ Tasks 3, 11
4. Header/footer partagés via layout `(marketing)`. ✔ Tasks 1–3
5. FAQ / Contact / Connexion interactifs sans backend. ✔ Tasks 6, 8, 9
6. Build + lint verts. ✔ Task 11
7. Pages légales marquées « à compléter ». ✔ Task 10
8. Modèle éco (crédit/wallet/3 offres) reflété en Tarifs. ✔ Task 5
