# PROGRESS.md — Journal & Roadmap Estio

> Pilote unique de l'avancement. Grandes lignes des 7 phases + détail de la phase en cours + historique des sessions.

---

## Méthodologie de travail — NON NÉGOCIABLE

1. **Chaque phase débute par un gros brainstorm** (`superpowers:brainstorming`). Pas de code avant brainstorm.
2. **Le brainstorm → immense spec → découpée en petits plans.** Petite feature, petite spec, petit plan. Petit à petit.
3. **L'utilisateur est la SOURCE DE VÉRITÉ.** Il est le **SEUL** à cocher les cases `- [ ]`. Claude ne coche **JAMAIS**.
4. **La mémoire retient chaque session.** Nouvelle session → Claude reprend au **dernier point non coché**.
5. **On avance 1 par 1.** L'utilisateur valide chaque petite feature **avant** de passer à la suivante.

**STOP — Claude demande avant de :** passer à la feature/phase suivante · cocher une case (jamais).

### Comment lire ce fichier
- `- [ ]` = à faire · `- [x]` = **coché par l'utilisateur uniquement**.
- Chaque phase = un brainstorm qui remplit sa section détaillée ci-dessous.
- Seule la **phase en cours** est détaillée. Les phases suivantes restent en grandes lignes jusqu'à leur brainstorm.

---

## Roadmap — 7 phases (grandes lignes)

- [ ] **Phase 1 — Design/UI & arborescence** : landing propre (placeholders OK) + toutes les pages du site créées.
- [ ] **Phase 2 — Le comparateur (cœur produit)** : import annonce → extraction Grok → analyse du bien → wallet visible → 2e bien → comparaison. Crédits, anti-contournement, floutage.
- [ ] **Phase 3 — Le wallet** : feature à part entière + tarifs.
- [ ] **Phase 4 — Pages header/footer** : légales, À propos, textes obligatoires.
- [ ] **Phase 5 — Comptes & sessions** : Google + email/mot de passe, connecté au wallet.
- [ ] **Phase 6 — Stripe** : tarifs et abonnements.
- [ ] **Phase 7 — Cybersécurité** : code review, polish, attaques via repo Strix.

---

## ▶ Phase en cours : Phase 1 — Design/UI & arborescence

> Objectif : une landing quasi finie (placeholders tolérés) ET **toute l'arborescence** du site en place — chaque page existe, stylée, liens vivants.

### Brainstorm de phase
- [x] Brainstorm Phase 1 → spec `docs/superpowers/specs/2026-07-19-phase1-design-arborescence-design.md` (arborescence 13 routes, découpage **1a structure / 1b design-craft**, placeholders assumés).

### Sous-phase 1a — structure (arborescence + coquilles)
- [x] Design system & tokens Estio (couleurs, typo géante, motion) — S3
- [x] Inventaire figé de **toute** l'arborescence (13 routes) — spec §3
- [x] Toutes les pages créées en coquilles stylées (10 marketing + 404 + groupe app) — S5
- [x] Layout marketing partagé header + footer (liens vivants, responsive) — S5
- [x] Placeholders identifiés et assumés (spec §7)

### Sous-phase 1b — design-craft (refonte UI façon speedy.io) — EN COURS
> Réf. teardown `docs/brand/speedy-teardown.md`. On **itère encore**, pas de clôture.
- [x] Hero dark plein écran (blob, cartes flottantes, reveal) — S4/S6
- [x] **Section pin 600vh** + stepper style Stripe (5 étapes : formulaire → analyse → comparaison → score → décision), rail continu au scroll — **validé S7**
- [x] **Smooth scroll Lenis** global, synchro ScrollTrigger (le pin reste calé) — **validé S7**
- [x] Sections score / données / CTA au niveau premium (`.h-lg`/`.h-display`, CTA dark bookend, marquee agrandi) — **validé S7**
- [ ] Header / footer / PageHeader harmonisés premium (fait S7 — **à valider sur Vercel**)
- [ ] Touches signature restantes : texte détouré, cards décalées, marquee avancé
- [ ] Revue finale design/UI 1b par l'utilisateur (clôture Phase 1)

---

## Phases suivantes (grandes lignes — à détailler à leur brainstorm)

