# Spec — L'outil Estio : le pipeline de décision (build « structure »)

> Phase 2 (roadmap `PROGRESS.md`). Brainstorm du 2026-07-21. Réf. parcours : `REORIENTATION-ESTIO.md` §7 + `simulateur-esio.jsx` (référence de **parcours** uniquement — pas de design/couleurs/calculs repris).
> Objectif de ce build : **poser toute la structure de l'app** (pages, navigation, schéma de données complet, écrans, flux d'ajout) avec des **données d'exemple**. Le **vrai piochage web (N2)**, les **rampes d'extraction réelles** et les **formules fiscales exactes** viennent aux étapes suivantes. Le **floutage freemium** aussi.

## 1. Intention

Construire le cœur d'Estio : un **CRM de recherche immobilière** desktop-first où l'investisseur crée un **projet d'achat**, alimente un **pipeline à statuts**, consulte une **analyse de bien la plus poussée possible**, et **arbitre** entre ses finalistes. Densité et clarté façon **Attio / Notion / Monday**, mais habillé de l'identité **Estio** et orienté client (il doit s'y retrouver).

## 2. Décisions figées (issues du brainstorm)

1. **Desktop-first**, responsive/mobile **plus tard**.
2. **Identité = dark grotesk de la landing** (`src/design/tokens.css`) : noir `#0a0a0b`, surfaces violet nuit, accent **lilas** `#a79fe0`, pastels de score sauge/ambre/rose, typo grotesque, mode clair crème en option, motion `ease-expo`. **Pas** le teal du simulateur.
3. **App shell** : sidebar (logo · projets + switcher · « Nouveau projet » · nav du projet) + barre du haut (nom/critères · recherche · **Comparer** · **＋ Ajouter un bien**) + onglets de vues.
4. **3 vues** : **Pipeline** (Kanban 6 colonnes, drag & drop) · **Tableau** (dense, triable) · **Carte** (épingles géolocalisées colorées par score).
5. **Comparer = action** (pas une vue) : sélection de 2-3 finalistes → écran comparaison côte à côte (cellule meilleure surlignée) **+ verdict d'arbitrage en langage naturel** piloté par un **profil de priorité** (Rentabilité / Patrimoine / Sécurité / Équilibré).
6. **Fiche bien = drawer + page complète** : clic sur carte → **drawer** (aperçu : score, verdict, 3-4 chiffres, statut, notes) + bouton **« Analyse complète → »** ouvrant une **page pleine** exhaustive.
7. **Statut ↔ analyse** : l'analyse chiffrée est **auto dès l'ajout** ; le **statut enrichit le contexte humain** (À analyser → Analysé → Visite → En négo → Écarté(+raison) → Offre).
8. **Flux d'ajout en 2 temps** : écran d'entrée final (glisser capture/PDF/photo · coller texte · manuel) + widget **« Gagne du temps avec l'extension web Estio ! »** → page `/extension` (faite plus tard) → bouton Chrome Web Store. Dans ce build, un clic **génère un exemple** → **formulaire de vérif** pré-rempli → **Ajouter au projet**.
9. **Données = schéma Supabase complet dès maintenant** (toutes les tables, y compris **photos** et documents), pages réelles, **seed d'exemple**.
10. **Pas de floutage freemium** dans ce build ; **oui aux tooltips « ? »** sur chaque donnée complexe.
11. **Auth = Phase 5** → ce build utilise un **utilisateur démo seedé** (connexion serveur via identifiants démo en variables d'env). **RLS activée dès maintenant** (sécurité), policies `user_id = auth.uid()`.

## 3. La page d'analyse complète — sections

① **Verdict** (score signature, verdict Pépite/Solide/Correct/À éviter, pré-verdict en français, statut, actions) · ② **Le bien (N1)** · ③ **Marché (N2)** exhaustif (DVF, loyers + encadrement, tension/zonage/vacance, démographie, risques Géorisques, commodités, copropriété, énergie ADEME) · ④ **Financement poussé** (apport, prêt amortissable/in fine, assurance, frais notaire/dossier/garantie/courtage, différé, endettement HCSF, tableau d'amortissement) · ⑤ **Tous les calculs** (brut/net/net-net, cash-flow avant-après impôt, effort d'épargne, TRI, cash-on-cash, point mort, enrichissement, plus-value nette, levier) · ⑥ **Fiscalité tous régimes + comparateur** (nu micro/réel + déficit, LMNP micro/réel + amortissement, SCI IR/IS, TMI, PS 17,2 %) · ⑦ **Scénario en direct** (curseurs → recalcul temps réel, comparer 2 configs) · ⑧ **Charges & exploitation** · ⑨ **Contexte humain** (notes, agent/contact, prix max, négo, CR visite, **photos**, documents).

Dans ce build : sections **présentes et remplies de valeurs mock**, calculs par un moteur TS déterministe **provisoire** (formules affinées plus tard). Petits **« ? »** explicatifs partout.

## 4. Modèle de données (Supabase — schéma complet)

Enums : `property_status`(analyser|analyse|visite|nego|ecarte|offre) · `plan`(free|pro|expert) · `add_source`(capture|paste|pdf|whatsapp|manual|extension) · `tax_regime`(nu_micro|nu_reel|lmnp_micro|lmnp_reel|sci_ir|sci_is) · `note_kind`(note|visite|nego) · `contact_kind`(agent|mandataire|particulier|notaire|autre) · `loan_type`(amortissable|in_fine) · `market_scenario`(prudent|central|dynamique).

Tables (toutes : `id uuid pk`, `created_at`, `updated_at`, RLS on) :
- **profiles** — `id`(=auth.users), `email`, `full_name`.
- **subscriptions** — `user_id`, `plan`(défaut free), `status`, `current_period_end`, `stripe_customer_id`, `stripe_subscription_id`. (Placeholder Phase 6.)
- **projects** — `user_id`, `name`, `criteria jsonb`(budget_max, goal, target_type, zone…), `archived bool`.
- **contacts** — `user_id`, `name`, `kind`(contact_kind), `phone`, `email`, `agency`, `notes`. (Réutilisable entre biens.)
- **properties** — `project_id`, `user_id`, `status`(property_status), `board_position int`, `add_source`, `contact_id`, `max_price`, `discard_reason`, **N1** : `address`, `address_extra`, `city`, `postal_code`, `insee_code`, `lat`, `lng`, `property_type`, `surface_carrez`, `rooms`, `bedrooms`, `floor`, `floors_total`, `has_elevator`, `year_built`, `condition`, `dpe_letter`, `ges_letter`, `dpe_value`, `exposure`, `has_balcony`, `has_terrace`, `outdoor_area`, `has_parking`, `has_cave`, `furnished`, `asking_price`, `works_estimate`, `monthly_copro_charges`, `property_tax`, `estimated_rent`.
- **property_scenarios** — `property_id`(1-1), **N3** : `apport_pct`, `interest_rate`, `duration_years`, `loan_type`, `insurance_rate`, `insurance_on_initial bool`, `notary_fees_pct`, `dossier_fees`, `guarantee_type`, `guarantee_fees`, `broker_fees`, `deferral_months`, `tax_regime`, `tmi_pct`, `management_fees_pct`, `gli bool`, `pno bool`, `vacancy_pct`, `works_provision`, `horizon_years`, `market_scenario`.
- **property_notes** — `property_id`, `user_id`, `kind`(note_kind), `body`.
- **property_photos** — `property_id`, `storage_path`, `caption`, `sort_order`. (Bucket Storage `property-photos`.)
- **property_documents** — `property_id`, `storage_path`, `filename`, `doc_type`. (Bucket `property-documents`.)
- **market_snapshots** — `address_key`(insee/geohash), `payload jsonb`(dvf, loyers, tension, vacance, demographie, risques…), `source`, `fetched_at`, `ttl`. **Cache N2 périssable, jamais figé dans le bien.**
- **status_history** — `property_id`, `from_status`, `to_status`, `reason`, `changed_by`.
- **comparisons** — `user_id`, `project_id`, `property_ids uuid[]`, `profile`.

Seed : 1 utilisateur démo, 2 projets (1 actif + 1 archivé), ~6 biens répartis sur les statuts, scénarios, quelques notes/contacts, un `market_snapshot` d'exemple.

## 5. Architecture technique

- **Next.js App Router**, groupe `(app)`. Routes : `/app` (→ dernier projet ou liste), `/app/projects`, `/app/p/[projectId]` (board + `?view=pipeline|tableau|carte`, drawer via état client `?bien=id`), `/app/p/[projectId]/bien/[propertyId]` (analyse complète), `/app/p/[projectId]/comparer?ids=…`, `/extension` (coquille).
- **Données** : Supabase server client en RSC pour les lectures ; **server actions** pour les écritures. Client Supabase démo (connexion serveur via identifiants env) tant qu'il n'y a pas d'auth.
- **Moteur de calcul** : `src/lib/calc/` — TS pur, déterministe, **sans I/O ni LLM** (formules provisoires, à affiner). Jamais un chiffre produit par un LLM.
- **Interactif** (client components) : board Kanban (drag & drop), onglets de vues, drawer, curseurs de scénario (recalcul live), tri du tableau, sélecteur de profil d'arbitrage, tooltips « ? ».
- **Carte** : MapLibre GL JS (gratuit) + fond de carte libre ; épingles depuis `lat/lng`.
- **Graphiques & jauges** : **faits main en SVG/CSS** (cf. mémoire « UI fait main sans lib »), pas de lib de charts.
- **Drag & drop Kanban** : décision au plan du board (dnd-kit vs pointer events maison) — c'est fonctionnel, une petite lib est acceptable si le fait-main est trop fragile.
- **Design** : réutilise les tokens `src/design/tokens.css` + `globals.css`. Nouveaux composants app dans `src/components/app/`.

## 6. Découpage en petits plans (exécutés 1 par 1, validés sur Vercel avant le suivant)

- **Plan 1 — Schéma & seed** : migrations Supabase (toutes les tables, enums, RLS, buckets Storage), utilisateur démo + données d'exemple, client démo serveur, types TS générés.
- **Plan 2 — App shell & navigation** : layout `(app)`, sidebar (projets + switcher + nav), barre du haut, onglets de vues, page projets, refonte du `/app` moche.
- **Plan 3 — Vue Pipeline (board + drawer)** : Kanban 6 colonnes, carte-bien riche, drag & drop + `status_history`, drawer d'aperçu.
- **Plan 4 — Vue Tableau** : table dense triable, colonnes chiffrées, réutilise le moteur `calc/`.
- **Plan 5 — Fiche complète** : page pleine (sections ①→⑨), scénario en direct (curseurs → recalcul), tooltips « ? », photos/documents (upload Storage).
- **Plan 6 — Vue Carte** : MapLibre + épingles par score + mini-aperçu au clic.
- **Plan 7 — Comparer / Arbitrage** : sélection multi, écran côte à côte, verdict langage naturel (gabarit déterministe pour l'instant), profils de priorité.
- **Plan 8 — Flux Ajouter un bien** : écran d'entrée (rampes → exemple généré), formulaire de vérif/ajout, widget extension + coquille `/extension`.

## 7. Hors-scope de ce build (étapes ultérieures)

Vrai piochage web N2 (open data / web) · rampes d'extraction réelles (Grok multimodal, PDF, WhatsApp) · extension navigateur · formules fiscales exactes & maintenues · floutage freemium + Stripe · auth réelle (Google + email/mdp) · surveillance/alertes (Phase 3) · version mobile · cybersécurité (Phase 7).

## 8. Risques / points de vigilance

- **Fiabilité N2 France entière** (DVF crade) : afficher un **indice de confiance** de la donnée (à prévoir dans l'UI marché).
- **RLS + utilisateur démo** : garder l'app fonctionnelle sans auth réelle sans casser la sécurité (connexion démo serveur).
- **Taille du build** : d'où le découpage strict en 8 plans validés un par un.
- **Exactitude fiscale** : provisoire ici, à ne pas présenter comme définitive (disclaimers viendront).
