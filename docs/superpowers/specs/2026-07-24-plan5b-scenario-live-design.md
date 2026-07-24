# Plan 5b — Scénario en direct (design)

> Suite du Plan 5a (fiche complète — moteur + page statique, validé sur Vercel le 2026-07-23). Périmètre : rendre le scénario d'investissement (N3) éditable en direct sur la fiche bien, avec recalcul instantané et sauvegarde automatique. Contexte complet : `PROGRESS.md` §Phase 2, `REORIENTATION-ESTIO.md`.

## 1. Objectif

Aujourd'hui la section ⑦ Scénario affiche des valeurs figées en texte. Ce plan la transforme en panneau de curseurs/menus/cases interactif : bouger un réglage recalcule instantanément les sections qui en dépendent (④⑤⑥⑦⑧) **et** le verdict global (①), sans rechargement de page, avec sauvegarde automatique en base.

## 2. Non-objectifs (hors scope de ce plan)

- **Pas de profils de priorité ni de pondération utilisateur du score** — la formule du score /100 (§4) est automatique et fixe. Les profils (Rentabilité immédiate / Patrimoine long terme / Sécurité / Équilibré) et les curseurs de pondération pilotés par l'utilisateur restent le Plan 7 (Comparer/Arbitrage), comme prévu dans la roadmap (`CLAUDE.md` §Le score personnalisé).
- **Pas de vraies formules fiscales exactes** — les 6 régimes restent les approximations posées au Plan 5a.
- **Pas de bouton Réinitialiser/Annuler** — l'autosave est débouncée à ~600ms, la fenêtre d'état « non sauvegardé » est trop courte pour justifier un undo dans ce plan.
- **Pas de vrai N2** (DVF/loyers/tension réels) — ③ Marché reste sur `market-mock.ts`, inchangé.
- **Photos/documents** (upload) — Plan 5c, non traité ici.

## 3. Architecture

### 3.1 Aujourd'hui (Plan 5a)

`page.tsx` (Server Component) fetch `property` + `scenario` + `contact`/`notes`/`photos`/`documents`, et passe `property`/`scenario` en props figées à chaque section. Seule `SectionFinancement` est `"use client"` (toggle annuel/mensuel local, sans dépendance au scénario en édition).

### 3.2 Après ce plan

Un seul nouveau composant client fait pivot : **`FicheScenarioSections`** (`src/components/app/fiche/FicheScenarioSections.tsx`).

