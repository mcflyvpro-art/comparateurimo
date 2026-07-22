# Spec — Plan 5a : la Fiche complète (moteur de calcul + page)

> Phase 2 (roadmap `PROGRESS.md`). Brainstorm du 2026-07-22. Réf. parcours : `REORIENTATION-ESTIO.md` §7. Spec parente : `docs/superpowers/specs/2026-07-21-outil-pipeline-structure-design.md` §3 (sections ①→⑨) et §6 (« Plan 5 — Fiche complète »).
>
> Le Plan 5 de la spec parente est découpé en **trois sous-plans** (validés séparément sur Vercel) :
> - **5a (cette spec)** : le moteur de calcul complet + la page avec les 9 sections rendues en lecture seule.
> - **5b** : le scénario en direct (curseurs qui recalculent live, sauvegarde, comparaison de 2 configs).
> - **5c** : upload photos/documents (Storage) dans la section ⑨.

## 1. Intention

Donner corps à la promesse cœur d'Estio : depuis le drawer d'un bien (Plans 3-4), un clic sur « Analyse complète → » ouvre une **page pleine** qui déroule l'analyse la plus poussée possible — financement, tous les calculs de rentabilité, comparateur fiscal tous régimes, marché, et le contexte humain — avec un moteur de calcul déterministe (jamais un chiffre produit par un LLM). Aucune nouvelle migration Supabase : le schéma (N1/N3, photos, documents) existe déjà depuis le Plan 1.

## 2. Décisions figées (issues du brainstorm de cette session)

