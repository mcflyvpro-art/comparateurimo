# PROGRESS.md — Journal d'avancement

> Suit **chaque session** et **chaque étape** du flow superpowers : `specs → plan → implementation`.
> Convention : une entrée par session, la plus récente en haut.

## Légende étapes (superpowers)

| Étape | Signification |
|-------|---------------|
| 📋 specs | Cadrage / brainstorm produit → `comparateur-immo-specs.md`, `MVP.md` |
| 🗺️ plan | Plan d'implémentation écrit avant de coder |
| 🔨 impl | Implémentation (TDD) |
| ✅ done | Vérifié, testé, intégré |

## État global

- **Phase actuelle** : 📋 specs — cadrage terminé, documentation de base créée.
- **Prochaine étape** : 🗺️ plan de la première tranche P0 (import capture → enrichissement → comparaison → score).
- **Aucune ligne de code** écrite à ce jour.

---

## Sessions

### Session 3 — 2026-07-19 — Identité de marque & design system Estio
**Étape : 🔨 impl (design system)**

- Nom retenu : **Estio** (`estio.immo`), remplace Arpent.
- Direction visuelle : `/apple-design` + couche chaude.
- Livré : charte (`docs/brand/estio-brandkit.md`), tokens (`src/design/tokens.css` + `tokens.ts`), branchement Tailwind (`globals.css`), logo placeholder, 4 maquettes, police General Sans + `motion`.
- Spec : `docs/superpowers/specs/2026-07-19-estio-brandkit-design.md`. Plan : `docs/superpowers/plans/2026-07-19-estio-brandkit.md`.

**Prochaine session**
- Landing page Estio avec `/apple-design`.

---

### Session 2 — 2026-07-19 — Scaffold app + Supabase
**Étape : 🔨 impl (mise en place infra)**

- Scaffold **Next.js 16** (App Router, TypeScript, Tailwind 4, `src/`, ESLint).
- Câblage **Supabase SSR** (`@supabase/ssr` + `supabase-js`) :
  - `src/lib/supabase/client.ts` (navigateur), `server.ts` (serveur/cookies), `middleware.ts` (refresh session).
  - `src/proxy.ts` — convention Next 16 (remplace `middleware.ts`).
- `.env.local` (clés Supabase, gitignored) + `.env.example`.
- Route `/api/health` de test connexion + landing Arpent (crème/terre cuite).
- Build OK, commit + push sur `origin/main` (`02661af`).

**À faire côté utilisateur**
- Import Vercel : preset **Next.js**, ajouter les 3 variables d'env, déployer.
- **Régénérer les clés Supabase** (exposées dans le chat).

**Prochaine session**
- Schéma BDD Supabase (`properties`, `market_cache`, `comparisons`, `credits`) + RLS.

---

### Session 1 — 2026-07-19 — Cadrage & documentation initiale
**Étape : 📋 specs**

- Lu et validé `comparateur-immo-specs.md` (v0.1) comme source de vérité produit.
- Créé la documentation de base du projet :
  - `CLAUDE.md` — guidage Claude Code : principe des 3 niveaux de données, 5 règles d'architecture non négociables (moteur déterministe, scraping optionnel, ne pas vendre la donnée brute, honnêteté granularité, rampes → formulaire), score personnalisé, marque.
  - `MVP.md` — 7 épiques (import, enrichissement N2, moteur calcul, score, comparateur, scénarios, crédits/paiement), features priorisées P0/P1/P2.
  - `ARCHITECTURE.md` — stack Next.js/Vercel + Supabase + moteur TS déterministe + LLM extraction, découpage en modules, frontières architecturales.
  - `PROGRESS.md` — ce journal.
- Environnement : projet greenfield, aucun code. Vercel CLI non installé.

**Décisions prises**
- Moteur de calcul en **TypeScript pur** (pas de FastAPI au MVP → évite un 2e déploiement).
- Rampe d'import universelle = **capture d'écran lue par LLM** ; le lien reste optionnel/jetable.

**Reste à trancher (6 questions ouvertes, cf. `MVP.md`)**
- Cible onboarding · pondérations profils · frontière gratuit/payant · périmètre géo · nombre de biens comparés · modèle LLM.

**Prochaine session**
- Brainstorming pour trancher les questions ouvertes P0, puis 🗺️ plan de la tranche P0.

---

<!-- Modèle d'entrée à copier pour la prochaine session :

### Session N — AAAA-MM-JJ — Titre
**Étape : 📋/🗺️/🔨/✅**

- …

**Décisions prises**
- …

**Prochaine session**
- …
-->