### Phase 2 — Le comparateur (cœur produit)
- [ ] Brainstorm `superpowers` Phase 2 (import + extraction + analyse + wallet + comparaison + crédits + anti-contournement + floutage, de bout en bout)
- [ ] Import annonce : les 3 rampes (capture / copier-coller / formulaire) avec **fallback + pré-remplissage** vers un formulaire de confirmation unique
- [ ] Connexion **API Grok** (multimodal, gratuit) → extraction N1 uniquement
- [ ] Connecteurs données extérieures (N2) + appels API bases open data
- [ ] Affichage analytique d'un bien après formulaire complet
- [ ] Stockage du bien dans le **wallet visible**
- [ ] Ajout d'un 2e bien → bouton « Comparer » (pousser à la comparaison)
- [ ] **Anti-contournement** : empêcher d'analyser 2 biens séparément et de les juxtaposer d'une page à l'autre
- [ ] Crédits : 1 crédit / analyse de bien, 1 crédit / comparaison
- [ ] Données analytiques **enrichies uniquement en comparaison** (une analyse seule n'a pas de référentiel)
- [ ] Écrit clair : ce qu'on analyse et ce que chaque abonnement débloque ; le reste **flouté complet** → pousse à l'achat (idem wallet)

### Phase 3 — Le wallet
- [ ] Brainstorm `superpowers` Phase 3
- [ ] Wallet comme feature centrale (tout géré à ce niveau)
- [ ] Grille tarifaire intégrée au wallet

### Phase 4 — Pages header/footer
- [ ] Brainstorm `superpowers` Phase 4
- [ ] Pages obligatoires (mentions légales, CGU, confidentialité)
- [ ] Pages de texte (À propos, etc.)

### Phase 5 — Comptes & sessions
- [ ] Brainstorm `superpowers` Phase 5
- [ ] Connexion Google
- [ ] Connexion email + mot de passe
- [ ] Session utilisateur connectée au wallet

### Phase 6 — Stripe
- [ ] Brainstorm `superpowers` Phase 6
- [ ] Intégration paiement Stripe
- [ ] Tarifs et abonnements

### Phase 7 — Cybersécurité
- [ ] Brainstorm `superpowers` Phase 7
- [ ] Code review détaillée (tous les petits détails, polish)
- [ ] Campagne d'attaques via le repo **Strix**
- [ ] Corrections des failles trouvées

---

## Historique des sessions (le plus récent en haut)

> Journal factuel. Aucune coche ici : les coches vivent dans la roadmap ci-dessus, décidées par l'utilisateur.

### Session 7 — 2026-07-20 — Refonte landing 1b (scroll signature speedy.io)
**Étape : 🔨 impl — sous-phase 1b (design-craft)**
- Reprise du fil 1b : refonte UI landing façon **speedy.io** (fond dark, typo géante, scroll storytelling). Étude du vrai scroll via captures locales (`inspi/auto/`, `speedy-io-html`).
- **Section pin 600vh** (`PinnedNiveaux.tsx`) réécrite fidèle speedy : scène sticky 100vh, **5 étapes** qui crossfadent (formulaire → analyse → comparaison → score → décision), placeholders d'aperçu à droite (futurs screens de l'outil).
- **Stepper** refait 3× jusqu'à validation : style **Stripe** (puce passé ✓ / actif ● halo / futur ○), **rail noir continu** qui se remplit au scroll (`scaleY` = progression), centré vertical.
- **Lenis** : constat d'un **doublon** (j'avais créé `layout/SmoothScroll` alors que `providers/SmoothScroll` existait déjà) → doublon supprimé, un seul Lenis synchro ScrollTrigger.
- **Sections sous le pin** (score/données/CTA) passées au niveau premium (`.h-lg`/`.h-display`, largeur `106rem`/`6vw`, CTA **dark bookend**, marquee agrandi).
- **Harmonisation** : `PageHeader` premium (impacte les 10 pages), `SiteFooter` aligné en largeur. Aucune couleur en dur dans les composants marketing → pages dark-cohérentes via tokens.
- Fix lint pré-existant `PageLoader` (setState hors corps d'effet) → **lint global vert**. Build vert.
- Commits : `27e62c0`, `57ab411`, `fba18c9`, `120acf7`, `76dc173`, `0b4ece7`, `9d87411`.
- **Décision méthodo** : l'utilisateur m'a **exceptionnellement autorisé à cocher** les cases de cette session (règle n°3 normalement : lui seul). Coché uniquement le **fait + validé** ; header/pages + revue finale laissés ouverts (on n'a pas clôturé).
- **Prochaine action** : valider header/pages sur Vercel, puis itérer les touches signature restantes (texte détouré, cards) avant revue finale 1b.

### Session 6 — 2026-07-19 — Adoption de la méthodo 7 phases
**Étape : 📋 cadrage méthodo**
- L'utilisateur a défini les **5 règles de travail non négociables** et la **roadmap en 7 phases**.
- Réécriture de `CLAUDE.md`, `PROGRESS.md`, `MVP.md`, `ARCHITECTURE.md` selon cette méthodo, en cases à cocher que **seul l'utilisateur** valide.
- Décisions figées : LLM d'extraction = **API Grok** (multimodal, gratuit) ; auth = **Google + email/mdp** ; cyber = repo **Strix** ; crédits = **1/analyse + 1/comparaison** ; analyse enrichie **uniquement** en comparaison.
- **Prochaine action** : brainstorm Phase 1 (ou validation que Phase 1 est déjà couverte par S3-S5).

### Session 5 — 2026-07-19 — Site public (header, pages, footer, modèle éco)
**Étape : 🔨 impl** — amorce Phase 1 & 4
- `SiteHeader` + `MobileMenu` (liens réels, état actif, burger mobile), `SiteFooter` (4 colonnes), layout `(marketing)`.
- 10 routes : `/` + `comment-ca-marche`, `tarifs`, `faq`, `a-propos`, `contact`, `connexion`, `mentions-legales`, `confidentialite`, `cgu`.
- Composants : `PageHeader`, `PricingTable` (Free/Pro/Expert + toggle mensuel/annuel), `FaqAccordion`, `ContactForm`, `LoginForm` (UI seule), `LegalPage`.
- Modèle éco spec §11 : wallet de crédits, Free 3 crédits à vie. Mentions « open data » retirées de l'UI. Build + lint verts.

### Session 4 — 2026-07-19 — Landing Estio
**Étape : 🔨 impl** — amorce Phase 1
- Landing complète (`/apple-design` + `/design-taste-frontend` + `/ui-ux-pro-max`) : hero asymétrique, principe zig-zag, score interactif, sources marquee, CTA.
- Composants `landing/` : `Reveal`, `HeroVisual`, `MagneticButton`, `ScoreProfiles`, `SourcesMarquee`.
- Accessibilité : focus-visible global, muted `#75695d` (AA), `aria-pressed`. Springs stiffness 100 / damping 20.

### Session 3 — 2026-07-19 — Marque & design system
**Étape : 🔨 impl** — amorce Phase 1
- Nom **Estio** (`estio.immo`). Charte `docs/brand/estio-brandkit.md`. Tokens `src/design/tokens.{css,ts}`. General Sans + Motion. Logo placeholder, 4 maquettes.

### Session 2 — 2026-07-19 — Scaffold + Supabase
**Étape : 🔨 impl (infra)**
- Next.js 16.2.10 (App Router, TS 5, Tailwind 4, `src/`, ESLint). Supabase SSR (`client/server/middleware` + `proxy.ts`). `.env.local` + `/api/health`. Commit `02661af`.
- Décisions : moteur calcul en **TS pur** (pas FastAPI), **Fluid Compute** Vercel.
- ⚠️ Action utilisateur en attente : régénérer les clés Supabase (exposées en S2), importer sur Vercel.

### Session 1 — 2026-07-19 — Cadrage & doc initiale
**Étape : 📋 specs**
- Validé `comparateur-immo-specs.md` (v0.1). Créé `CLAUDE.md`, `MVP.md`, `ARCHITECTURE.md`, `PROGRESS.md`.
- Décisions : moteur TS pur ; rampe d'import universelle = capture d'écran lue par LLM.

---

<!-- Modèle entrée session :

### Session N — AAAA-MM-JJ — Titre
**Étape : 📋/🗺️/🔨**
- …
-->