1. **Plan 5 découpé en 5a/5b/5c** (décision utilisateur) — 5a = moteur + page statique ; 5b = interactivité scénario ; 5c = upload médias.
2. **Section ③ Marché (N2)** : le vrai piochage DVF/loyers/tension est hors-scope de ce build (arrive à une étape ultérieure). En attendant, une fonction **déterministe** dérive des valeurs plausibles à partir de l'adresse/code INSEE du bien — stable, différente par bien, **même interface** que prendra le vrai N2 (seule l'implémentation interne changera).
3. **Section ⑥ Fiscalité « tous régimes + comparateur »** : incluse dès le 5a sous forme de **tableau comparatif statique** (les 6 régimes calculés avec le scénario actuel du bien) — pas besoin de curseurs pour comparer des régimes entre eux à paramètres égaux. Le 5b n'ajoute que l'interactivité par-dessus.
4. **Section ④ Financement — tableau d'amortissement** : l'utilisateur final de l'app (l'investisseur, pas Samuel) doit pouvoir **choisir** entre un récapitulatif annuel (une ligne par an) et le détail mensuel complet, via un toggle dans l'UI. Le calcul sous-jacent est **toujours** le tableau mensuel complet ; la vue annuelle en est un simple regroupement (aucune double logique de calcul).
5. **Moteur de calcul modulaire** : `src/lib/calc/` éclaté en `financing.ts`, `cashflow.ts`, `tax.ts`, `market-mock.ts` (`score.ts` existant inchangé, réutilisé pour le verdict). Cohérent avec les modules déjà focalisés du repo (`format.ts`, `board-position.ts`).
6. **Section ⑦ Scénario** : affichée en **lecture seule** dans ce plan (valeurs actuelles de `property_scenarios`, aucun curseur, aucune sauvegarde) — l'interactivité est le Plan 5b.
7. **Section ⑨ Contexte humain** : notes + contact affichés normalement (déjà en base). Photos/documents : **zone placeholder explicite** (« arrive au Plan 5c »), même pattern que les fonctionnalités désactivées des plans précédents (jamais un lien mort).
8. **Disclaimer court** en bas de page (« outil d'aide à la décision, pas un conseil réglementé ») — une ligne, pas la page légale complète (Phase 4).
9. **Tooltips « ? »** sur chaque donnée complexe, texte explicatif rédigé par Claude (premier jet, éditable ultérieurement par l'utilisateur).

## 3. La page — structure

Route : `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx` (Server Component, `export const dynamic = "force-dynamic"` comme les autres routes qui lisent Supabase). Fetch le bien complet (`properties.*`), son `property_scenarios` (1-1), son `contact` (si `contact_id`), ses `property_notes` ; `notFound()` si le bien n'appartient pas au projet/utilisateur démo.

En-tête de page : adresse, verdict signature (réutilise `VerdictBadge` + `computeVerdict`/`computeRendementBrutPct` existants — verdict mono-critère provisoire, inchangé jusqu'au Plan 7), statut courant, lien retour vers le projet.

Sections empilées, chacune un composant dédié dans `src/components/app/fiche/` :

| # | Section | Composant | Contenu |
|---|---------|-----------|---------|
| ① | Verdict | `SectionVerdict` | Score signature, verdict, pré-verdict en français, statut, actions rapides |
| ② | Le bien (N1) | `SectionBien` | Toutes les caractéristiques du bien (localisation, surface, pièces, DPE, extérieurs…) |
| ③ | Marché (N2) | `SectionMarche` | Sortie de `computeMockMarketData` — prix/m² DVF, loyer marché, tension, vacance, risques, démographie, **avec mention explicite que ce sont des données d'exemple** |
| ④ | Financement | `SectionFinancement` | Mensualité, frais annexes, tableau d'amortissement (toggle annuel/mensuel) |
| ⑤ | Tous les calculs | `SectionCalculs` | Brut/net/net-net, cash-flow avant/après impôt, effort d'épargne, TRI, cash-on-cash, point mort, enrichissement, plus-value nette |
| ⑥ | Fiscalité + comparateur | `SectionFiscalite` | Tableau des 6 régimes (`compareTaxRegimes`), régime actuel du scénario mis en évidence |
| ⑦ | Scénario (lecture seule) | `SectionScenario` | Valeurs actuelles de `property_scenarios`, pas de curseur (Plan 5b) |
| ⑧ | Charges & exploitation | `SectionCharges` | Charges copro, taxe foncière, vacance, gestion, assurances |
| ⑨ | Contexte humain | `SectionHumain` | Notes, contact, prix max, négo — photos/documents en placeholder (Plan 5c) |

Composant partagé `InfoTooltip` (fait main, pas de lib) pour les « ? ».

Dans `PropertyDrawer.tsx`, le bouton « Analyse complète → » (actuellement `disabled` avec `title`, lignes 124-131) devient un `Link` actif vers cette route.

## 4. Moteur de calcul (`src/lib/calc/`)

Toutes les fonctions sont **pures, synchrones, sans I/O ni appel LLM** (aucun chiffre financier n'est jamais produit par une IA). Formules **provisoires**, affinées à une étape ultérieure.

- **`financing.ts`**
  - `computeMonthlyPayment(principal, annualRate, months)` — mensualité prêt amortissable (formule standard).
  - `computeAmortizationSchedule(principal, annualRate, months, deferralMonths)` — tableau **mensuel complet** (capital restant dû, intérêts, capital remboursé, mensualité) ; la vue annuelle de l'UI regroupe ces lignes par paquets de 12, pas de second calcul.
  - `computeInFineSchedule(...)` — variante prêt in fine.
  - `computeFinancingCosts(scenario, price)` — notaire, dossier, garantie, courtage, assurance emprunteur → coût total du financement.
- **`cashflow.ts`**
  - Réutilise `computeRendementBrutPct` de `score.ts`.
  - `computeRendementNetPct`, `computeRendementNetNetPct`.
  - `computeCashflowBeforeTax`, `computeCashflowAfterTax` (mensuel et annuel).
  - `computeEffortEpargne` (mensualité + charges − loyer, si négatif).
  - `computeTRI(cashflows: number[])` — Newton-Raphson simple sur les flux annuels projetés sur l'horizon (achat, cash-flows annuels, revente estimée).
  - `computeCashOnCash`, `computePointMort`, `computeEnrichissementNet`, `computePlusValueNetteEstimee`.
- **`tax.ts`**
  - Une fonction par régime : `computeTaxNuMicro`, `computeTaxNuReel`, `computeTaxLmnpMicro`, `computeTaxLmnpReel`, `computeTaxSciIr`, `computeTaxSciIs` — même signature (loyer, charges, TMI, prix/amortissement si pertinent) → impôt annuel estimé.
  - `compareTaxRegimes(input)` → tableau des 6 résultats triés (du plus favorable au moins favorable), pour le tableau comparatif de la section ⑥.
- **`market-mock.ts`**
  - `computeMockMarketData(insee_code: string | null, address: string | null)` → objet déterministe (hash simple de l'adresse/code INSEE → valeurs plausibles reproductibles) : prix/m² DVF, loyer marché estimé, tension locative, taux de vacance, risques (Géorisques), indicateurs démographiques. **Même interface** que prendra le vrai N2 : seule l'implémentation interne sera remplacée à l'étape ultérieure.

## 5. Types & données

- Nouveau type `PropertyDetail` (fichier `src/lib/property-detail-types.ts`) : toutes les colonnes de `properties` (N1 complet) + `property_scenarios` associé (N3) + `contact` + `property_notes` + `property_photos`/`property_documents` (tableaux, vides tant que le Plan 5c n'est pas fait — le type existe déjà pour ne pas le retoucher ensuite).
- `PipelineProperty` (board/tableau) **inchangé** — reste la projection étroite existante.
- Nouvelle query serveur (ex. `getPropertyDetail(propertyId, userId)` dans `src/lib/supabase/` ou co-localisée à la route) pour le fetch complet.

## 6. Hors-scope de ce plan (5b / 5c / au-delà)

- Curseurs de scénario, recalcul live, sauvegarde du scénario, comparaison de 2 configurations → **Plan 5b**.
- Upload et affichage de photos/documents → **Plan 5c**.
- Vrai piochage N2 (DVF/loyers/tension réels), formules fiscales exactes et maintenues, verdict multi-critère pondéré (Plan 7) → étapes ultérieures de la roadmap, non affectées par ce plan.
- Aucune nouvelle migration Supabase.

## 7. Risques / points de vigilance

- **TRI** : nécessite un solveur itératif (Newton-Raphson) — pas de formule fermée. Prévoir un plafond d'itérations et une valeur `null` de repli si la série ne converge pas (jamais de `NaN`/`Infinity` affiché).
- **Marché mock** : bien afficher la mention « données d'exemple » pour ne pas laisser croire à un vrai N2 avant l'étape ultérieure — cohérent avec le risque déjà noté dans `ARCHITECTURE.md` (fiabilité N2 France entière).
- **Taille de page** : 9 sections + tableau d'amortissement potentiellement long (mode mensuel) → vérifier la lisibilité/performance de rendu, prévoir un sommaire de navigation interne si besoin (jugé à l'implémentation, pas bloquant pour la spec).
