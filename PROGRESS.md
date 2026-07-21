# PROGRESS.md — Journal & Roadmap Estio

> Pilote unique de l'avancement. Grandes lignes des 7 phases + détail de la phase en cours + historique des sessions.
> **Direction (réorientation 2026-07-21) : le pipeline de décision alimenté par capture universelle.** Voir `REORIENTATION-ESTIO.md`. Périmètre : **France entière**.

---

## Priorité stratégique (à lire en premier)

Décision utilisateur : **on saute les raffinements design et on va directement au dev de l'OUTIL** (le pipeline). Le pointeur est sur la **Phase 2**.

Les hypothèses risquées (réorientation §10) restent à valider *en construisant*, pas en amont — notée pour mémoire :
1. **Fiabilité N2 sur France entière** — les chiffres sont-ils crédibles ? (afficher un indice de confiance)
2. **Confiance** — un investisseur confierait-il une décision au verdict ?
3. **Willingness-to-pay** — payer un abonnement pour piloter sa recherche ?
4. **Ingestion hors-portail** — la capture tient-elle sur des documents variés ?

> Un **prototype UX** du parcours (React, mobile-first : board à statuts, capture simulée, fiche avec recalcul live, arbitrage avec profils, 3 abonnements avec gating) a été construit et **validé côté ergonomie**. Il fait référence pour l'UX de la Phase 2.

---

## Méthodologie de travail — NON NÉGOCIABLE

1. **Chaque phase débute par un gros brainstorm** (`superpowers:brainstorming`). Pas de code avant brainstorm.
2. **Le brainstorm → immense spec → découpée en petits plans.** Petite feature, petite spec, petit plan.
3. **L'utilisateur est la SOURCE DE VÉRITÉ.** Claude ne coche qu'après un **« c'est bon » explicite** (validation sur Vercel).
4. **La mémoire retient chaque session.** Nouvelle session → reprendre au **dernier point non coché**.
5. **On avance 1 par 1.** Validation utilisateur **avant** de passer à la suivante.

**STOP — Claude demande avant de :** passer à la feature/phase suivante · cocher sans le « c'est bon ».

### Comment lire ce fichier
- `- [ ]` = à faire · `- [x]` = **validé par l'utilisateur** (« c'est bon » sur Vercel).
- Seule la **phase en cours** est détaillée ; les suivantes restent en grandes lignes jusqu'à leur brainstorm.

---

## Roadmap — 7 phases (grandes lignes)

