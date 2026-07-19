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
- [ ] Brainstorm `superpowers` Phase 1 (cadrer l'arborescence complète, l'inventaire des pages, l'état « quasi fini » attendu, la liste des placeholders acceptés).

> ⚠️ Une partie du travail ci-dessous a été **amorcée** en sessions 3-5 (design system, landing, 10 pages) **avant** cette méthodo. Rien n'est coché : l'utilisateur re-valide chaque point.

### Petits plans / features (à découper après brainstorm)
- [ ] Design system & tokens Estio validés (amorcé S3)
- [ ] Landing complète, animée, accessible (amorcée S4)
- [ ] Layout marketing partagé header + footer (amorcé S5)
- [ ] Inventaire figé de **toute** l'arborescence (liste exhaustive des pages)
- [ ] Toutes les pages créées en coquilles stylées (amorcé S5 : 10 pages)
- [ ] Placeholders identifiés et assumés (contenus provisoires, images, chiffres)
- [ ] Revue finale design/UI de la phase par l'utilisateur

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
