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
- [x] **Brainstorm `superpowers` Phase 2** — fait (companion visuel). Décisions : desktop-first CRM (Attio/Notion/Monday), identité dark grotesk de la landing, 3 vues (Pipeline/Tableau/Carte), Comparer=action+arbitrage intégré, fiche drawer + analyse complète, flux d'ajout en 2 temps, schéma Supabase complet, utilisateur démo seedé, pas de freemium mais tooltips « ? ». **France entière.**
- [x] **Spec écrite** — `docs/superpowers/specs/2026-07-21-outil-pipeline-structure-design.md` (validée par l'utilisateur).

### Le build « structure » découpé en 8 petits plans (exécutés 1 par 1, validés sur Vercel)
> Chaque plan détaillé est écrit **juste avant** son exécution (contre le vrai code). Plan 1 écrit : `docs/superpowers/plans/2026-07-21-plan1-schema-seed.md`.
- [x] **Plan 1 — Schéma Supabase & seed** : toutes les tables + enums + RLS + Storage (photos/docs) + utilisateur démo + seed + client serveur démo + types TS. **Validé sur Vercel le 2026-07-21** (`/app` affiche les 2 projets seedés réels).
- [x] **Plan 2 — App shell & navigation** : layout `(app)`, sidebar (projets+switcher+nav), barre du haut, onglets de vues, page projets, refonte du `/app`. **Validé sur Vercel le 2026-07-21.**
- [x] **Plan 3 — Vue Pipeline (board + drawer)** : Kanban 6 colonnes, carte-bien riche, drag & drop + `status_history`, drawer d'aperçu. **Validé sur Vercel le 2026-07-22.**
- [x] **Plan 4 — Vue Tableau** : table dense triable, colonnes chiffrées (moteur `calc/`). **Validé sur Vercel le 2026-07-22.**
- [x] **Plan 5a — Fiche complète (moteur + page statique)** : page pleine (sections ①→⑨) sur données réelles, moteur de calcul complet (financement/cashflow/fiscalité/marché mock), scénario en lecture seule. **Validé sur Vercel le 2026-07-23.** Suite : Plan 5b (scénario en direct), Plan 5c (photos/documents).
- [ ] **Plan 6 — Vue Carte** : MapLibre + épingles par score + mini-aperçu.
- [ ] **Plan 7 — Comparer / Arbitrage** : sélection multi, côte à côte, verdict langage naturel (gabarit déterministe), profils de priorité.
- [ ] **Plan 8 — Flux Ajouter un bien** : écran d'entrée (rampes → exemple généré) → formulaire de vérif/ajout, widget extension + coquille `/extension`.

> **Hors de ce build (étapes ultérieures) :** vrai piochage web N2 · rampes d'extraction réelles (Grok) · formules fiscales exactes · floutage freemium + Stripe · auth réelle · surveillance/alertes · version mobile.

### Repères techniques (à lire en priorité à la reprise — évite de ré-explorer le repo)

> Mis à jour après chaque plan. But : reprendre directement au brainstorm du plan suivant sans Glob/Grep/Read exploratoires.

- **Schéma & données** : `supabase/migrations/2026072100000{1-7}*.sql` (tables/enums/RLS/seed) · types générés `src/lib/supabase/types.ts` (`Database`) · accès `getDemoClient()` + `DEMO_USER_ID` (`src/lib/supabase/demo.ts`), toujours filtrer `user_id` (et `project_id` sur écritures ciblées).
- **App shell (Plan 2)** : `src/components/app/AppSidebar.tsx`, `AppTopbar.tsx`, `ViewTabs.tsx` (+`type ViewKey`), `ViewPlaceholder.tsx`, `CreateProjectForm.tsx` · route `/app/p/[projectId]/{layout,page}.tsx`.
- **Pipeline (Plan 3)** : `src/lib/pipeline-types.ts` (`PropertyStatus`, `NoteKind`, `PipelineProperty`, `STATUS_COLUMNS` — types partagés à réutiliser tels quels, ne pas redéfinir) · `src/lib/calc/score.ts` (moteur pur : `computeRendementBrutPct`, `computeVerdict`, `verdictLabel` — mono-critère provisoire, pondération multi-critères = Plan 7) · `src/lib/format.ts` (`formatEUR`, `formatPercent`, `formatM2`, `formatPricePerM2`, `daysSince`) · `src/lib/board-position.ts` (`computeDropPosition`, fractional indexing) · composants `VerdictBadge`, `PropertyCard`, `PipelineColumn`, `PropertyDrawer`, `DiscardReasonModal`, `PipelineBoard` (`src/components/app/`) · server actions `moveProperty`/`addQuickNote` (`src/app/(app)/app/p/[projectId]/actions.ts`).
- **Conventions figées** (valables pour tous les plans restants) : dark grotesk only (`src/design/tokens.css`/`globals.css`, classes `bg-bg`/`bg-bg-alt`/`text-text`/`text-muted`/`text-faint`/`text-brand`/`border-border`/`text-score-{high,mid,low}`) · pas de lib d'icônes (fait-main), `@dnd-kit` = seule exception lib UI validée · **aucun framework de test** → vérif = `npx tsc --noEmit` + `npm run build` + `npm run lint` + vérif manuelle (jamais de test unitaire à écrire) · `export const dynamic = "force-dynamic"` sur toute route Server Component qui lit Supabase · fonctionnalités pas encore construites = état désactivé avec `title` explicite, jamais un lien mort.
- **Tableau (Plan 4)** : `src/lib/hooks/use-property-drawer.ts` (hook partagé board+table : `properties`, `columns`, `selectedProperty`, `openDrawer`/`closeDrawer`, `performMove`, `handleStatusChange`, `handleAddNote`, `pendingDiscard`/`confirmDiscard`/`cancelDiscard` — `PipelineBoard` en a été refactoré pour l'utiliser) · `src/lib/table-columns.tsx` (`TABLE_COLUMNS`, `DEFAULT_COLUMN_IDS`, `REQUIRED_COLUMN_ID`, types `TableColumn`/`TableColumnId`/`TableRow` — source unique colonnes/tri/rendu, à réutiliser tel quel) · `src/lib/hooks/use-local-storage-set.ts` (persistance générique) · composant `PropertyTable` (`src/components/app/`).
- **Fiche complète (Plan 5a)** : `src/lib/calc/{financing,cashflow,tax,market-mock}.ts` (moteur pur, sans I/O — voir en-tête de chaque fichier pour les fonctions exportées ; `computeFinancingCosts` = source unique du capital emprunté, à réutiliser partout, ne pas re-dériver) · `src/lib/property-detail-types.ts` (`PropertyRow`, `PropertyScenarioRow`, `ContactRow`, `PropertyDetailNote`/`Photo`/`Document`, `PropertyDetail` — types individuels consommés par les sections, le composite `PropertyDetail` n'est pas construit dans `page.tsx`) · `src/components/app/fiche/` (9 sections ①→⑨ + `SectionCard`/`InfoTooltip` partagés) · route `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx` · `PropertyDrawer` a maintenant une prop `projectId: string` obligatoire (2 appelants : `PipelineBoard`, `PropertyTable`).
- **Dette technique connue (non bloquante, notée en revue de branche complète)** — 3 points à traiter idéalement au Plan 5b (le code est de toute façon rouvert pour l'interactivité) : (1) formule de mensualité "in fine = intérêts seuls" dupliquée dans `SectionFinancement.tsx` et `SectionCalculs.tsx` → à extraire en fonction partagée dans `financing.ts` ; (2) libellés français des régimes fiscaux en 2 copies (`tax.ts:REGIME_LABELS` et `SectionScenario.tsx:TAX_REGIME_LABELS`) → faire de `tax.ts` la source unique ; (3) base d'intérêt différente entre ⑤ Calculs (tableau d'amortissement réel année 1) et ⑥ Fiscalité (capital initial × taux) → l'impôt du régime "Actuel" peut légèrement différer entre les deux sections, à unifier quand les formules fiscales exactes arriveront.
- **Pour le Plan 5b (Scénario en direct)** : `SectionScenario` (`src/components/app/fiche/SectionScenario.tsx`) est en lecture seule avec un commentaire explicite pointant vers ce plan — y ajouter les curseurs + recalcul live (réutiliser `src/lib/calc/*` tel quel) + une server action de sauvegarde du scénario.
- **Pour le Plan 5c (Photos/documents)** : `SectionHumain` (`src/components/app/fiche/SectionHumain.tsx`) affiche des placeholders explicites pour les photos/documents (`property_photos`/`property_documents`, buckets Storage déjà créés au Plan 1) — y ajouter l'upload.

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

### Session 14 — 2026-07-23 — Plan 5a exécuté (fiche complète — moteur + page)
**Étape : 🔨 impl — Plan 5a**
- **Brainstorm + spec** : découpage du Plan 5 de la spec parente en 5a (moteur + page statique, cette session) / 5b (scénario en direct) / 5c (photos/documents), décision utilisateur. Spec : `docs/superpowers/specs/2026-07-22-plan5a-fiche-complete-design.md`.
- **Plan écrit** : `docs/superpowers/plans/2026-07-22-plan5a-fiche-complete.md` (14 tâches, code complet).
- **Exécuté en subagent-driven-development** (un sous-agent implémenteur + un reviewer par tâche, re-revue après chaque correctif), directement sur `main`, avec reprise après une interruption de session (ledger `.superpowers/sdd/progress.md` utilisé pour reprendre sans re-dérouler les tâches déjà faites).
- **7 bugs réels trouvés en revue et corrigés avant de passer à la tâche suivante** (aucun n'a bloqué durablement le plan) : décalage de bits signé au lieu de non-signé dans `market-mock.ts` (valeurs `undefined`/négatives ~50% du temps) · non-convergence de `computeTRI` silencieusement acceptée (taux absurdes du type `1e+176`) · accessibilité d'`InfoTooltip` (pas de fermeture clic-hors-zone/Échap, pas de liaison ARIA) · duplication `STATUS_LABELS` dans `SectionVerdict` (dédupliqué via `STATUS_COLUMNS`) · mensualité affichée fausse pour un prêt in fine dans `SectionFinancement` ET `SectionCalculs` (utilisait la formule amortissable) · base de calcul du prêt incohérente dans `SectionFiscalite` (ignorait travaux/frais, risque de fausser le classement fiscal) · filtre `user_id` manquant sur 3 requêtes enfants (`property_notes`/`photos`/`documents`, défense en profondeur RLS).
- **2 dettes techniques mineures notées, non bloquantes** (dupliquées mais sans divergence actuelle) : formule mensualité in fine dupliquée `SectionFinancement`/`SectionCalculs` ; libellés régimes fiscaux dupliqués `tax.ts`/`SectionScenario.tsx`.
- **Livré** : moteur `src/lib/calc/{financing,cashflow,tax,market-mock}.ts`, types `src/lib/property-detail-types.ts`, 9 composants de section + `SectionCard`/`InfoTooltip` (`src/components/app/fiche/`), route `bien/[propertyId]/page.tsx`, `PropertyDrawer` (+ 2 appelants) mis à jour.
- **Vérification finale** : `npm run build` ✅, `npm run lint` ✅ (0 erreur, 5 warnings préexistants hors périmètre), QA manuelle via `npm run dev` + `curl` (9 sections rendues sur données réelles, lien drawer→fiche depuis Pipeline et Tableau, 404 sur bien inexistant, toggle annuel/mensuel et tableau fiscal présents).
- **Prochaine action** : validation utilisateur sur Vercel → « c'est bon » → cocher Plan 5a → brainstorm Plan 5b.

### Session 13 — 2026-07-22 — Plan 4 validé, démarrage Plan 5
**Étape : 🗺️ brainstorm → spec → plan**
- **Plan 4 (Vue Tableau) validé sur Vercel** (« c'est bon ») → coché. Commits `71fb335`→`74b4d9a` (+ fix lint `b6b7c2d`).
- Digression logo/branding et animation hero traitée hors roadmap cette session (voir mémoire `logo-officiel-estio`, `scroll-video-higgsfield-abandonne`) — sans impact sur Phase 2.
- **Prochaine action** : brainstorm `superpowers` du Plan 5 (Fiche complète).

### Session 12 — 2026-07-22 — Plan 3 exécuté (Vue Pipeline) + optimisation reprise de session
**Étape : 🔨 impl — Plan 3**
- Plan 2 validé sur Vercel en amont → coché.
- **Brainstorm + spec** : `docs/superpowers/specs/2026-07-21-plan-3-vue-pipeline-design.md`. Décisions clés : mini moteur `calc/` créé dès ce plan (pas de mock statique), drag & drop via `@dnd-kit` (pas de fait-main, board jugé trop fragile), carte riche avec fallback photo obligatoire (aucune photo seedée/upload avant Plan 5), raison d'écart via modale bloquante, drawer interactif (statut + note rapide), score provisoire = rendement brut mono-critère.
- **Plan écrit** : `docs/superpowers/plans/2026-07-21-plan3-vue-pipeline.md` (10 tâches, code complet).
- **Exécuté par un unique subagent** (pas de subagent-driven par tâche cette fois, un seul agent a déroulé les 10 tâches + commits + cases cochées), sur `main`. `tsc`/`build`/`lint` vérifiés indépendamment après coup par Claude (trust but verify) : tous verts.
- **Livré** : `src/lib/pipeline-types.ts`, `src/lib/calc/score.ts`, `src/lib/format.ts`, `src/lib/board-position.ts`, `VerdictBadge`/`PropertyCard`/`PipelineColumn`/`PropertyDrawer`/`DiscardReasonModal`/`PipelineBoard`, server actions `moveProperty`/`addQuickNote`, `page.tsx` branché sur les vraies données.
- Commits `0fa31c5`→`e92e0ef`. **Poussé sur `main`** (accord utilisateur) → déploiement Vercel auto.
- **Validé par l'utilisateur sur Vercel** (« c'est bon ») → Plan 3 coché.
- **Optimisation demandée par l'utilisateur** : chaque reprise de session coûte des dizaines de milliers de tokens d'exploration (Glob/Grep/Read sur migrations, types, composants). Option `/graphify` évaluée et écartée pour ce besoin précis : le graphe existant (`graphify-out/`) date du 2026-07-19 (avant toute la Phase 2), a coûté 182k tokens input à générer, et se re-génère à ce prix à chaque mise à jour — pas rentable pour un repo que Claude connaît déjà. **Solution retenue** : section « Repères techniques » ajoutée ci-dessus dans ce fichier, tenue à jour après chaque plan (fichiers/types/conventions déjà posés), à lire en priorité à la reprise au lieu de ré-explorer le repo.
- **Prochaine action** : brainstorm/écriture du Plan 4 (Vue Tableau).

### Session 11 — 2026-07-21 — Plan 2 exécuté (app shell & navigation)
**Étape : 🔨 impl — Plan 2**
- Plan 1 validé sur Vercel en amont de cette session (`/app` affichait bien les 2 projets seedés réels) → coché.
- **Plan 2 écrit** : `docs/superpowers/plans/2026-07-21-plan2-app-shell-navigation.md` (8 tâches).
- **Plan 2 exécuté en subagent-driven-development** (sous-agent implémenteur + revue par tâche + revue finale de branche), directement sur `main` (choix utilisateur, comme le Plan 1).
- **Nouveau shell** : `AppSidebar` (projets actifs/archivés + switcher), `AppTopbar` (nom/critères + recherche/Comparer/+Ajouter **désactivés avec tooltip** pointant vers leur plan cible), `ViewTabs` (Pipeline/Tableau/Carte, chacune un placeholder nommant son plan), page `/app/projects` (liste + création de projet via Server Action), `/app` redirige vers le dernier projet actif ou vers la liste, route `/app/p/[projectId]` (layout + page, `notFound()` si le projet n'appartient pas à l'utilisateur démo).
- **Nettoyage** : suppression de `AppHeader.tsx`/`app-nav-links.ts`/`/app/wallet` (vestiges du modèle crédits/wallet pré-pivot).
- **Convention confirmée** : pas de framework de test dans ce repo → vérification par `tsc --noEmit` + `npm run build` + `npm run lint` + vérification manuelle (curl sur serveur de dev pour la Tâche 8), comme au Plan 1.
- **8 tâches approuvées** individuellement + **revue finale de branche : Ready to merge** (aucun Critical/Important, 4 notes Minor sans action requise — duplication de fetch proportionnée à un build « structure », détail cosmétique sidebar, prop `emptyLabel` inatteignable).
- Commits : `6602f12`→`bfb1904` (+ `69c7c91` doc). **Poussé sur `main`** (accord utilisateur).
- **Validé par l'utilisateur sur Vercel** (« c'est bon ») → Plan 2 coché. **Prochaine action** : brainstorm/écriture du Plan 3 (Vue Pipeline — board + drawer).

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