- [ ] **Phase 1 — Design/UI & arborescence** *(largement fait S3-S7 ; on ne s'y attarde plus)*.
- [ ] **Phase 2 — L'OUTIL : le pipeline de décision** *(EN COURS)* : modèle Projet→Biens(N1) · capture universelle (Grok) · N2 recalculé · moteur déterministe · board à statuts · fiche + scénario live · score perso · arbitrage langage naturel · floutage freemium (pas de crédits).
- [ ] **Phase 3 — Surveillance & rétention** : alertes prix/taux, notifications vivantes.
- [ ] **Phase 4 — Pages header/footer** : légales, disclaimers, À propos.
- [ ] **Phase 5 — Comptes & sessions** : Google + email/mot de passe.
- [ ] **Phase 6 — Stripe** : abonnements Free/Pro/Expert + gating.
- [ ] **Phase 7 — Cybersécurité** : code review, polish, attaques via repo Strix.

---

## ▶ Phase en cours : Phase 2 — L'OUTIL : le pipeline de décision

> Objectif : le cœur produit fonctionnel — créer un projet, alimenter le board, piloter les statuts, voir une fiche bien avec analyse poussée + scénario en direct, arbitrer entre finalistes. Parcours `REORIENTATION-ESTIO.md` §7. Détail features : `MVP.md` Phase 2.

### Brainstorm & spec (fait le 2026-07-21)
- [ ] **Brainstorm `superpowers` Phase 2** — fait (companion visuel). Décisions : desktop-first CRM (Attio/Notion/Monday), identité dark grotesk de la landing, 3 vues (Pipeline/Tableau/Carte), Comparer=action+arbitrage intégré, fiche drawer + analyse complète, flux d'ajout en 2 temps, schéma Supabase complet, utilisateur démo seedé, pas de freemium mais tooltips « ? ». **France entière.**
- [ ] **Spec écrite** — `docs/superpowers/specs/2026-07-21-outil-pipeline-structure-design.md` (validée par l'utilisateur).

### Le build « structure » découpé en 8 petits plans (exécutés 1 par 1, validés sur Vercel)
> Chaque plan détaillé est écrit **juste avant** son exécution (contre le vrai code). Plan 1 écrit : `docs/superpowers/plans/2026-07-21-plan1-schema-seed.md`.
- [ ] **Plan 1 — Schéma Supabase & seed** : toutes les tables + enums + RLS + Storage (photos/docs) + utilisateur démo + seed + client serveur démo + types TS. *(plan écrit, prêt à exécuter)*
- [ ] **Plan 2 — App shell & navigation** : layout `(app)`, sidebar (projets+switcher+nav), barre du haut, onglets de vues, page projets, refonte du `/app`.
- [ ] **Plan 3 — Vue Pipeline (board + drawer)** : Kanban 6 colonnes, carte-bien riche, drag & drop + `status_history`, drawer d'aperçu.
- [ ] **Plan 4 — Vue Tableau** : table dense triable, colonnes chiffrées (moteur `calc/`).
- [ ] **Plan 5 — Fiche complète** : page pleine (sections ①→⑨), scénario en direct, tooltips « ? », photos/documents.
- [ ] **Plan 6 — Vue Carte** : MapLibre + épingles par score + mini-aperçu.
- [ ] **Plan 7 — Comparer / Arbitrage** : sélection multi, côte à côte, verdict langage naturel (gabarit déterministe), profils de priorité.
- [ ] **Plan 8 — Flux Ajouter un bien** : écran d'entrée (rampes → exemple généré) → formulaire de vérif/ajout, widget extension + coquille `/extension`.

> **Hors de ce build (étapes ultérieures) :** vrai piochage web N2 · rampes d'extraction réelles (Grok) · formules fiscales exactes · floutage freemium + Stripe · auth réelle · surveillance/alertes · version mobile.

---

## Phases suivantes (grandes lignes — à détailler à leur brainstorm)

### Phase 3 — Surveillance & rétention
- [ ] Brainstorm `superpowers` Phase 3
- [ ] Surveillance projet actif (baisse de prix, taux, nouveau comparable)
- [ ] Notifications vivantes + alertes prix/taux (hebdo Pro / temps réel Expert)

### Phase 4 — Pages header/footer
- [ ] Brainstorm `superpowers` Phase 4
- [ ] Mentions légales, CGU, confidentialité, **disclaimers** (aide à la décision, pas conseil réglementé)
- [ ] À propos + pages de texte

### Phase 5 — Comptes & sessions
- [ ] Brainstorm `superpowers` Phase 5
- [ ] Google · email/mot de passe · session connectée aux projets · RLS

### Phase 6 — Stripe
- [ ] Brainstorm `superpowers` Phase 6
- [ ] Abonnements Free/Pro/Expert (mensuel/annuel) + gating serveur

### Phase 7 — Cybersécurité
- [ ] Brainstorm `superpowers` Phase 7
- [ ] Code review + durcissement (RLS, validation, secrets, rate-limit)
- [ ] Campagne d'attaques repo **Strix** + corrections

---

## Historique des sessions (le plus récent en haut)

> Journal factuel. Les coches vivent dans la roadmap, décidées par l'utilisateur.

### Session 10 — 2026-07-21 — Plan 1 exécuté (schéma Supabase & seed)
**Étape : 🔨 impl — Plan 1**
- **Plan 1 exécuté inline** (migrations couplées → inline plutôt que subagent ; subagent-driven réservé aux plans UI 2-8). Les 8 tâches faites.
- **Base Supabase `cltvujujsmigbbtnslmk` : 12 tables + enums + RLS + 2 buckets Storage privés.** Advisor sécurité : 0 alerte. Migrations committées dans `supabase/migrations/` (`20260721000001`→`…07`).
- **Seed** : user démo (`…e5`), 2 projets, 6 biens (tous statuts), 6 scénarios, 3 notes, 1 contact, 1 market_snapshot. Vérifié.
- **App** : `src/lib/supabase/demo.ts` (`getDemoClient()` service role filtré par `DEMO_USER_ID`) + types générés `types.ts` + `/app` lit les projets réels. Écart vs plan : service role au lieu de `signInWithPassword` (plus robuste). Exclu les fichiers de référence du lint. **Build + lint verts.**
- Commits : `3e9d1e1` (plan), `ea163e9` (schéma), `ca94785` (seed), `0248dbb` (app). Poussé sur `main`.
- **⚠️ Vercel** : `/app` requiert `SUPABASE_SECRET_KEY` en env var Vercel (sinon KO).
- **En attente** : validation utilisateur de `/app` sur Vercel → « c'est bon » → cocher Plan 1. **Prochaine action** : Plan 2 (App shell & navigation).

### Session 9 — 2026-07-21 — Brainstorm Phase 2 (l'outil) + spec + Plan 1
**Étape : 🗺️ brainstorm → spec → plans**
- L'utilisateur fournit `simulateur-esio.jsx` (proto mobile) comme **référence de parcours uniquement** (rien du design/couleurs/calculs).
- **Brainstorm `superpowers`** avec companion visuel (maquettes dans le navigateur). Décisions figées : **desktop-first CRM** (refs Attio/Notion/Monday, « pas vide », orienté client) · identité **dark grotesk de la landing** (pas le teal du proto) · **3 vues** Pipeline/Tableau/Carte · **Comparer = action** avec **arbitrage (verdict langage naturel + profils) intégré** (pas une vue séparée) · fiche = **drawer + page d'analyse complète** (la plus poussée : marché exhaustif, financement poussé, tous calculs, fiscalité tous régimes, scénario live) · **flux d'ajout en 2 temps** (rampes → exemple → formulaire de vérif) + widget **extension** → page `/extension` · **schéma Supabase complet dès maintenant** (toutes les tables, photos/docs) · **utilisateur démo seedé** (auth réelle = Phase 5) · **pas de freemium** dans ce build mais **tooltips « ? »** partout. **France entière** (confirmé).
- **Spec** écrite + committée (`6e18efd`) : `docs/superpowers/specs/2026-07-21-outil-pipeline-structure-design.md`. Découpage en **8 petits plans**.
- **Plan 1** écrit + committé (`3e9d1e1`) : `docs/superpowers/plans/2026-07-21-plan1-schema-seed.md` (8 tâches : migrations → RLS → seed démo → client serveur + types).
- Supabase cible : projet **comparateurimo** `cltvujujsmigbbtnslmk` (vide, prêt).
- **Méthode de plans** : chaque plan détaillé est écrit **juste avant** son exécution (contre le vrai code), pas les 8 d'un coup.
- **Prochaine action** : exécuter le **Plan 1** (subagent-driven ou inline), valider sur Vercel, puis écrire le Plan 2.

### Session 8 — 2026-07-21 — RÉORIENTATION : pipeline de décision
**Étape : 📋 cadrage — pivot stratégique**
- L'utilisateur a fourni `REORIENTATION-ESTIO.md` : Estio n'est plus « comparateur/analyseur d'annonces » (marché saturé) mais **le pipeline de décision de l'investisseur** (« le CRM de ta recherche immo »), alimenté par **capture universelle**.
- Changements majeurs : board à statuts (Kanban) = cœur · on stocke le **bien (N1)**, N2/N3 **recalculés à la volée** (fin du « wallet obsolète ») · modèle **abonnement, PAS de crédits sur le cœur** · arbitrage en **langage naturel** · fiche avec **scénario en direct**.
- **Décisions utilisateur explicites cette session :** (1) **France entière**, pas 1-2 villes (contre la reco §8/§10 du doc — le risque N2 est assumé, à mitiger par un indice de confiance). (2) **On saute les raffinements design** et on va **directement au dev de l'outil** → pointeur placé sur **Phase 2**.
- Réécriture complète de `CLAUDE.md`, `MVP.md`, `ARCHITECTURE.md`, `PROGRESS.md` + mémoire projet selon la nouvelle direction.
- **Prochaine action : brainstorm `superpowers` Phase 2** (parcours §7 de bout en bout), puis découpage E0→E7.

### Session 7 — 2026-07-20 — Refonte landing 1b (scroll signature speedy.io)
**Étape : 🔨 impl — sous-phase 1b (design-craft)**
- Section pin 600vh (`PinnedNiveaux.tsx`, 5 étapes crossfade + stepper style Stripe, rail continu), smooth scroll Lenis (un seul, `providers/SmoothScroll`), sections score/données/CTA premium, PageHeader + footer harmonisés. Lint + build verts.
- Commits : `27e62c0`, `57ab411`, `fba18c9`, `120acf7`, `76dc173`, `0b4ece7`, `9d87411`.
- *Note post-réorientation : le design est désormais mis en pause au profit du dev de l'outil.*

### Session 6 — 2026-07-19 — Adoption de la méthodo 7 phases
**Étape : 📋 cadrage méthodo**
- 5 règles non négociables + roadmap 7 phases. Réécriture des docs de travail. *(La vision « crédits/comparateur » de cette session est remplacée par la réorientation S8.)*

### Session 5 — 2026-07-19 — Site public (header, pages, footer, modèle éco)
**Étape : 🔨 impl** — 10 routes, `SiteHeader`/`MobileMenu`/`SiteFooter`, layout `(marketing)`, `PricingTable`/`FaqAccordion`/`ContactForm`/`LoginForm`/`LegalPage`. Build + lint verts.

### Session 4 — 2026-07-19 — Landing Estio
**Étape : 🔨 impl** — Landing complète (hero, principe zig-zag, score interactif, marquee, CTA). Composants `landing/`. Accessibilité AA.

### Session 3 — 2026-07-19 — Marque & design system
**Étape : 🔨 impl** — Nom **Estio**. Charte `docs/brand/estio-brandkit.md`. Tokens `src/design/tokens.{css,ts}`. General Sans + Motion.

### Session 2 — 2026-07-19 — Scaffold + Supabase
**Étape : 🔨 impl (infra)** — Next.js 16.2.10 (App Router, TS 5, Tailwind 4). Supabase SSR. `.env.local` + `/api/health`. Moteur calc en TS pur. Fluid Compute.

### Session 1 — 2026-07-19 — Cadrage & doc initiale
**Étape : 📋 specs** — Validé `comparateur-immo-specs.md`. Créé les docs de travail. Rampe d'import = capture lue par LLM.

---

<!-- Modèle entrée session :

### Session N — AAAA-MM-JJ — Titre
**Étape : 📋/🗺️/🔨**
- …
-->