- `page.tsx` reste Server Component : il fetch les données comme aujourd'hui, rend directement ②③ (`SectionBien`, `SectionMarche` — inchangées, aucune dépendance au scénario), puis délègue ①④⑤⑥⑦⑧ à `FicheScenarioSections` en lui passant `property`, le `scenario` initial (fetché serveur), `propertyId`.
- `FicheScenarioSections` porte `const [scenario, setScenario] = useState(initialScenario)` — unique source de vérité pendant l'édition. Il rend dans l'ordre : `SectionVerdict`, `SectionFinancement`, `SectionCalculs`, `SectionFiscalite`, `SectionScenario`, `SectionCharges` — toutes reçoivent `scenario` (le state, pas le prop serveur figé) et `property`.
- `SectionScenario` reçoit en plus un callback `onChange(patch: Partial<PropertyScenarioRow>)` : chaque interaction (slider relâché, menu changé, case cochée) appelle `onChange`, qui met à jour le state du wrapper (recalcul instantané de toutes les sections filles par re-render React) **et** programme la sauvegarde débouncée (§5).
- Conséquence directe : `SectionVerdict`, `SectionCalculs`, `SectionFiscalite`, `SectionCharges` (aujourd'hui Server Components sans state) passent en `"use client"`. Aucune des quatre n'a de dépendance serveur (pas d'appel Supabase direct, calculs purs sur props) — bascule mécanique, sans changement de logique de calcul.

### 3.3 Pourquoi ce découpage

- Un seul point de bascule client (`FicheScenarioSections`) plutôt que de rendre toute la page client — préserve le fetch serveur initial (sécurité RLS/filtre `user_id` déjà en place dans `page.tsx`, inchangé).
- Prop-drilling explicite (`scenario` descend en prop), cohérent avec la convention déjà en place dans tout le repo (pas de context/state manager ailleurs dans la fiche).

## 4. Score /100 et Verdict réactif

Le score devient une fonction du **bien + scénario en cours d'édition**, recalculée à chaque changement de curseur.

### 4.1 Formule

Nouveau fichier `src/lib/calc/scoring.ts` (moteur pur, sans I/O, même famille que `financing.ts`/`cashflow.ts`/`tax.ts`).

Trois sous-notes, chacune normalisée sur 0-100 puis clampée (jamais < 0 ni > 100) :

| Sous-note | Poids | Basée sur | Normalisation | Si donnée insuffisante (`null`) |
|---|---|---|---|---|
| **Rendement** | 40 % | `rendementNetNetPct` (`cashflow.ts`) | `clamp(valeur, 0, 8) / 8 × 100` | Sous-note = 50 (neutre) |
| **Cash-flow** | 35 % | `cashOnCashPct` (`cashflow.ts`) | `clamp(valeur, -5, 15)` → `(valeur + 5) / 20 × 100` | Sous-note = 50 (neutre) |
| **Long terme** | 25 % | `tri` (`computeTRI`, `cashflow.ts`) | `clamp(valeur, 0, 12) / 12 × 100` | Sous-note = 50 (neutre) |

`scoreSur100 = round(0.40 × rendementScore + 0.35 × cashflowScore + 0.25 × longTermeScore)`.

### 4.2 Verdict à partir du score

```
scoreSur100 >= 75           → "pepite"
55 <= scoreSur100 < 75      → "solide"
35 <= scoreSur100 < 55      → "correct"
scoreSur100 < 35            → "a_eviter"
```

`computeVerdictFromScore(score: number): Verdict` remplace l'usage de `computeVerdict(rendementBrutPct)` dans `SectionVerdict` (la fonction existante `computeVerdict` dans `score.ts` n'est plus appelée par la fiche, mais reste utilisée telle quelle par les cartes/board/tableau — Plan 3/4, hors scope de ce plan, aucun changement là-bas).

### 4.3 Affichage (SectionVerdict)

En plus du badge verdict existant, affiche les **3 sous-notes** (label + valeur brute + barre ou pourcentage), conformément à la règle « jamais de boîte noire » (`CLAUDE.md` §Le score personnalisé). Exemple de contenu : « Rendement : 62/100 (net-net 4,9 %) · Cash-flow : 80/100 (cash-on-cash 9,2 %) · Long terme : 45/100 (TRI 5,1 %) ».

La phrase de pré-verdict (`preVerdictSentence`) est réécrite pour mentionner le score global plutôt que le seul rendement brut.

## 5. Contrôles par champ (SectionScenario réécrite)

Principe : slider pour les pourcentages/durées continus, menu déroulant pour les enums, case à cocher pour les booléens, champ numérique € pour les montants fixes. Bornes = mêmes côté UI et côté validation serveur (§6).

| Champ | Contrôle | Bornes / options | Pas |
|---|---|---|---|
| `apport_pct` | slider | 0 – 100 % | 1 |
| `interest_rate` | slider | 0 – 8 % | 0,05 |
| `duration_years` | slider | 5 – 30 ans | 1 |
| `loan_type` | menu | amortissable / in fine | — |
| `insurance_rate` | slider | 0 – 1,5 % | 0,01 |
| `insurance_on_initial` | case à cocher | capital initial / restant dû | — |
| `notary_fees_pct` | slider | 2 – 10 % | 0,1 |
| `dossier_fees` | champ € | ≥ 0 | — |
| `guarantee_fees` | champ € | ≥ 0 | — |
| `broker_fees` | champ € | ≥ 0 | — |
| `deferral_months` | slider | 0 – 24 mois | 1 |
| `tax_regime` | menu | 6 régimes (`tax.ts`) | — |
| `tmi_pct` | menu | 0 / 11 / 30 / 41 / 45 % (tranches IR françaises) | — |
| `management_fees_pct` | slider | 0 – 12 % | 0,5 |
| `gli` | case à cocher | oui/non | — |
| `pno` | case à cocher | oui/non | — |
| `vacancy_pct` | slider | 0 – 20 % | 0,5 |
| `works_provision` | champ € | ≥ 0 | — |
| `horizon_years` | slider | 5 – 30 ans | 1 |
| `market_scenario` | menu | prudent / central / dynamique | — |

## 6. Sauvegarde

- Nouvelle server action `updatePropertyScenario(propertyId: string, patch: Partial<PropertyScenarioRow>)` (ajoutée à `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts`, nouveau fichier — la fiche n'a pas encore d'actions propres, celles existantes sont sous `p/[projectId]/actions.ts` pour le board).
- Filtre obligatoire `property_id` + `user_id` (= `DEMO_USER_ID`), suivant la convention défense-en-profondeur déjà appliquée au Plan 5a.
- Validation/clamping serveur avec les mêmes bornes que le tableau §5 (défense en profondeur — un patch hors bornes est clampé silencieusement, jamais rejeté brutalement, pour ne pas casser l'UX d'un slider qui pousse une valeur limite).
- Déclenchement : `FicheScenarioSections` débounce ~600 ms après le dernier changement avant d'appeler l'action (un seul appel réseau même si l'utilisateur enchaîne plusieurs curseurs rapidement).
- Statut affiché près de la section ⑦ : `idle` (rien), `saving` (« Enregistrement… »), `saved` (« Enregistré » disparaît après ~2s), `error` (« Échec de l'enregistrement, réessaie » — le state local n'est jamais reverté, l'utilisateur peut retenter en rebougeant un curseur).

## 7. Dette technique corrigée au passage

Notée dans `PROGRESS.md` comme à traiter idéalement au Plan 5b (le code est de toute façon rouvert) :

1. **Mensualité in fine dupliquée** (`SectionFinancement.tsx` et `SectionCalculs.tsx` calculent chacune `costs.loanPrincipal × taux / 12` inline) → extraite en fonction exportée `computeInFineMonthlyPayment(principal, annualRatePct)` dans `financing.ts`, réutilisée aux deux endroits.
2. **Libellés régimes fiscaux dupliqués** (`tax.ts:REGIME_LABELS` et `SectionScenario.tsx:TAX_REGIME_LABELS`, valeurs identiques) → `tax.ts` exporte ses labels, `SectionScenario` (réécrite de toute façon) les importe au lieu de les redéfinir.

La 3e dette notée (base d'intérêt différente ⑤ vs ⑥) reste **non traitée** — elle est explicitement notée « à unifier quand les vraies formules fiscales arriveront », pas dans ce plan.

## 8. Fichiers créés / modifiés

| Fichier | Statut |
|---|---|
| `src/components/app/fiche/FicheScenarioSections.tsx` | **Créé** — wrapper client, state scénario + statut sauvegarde |
| `src/lib/calc/scoring.ts` | **Créé** — score/100, sous-notes, `computeVerdictFromScore` |
| `src/components/app/fiche/SectionScenario.tsx` | **Réécrit** — curseurs/menus/cases + `onChange` |
| `src/components/app/fiche/SectionVerdict.tsx` | **Modifié** — `"use client"`, prend `scenario`, affiche score + 3 sous-notes |
| `src/components/app/fiche/SectionCalculs.tsx` | **Modifié** — `"use client"` (aucun changement de logique) |
| `src/components/app/fiche/SectionFiscalite.tsx` | **Modifié** — `"use client"` (aucun changement de logique) |
| `src/components/app/fiche/SectionCharges.tsx` | **Modifié** — `"use client"` (aucun changement de logique) |
| `src/components/app/fiche/SectionFinancement.tsx` | **Modifié** — reçoit le state du wrapper au lieu du prop serveur figé |
| `src/lib/calc/financing.ts` | **Modifié** — ajoute `computeInFineMonthlyPayment` |
| `src/lib/calc/tax.ts` | **Modifié** — exporte les labels de régime |
| `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts` | **Créé** — `updatePropertyScenario` |
| `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx` | **Modifié** — délègue ①④⑤⑥⑦⑧ à `FicheScenarioSections` |

## 9. Critères de validation (Vercel)

- Bouger un curseur (ex. apport) recalcule instantanément ④⑤⑥①⑦⑧ sans rechargement.
- Recharger la page après avoir bougé un curseur : les nouvelles valeurs sont bien celles affichées (persistées).
- Le score/verdict change bien quand le scénario change (ex. passer en SCI à l'IS avec un TMI élevé doit faire monter le score si l'IS est plus favorable).
- ② Bien et ③ Marché ne bougent jamais avec le scénario (inchangés, hors scope).
- `npx tsc --noEmit`, `npm run build`, `npm run lint` verts.
