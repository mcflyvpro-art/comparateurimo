# Plan 5b — Scénario en direct (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer la section ⑦ Scénario de la fiche bien (aujourd'hui lecture seule, Plan 5a) en panneau de curseurs/menus/cases interactif : chaque changement recalcule instantanément le verdict (①) et les sections chiffrées (④⑤⑥⑧) sans rechargement, et sauvegarde automatiquement le scénario en base (debounce ~600ms).

**Architecture:** Un seul composant client fait pivot — `FicheScenarioSections` — qui porte le state du scénario en cours d'édition et englobe ①②③④⑤⑥⑦⑧ (② et ③ n'en dépendent pas mais restent dans le wrapper pour préserver l'ordre visuel de la page). `page.tsx` reste Server Component pour le fetch initial ; seul `SectionHumain` (⑨) reste en dehors du wrapper. Le score du verdict devient une fonction du scénario via un nouveau module `calc/metrics.ts` qui centralise toute la chaîne de calcul (financement → cash-flow → fiscalité → TRI) déjà écrite au Plan 5a, pour que ① et ⑤ partagent exactement la même logique au lieu de la dupliquer. Un nouveau `calc/scoring.ts` combine 3 sous-notes normalisées (rendement/cash-flow/long terme) en un score /100 automatique, sans pondération utilisateur (les profils de priorité restent le Plan 7).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4. Aucune nouvelle dépendance npm (les curseurs sont des `<input type="range">` faits main, comme le reste de l'UI).

## Global Constraints

- **Spec de référence :** `docs/superpowers/specs/2026-07-24-plan5b-scenario-live-design.md`, validée par l'utilisateur. En cas de doute sur une valeur/formule, cette spec fait foi.
- **Aucun framework de test dans ce repo.** Vérification de chaque tâche = `npx tsc --noEmit` après chaque fichier, puis `npm run build` + `npm run lint` en fin de plan (doivent rester verts), + vérification manuelle via `npm run dev`. **Ne jamais écrire de test unitaire.**
- **Moteur de calcul = TS pur, synchrone, sans I/O ni appel LLM.** Jamais un chiffre financier produit par une IA.
- **Réutiliser tel quel (ne pas redéfinir) :** `Verdict`/`verdictLabel` (`src/lib/calc/score.ts` — `computeVerdict`/`computeRendementBrutPct` restent utilisées par le board/tableau, Plans 3/4, aucun changement là-bas), `formatEUR`/`formatPercent` (`src/lib/format.ts`), `VerdictBadge` (`src/components/app/VerdictBadge.tsx`), `SectionCard`/`InfoTooltip` (`src/components/app/fiche/`), `PropertyRow`/`PropertyScenarioRow` (`src/lib/property-detail-types.ts`), `getDemoClient`/`DEMO_USER_ID` (`src/lib/supabase/demo.ts`).
- **Accès données** : toute écriture Supabase filtrée `property_id` + `user_id = DEMO_USER_ID` (défense en profondeur, RLS contournée par le client démo — même précaution que le Plan 5a).
- **Identité = dark grotesk** des tokens existants : `bg-bg`, `bg-bg-alt`, `text-text`, `text-muted`, `text-faint`, `text-brand`/`accent-brand`, `border-border`/`border-border-strong`, `text-score-{high,mid,low}`. Aucune couleur hors tokens.
- **Sauvegarde = autosave débouncée uniquement** (~600ms après le dernier changement). **Aucun bouton Enregistrer, aucun bouton Réinitialiser/Annuler dans ce plan.**
- **Score /100 automatique et fixe** (poids 40/35/25 sur rendement net-net / cash-on-cash / TRI, seuils 75/55/35). **Pas de pondération utilisateur, pas de profils de priorité** — Plan 7.
- **Correction d'ordre visuel par rapport à la spec :** la spec (§3.2) suggérait de rendre ②③ hors du wrapper puis ①④⑤⑥⑦⑧ dedans, ce qui inverserait l'ordre visuel (① passerait après ②③, alors qu'il doit rester en tête de page). Ce plan corrige ce détail d'implémentation : ②③ (`SectionBien`, `SectionMarche`) sont rendues **à l'intérieur** de `FicheScenarioSections`, dans l'ordre ①②③④⑤⑥⑦⑧, exactement comme aujourd'hui — sans aucun changement de leur code ou de leurs props (elles ne reçoivent toujours que `property`, jamais `scenario`).
- **Dette technique du Plan 5a corrigée au passage :** (1) mensualité in fine dédupliquée dans `financing.ts` (Task 2), réutilisée par `SectionFinancement` (Task 11) et par `metrics.ts` (Task 4, consommé par `SectionCalculs`) ; (2) libellés des régimes fiscaux : `tax.ts` devient la seule source (Task 3), `SectionScenario` les importe (Task 13) au lieu de les redéfinir. La 3ᵉ dette notée (base d'intérêt différente entre ⑤ et ⑥) **n'est pas traitée dans ce plan** (`SectionFiscalite` garde sa propre logique de calcul de l'intérêt, inchangée — seul son wrapper `"use client"` change, Task 9).
- **Hors-scope de ce plan** : profils de priorité/pondération utilisateur (Plan 7), bouton Réinitialiser, vrai N2, formules fiscales exactes, upload photos/documents (Plan 5c), vue Carte (Plan 6).

---

### Task 1: Moteur de calcul — `calc/scoring.ts` (score /100 + verdict)

**Files:**
- Create: `src/lib/calc/scoring.ts`

**Interfaces:**
- Consumes: `type Verdict` (`@/lib/calc/score`).
- Produces: `export type ScoreBreakdown = { scoreSur100: number; rendementScore: number; cashflowScore: number; longTermeScore: number }` · `computeScoreSur100(input: { rendementNetNetPct: number | null; cashOnCashPct: number | null; triPct: number | null }): ScoreBreakdown` · `computeVerdictFromScore(scoreSur100: number): Verdict`. Consommé par Task 7 (`SectionVerdict`).

- [ ] **Step 1: Écrire le module**

Fichier `src/lib/calc/scoring.ts` :

```ts
import type { Verdict } from "@/lib/calc/score";

export type ScoreBreakdown = {
  scoreSur100: number;
  rendementScore: number;
  cashflowScore: number;
  longTermeScore: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Normalise une valeur sur 0-100 entre `min` (→0) et `max` (→100), clampée
 *  aux deux bouts. `null` (donnée insuffisante) retombe sur 50 — neutre, ni
 *  bonus ni pénalité, en attendant que le bien ait assez de données. */
function normalize(value: number | null, min: number, max: number): number {
  if (value === null) return 50;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/**
 * Score /100 automatique, fonction du bien + du scénario en cours d'édition
 * (recalculé à chaque changement de curseur ⑦). Combine 3 sous-notes
 * pondérées :
 * - Rendement (40%) : rendement net-net %, 0% → 0, 8% → 100.
 * - Cash-flow (35%) : cash-on-cash %, -5% → 0, 15% → 100.
 * - Long terme (25%) : TRI %, 0% → 0, 12% → 100.
 * Formule fixe, pas de pondération pilotée par l'utilisateur — les profils
 * de priorité (Rentabilité/Patrimoine/Sécurité/Équilibré) arrivent avec
 * l'arbitrage (Plan 7).
 */
export function computeScoreSur100(input: {
  rendementNetNetPct: number | null;
  cashOnCashPct: number | null;
  triPct: number | null;
}): ScoreBreakdown {
  const rendementScore = normalize(input.rendementNetNetPct, 0, 8);
  const cashflowScore = normalize(input.cashOnCashPct, -5, 15);
  const longTermeScore = normalize(input.triPct, 0, 12);
  const scoreSur100 = Math.round(rendementScore * 0.4 + cashflowScore * 0.35 + longTermeScore * 0.25);
  return {
    scoreSur100,
    rendementScore: Math.round(rendementScore),
    cashflowScore: Math.round(cashflowScore),
    longTermeScore: Math.round(longTermeScore),
  };
}

/** Seuils fixes : ≥75 pépite, 55-74 solide, 35-54 correct, <35 à éviter. */
export function computeVerdictFromScore(scoreSur100: number): Verdict {
  if (scoreSur100 >= 75) return "pepite";
  if (scoreSur100 >= 55) return "solide";
  if (scoreSur100 >= 35) return "correct";
  return "a_eviter";
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/scoring.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/scoring.ts
git commit -m "feat(calc): scoring.ts — score/100 automatique (rendement/cash-flow/long terme)"
```

---

### Task 2: `financing.ts` — extraire `computeInFineMonthlyPayment` (dette technique #1)

**Files:**
- Modify: `src/lib/calc/financing.ts`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces (en plus de l'existant) : `computeInFineMonthlyPayment(principal: number, annualRatePct: number): number`. Consommé par Task 4 (`metrics.ts`) et Task 11 (`SectionFinancement`).

- [ ] **Step 1: Ajouter la fonction**

Dans `src/lib/calc/financing.ts`, juste après la fonction `computeInFineSchedule` (après la ligne `}` qui la termine, avant `/** Regroupe un tableau mensuel...`), insérer :

```ts

/** Mensualité d'un prêt in fine = intérêts seuls sur tout le capital (aucun
 *  remboursement de capital avant le dernier mois) — jamais la formule
 *  amortissable classique. Centralisée ici pour éviter la duplication entre
 *  `SectionFinancement` et `SectionCalculs`/`metrics.ts` (dette technique
 *  notée au Plan 5a, corrigée au Plan 5b). */
export function computeInFineMonthlyPayment(principal: number, annualRatePct: number): number {
  if (principal <= 0) return 0;
  return (principal * (annualRatePct / 100)) / 12;
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/financing.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/financing.ts
git commit -m "refactor(calc): extrait computeInFineMonthlyPayment (dette technique Plan 5a)"
```

---

### Task 3: `tax.ts` — exporter `REGIME_LABELS` (dette technique #2)

**Files:**
- Modify: `src/lib/calc/tax.ts`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces (en plus de l'existant) : `export const REGIME_LABELS: Record<TaxRegime, string>` (au lieu d'une constante privée). Consommé par Task 13 (`SectionScenario`).

- [ ] **Step 1: Rendre la constante publique**

Dans `src/lib/calc/tax.ts`, remplacer :

```ts
const REGIME_LABELS: Record<TaxRegime, string> = {
```

par :

```ts
export const REGIME_LABELS: Record<TaxRegime, string> = {
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/tax.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/tax.ts
git commit -m "refactor(calc): exporte REGIME_LABELS depuis tax.ts (dette technique Plan 5a)"
```

---

### Task 4: `calc/metrics.ts` — orchestration unique rentabilité/cash-flow/fiscalité/TRI

**Files:**
- Create: `src/lib/calc/metrics.ts`

**Interfaces:**
- Consumes: `computeFinancingCosts`, `computeAmortizationSchedule`, `computeInFineSchedule`, `computeMonthlyPayment`, `computeInFineMonthlyPayment`, `type FinancingCosts` (`@/lib/calc/financing`, Task 2) · `computeRendementNetPct`, `computeRendementNetNetPct`, `computeCashflowBeforeTax`, `computeCashflowAfterTax`, `computeEffortEpargne`, `computeCashOnCash`, `computePointMort`, `computeTRI`, `computeEnrichissementNet`, `computePlusValueNetteEstimee` (`@/lib/calc/cashflow`) · `compareTaxRegimes`, `type TaxResult` (`@/lib/calc/tax`) · `computeRendementBrutPct` (`@/lib/calc/score`) · `PropertyRow`, `PropertyScenarioRow` (`@/lib/property-detail-types`).
- Produces: `export type InvestmentMetrics = { totalCost: number; costs: FinancingCosts; monthlyPayment: number; monthlyInsurance: number; currentTax: TaxResult; taxRegimes: TaxResult[]; rendementBrutPct: number | null; rendementNetPct: number | null; rendementNetNetPct: number | null; cashflowBeforeTaxMonthly: number | null; cashflowAfterTaxMonthly: number | null; effortEpargne: number | null; cashOnCashPct: number | null; pointMortPct: number | null; tri: number | null; enrichissementNet: number; plusValueNette: number }` et `computeInvestmentMetrics(property: PropertyRow, scenario: PropertyScenarioRow): InvestmentMetrics`. Consommé par Task 7 (`SectionVerdict`) et Task 8 (`SectionCalculs`) — **seule** implémentation de cette chaîne de calcul, pour que verdict et détail des calculs ne puissent jamais diverger.

- [ ] **Step 1: Écrire le module**

Fichier `src/lib/calc/metrics.ts` :

```ts
import {
  computeAmortizationSchedule,
  computeFinancingCosts,
  computeInFineMonthlyPayment,
  computeInFineSchedule,
  computeMonthlyPayment,
  type FinancingCosts,
} from "@/lib/calc/financing";
import {
  computeCashOnCash,
  computeCashflowAfterTax,
  computeCashflowBeforeTax,
  computeEffortEpargne,
  computeEnrichissementNet,
  computePlusValueNetteEstimee,
  computePointMort,
  computeRendementNetNetPct,
  computeRendementNetPct,
  computeTRI,
} from "@/lib/calc/cashflow";
import { compareTaxRegimes, type TaxResult } from "@/lib/calc/tax";
import { computeRendementBrutPct } from "@/lib/calc/score";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const APPRECIATION_PCT_BY_SCENARIO: Record<PropertyScenarioRow["market_scenario"], number> = {
  prudent: 0,
  central: 1.5,
  dynamique: 3,
};

export type InvestmentMetrics = {
  totalCost: number;
  costs: FinancingCosts;
  monthlyPayment: number;
  monthlyInsurance: number;
  currentTax: TaxResult;
  taxRegimes: TaxResult[];
  rendementBrutPct: number | null;
  rendementNetPct: number | null;
  rendementNetNetPct: number | null;
  cashflowBeforeTaxMonthly: number | null;
  cashflowAfterTaxMonthly: number | null;
  effortEpargne: number | null;
  cashOnCashPct: number | null;
  pointMortPct: number | null;
  tri: number | null;
  enrichissementNet: number;
  plusValueNette: number;
};

/**
 * Orchestration unique de toute la chaîne de calcul rentabilité / cash-flow
 * / fiscalité / TRI à partir d'un bien + un scénario. Consommée par
 * ① Verdict (pour le score) ET ⑤ Tous les calculs (pour le détail affiché) —
 * une seule logique, jamais deux implémentations qui pourraient diverger
 * (le même principe que `computeFinancingCosts`, déjà "source unique du
 * capital emprunté" depuis le Plan 5a).
 */
export function computeInvestmentMetrics(property: PropertyRow, scenario: PropertyScenarioRow): InvestmentMetrics {
  const price = property.asking_price;
  const totalCost = (price ?? 0) + property.works_estimate;

  const rendementBrutPct = computeRendementBrutPct({
    asking_price: property.asking_price,
    works_estimate: property.works_estimate,
    estimated_rent: property.estimated_rent,
  });

  const costs = computeFinancingCosts({
    askingPrice: price ?? 0,
    worksEstimate: property.works_estimate,
    apportPct: scenario.apport_pct,
    notaryFeesPct: scenario.notary_fees_pct,
    dossierFees: scenario.dossier_fees,
    guaranteeFees: scenario.guarantee_fees,
    brokerFees: scenario.broker_fees,
  });
  const months = scenario.duration_years * 12;
  const schedule =
    scenario.loan_type === "in_fine"
      ? computeInFineSchedule(costs.loanPrincipal, scenario.interest_rate, months)
      : computeAmortizationSchedule(costs.loanPrincipal, scenario.interest_rate, months, scenario.deferral_months);
  const monthlyPayment =
    scenario.loan_type === "in_fine"
      ? computeInFineMonthlyPayment(costs.loanPrincipal, scenario.interest_rate)
      : computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);
  const insuranceBase = scenario.insurance_on_initial
    ? costs.loanPrincipal
    : (schedule[0]?.remainingBalance ?? costs.loanPrincipal);
  const monthlyInsurance = (insuranceBase * (scenario.insurance_rate / 100)) / 12;

  const annualInterestYear1 = schedule.slice(0, 12).reduce((s, r) => s + r.interest, 0);
  const taxRegimes = compareTaxRegimes({
    annualRent: (property.estimated_rent ?? 0) * 12,
    annualCharges: property.monthly_copro_charges * 12 + property.property_tax,
    annualInterest: annualInterestYear1,
    annualAmortissement: (price ?? 0) * 0.025,
    tmiPct: scenario.tmi_pct,
  });
  const currentTax = taxRegimes.find((r) => r.regime === scenario.tax_regime) ?? taxRegimes[0];

  const rendementNetPct = computeRendementNetPct({
    asking_price: property.asking_price,
    works_estimate: property.works_estimate,
    estimated_rent: property.estimated_rent,
    monthly_copro_charges: property.monthly_copro_charges,
    property_tax: property.property_tax,
    management_fees_pct: scenario.management_fees_pct,
    vacancy_pct: scenario.vacancy_pct,
  });
  const rendementNetNetPct = computeRendementNetNetPct(rendementNetPct, currentTax.annualTax, totalCost);

  const cashflowBeforeTaxMonthly = computeCashflowBeforeTax({
    estimated_rent: property.estimated_rent,
    monthly_copro_charges: property.monthly_copro_charges,
    property_tax: property.property_tax,
    management_fees_pct: scenario.management_fees_pct,
    vacancy_pct: scenario.vacancy_pct,
    monthlyPayment,
    monthlyInsurance,
  });
  const cashflowAfterTaxMonthly = computeCashflowAfterTax(cashflowBeforeTaxMonthly, currentTax.annualTax);
  const effortEpargne = computeEffortEpargne(cashflowAfterTaxMonthly);

  const apportInvested = totalCost * (scenario.apport_pct / 100) + costs.totalFinancingCosts;
  const cashOnCashPct = computeCashOnCash(cashflowAfterTaxMonthly, apportInvested);
  const pointMortPct = computePointMort({
    estimated_rent: property.estimated_rent,
    vacancy_pct: scenario.vacancy_pct,
    monthly_copro_charges: property.monthly_copro_charges,
    property_tax: property.property_tax,
    monthlyPayment,
    monthlyInsurance,
  });

  const appreciationPct = APPRECIATION_PCT_BY_SCENARIO[scenario.market_scenario];
  const plusValueNette = computePlusValueNetteEstimee(totalCost, appreciationPct, scenario.horizon_years);
  const horizonMonthIndex = Math.min(scenario.horizon_years * 12, schedule.length) - 1;
  const remainingBalanceAtHorizon = schedule[horizonMonthIndex]?.remainingBalance ?? costs.loanPrincipal;
  const enrichissementNet = computeEnrichissementNet(costs.loanPrincipal, remainingBalanceAtHorizon);

  const tri = (() => {
    if (cashflowAfterTaxMonthly === null || apportInvested <= 0) return null;
    const annualCashflow = cashflowAfterTaxMonthly * 12;
    const cashflows = [-apportInvested];
    for (let y = 1; y < scenario.horizon_years; y++) cashflows.push(annualCashflow);
    const terminalProceeds = totalCost + plusValueNette - remainingBalanceAtHorizon;
    cashflows.push(annualCashflow + terminalProceeds);
    return computeTRI(cashflows);
  })();

  return {
    totalCost,
    costs,
    monthlyPayment,
    monthlyInsurance,
    currentTax,
    taxRegimes,
    rendementBrutPct,
    rendementNetPct,
    rendementNetNetPct,
    cashflowBeforeTaxMonthly,
    cashflowAfterTaxMonthly,
    effortEpargne,
    cashOnCashPct,
    pointMortPct,
    tri,
    enrichissementNet,
    plusValueNette,
  };
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/metrics.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/metrics.ts
git commit -m "feat(calc): metrics.ts — orchestration unique rentabilité/cash-flow/fiscalité/TRI"
```

---

### Task 5: Server action `updatePropertyScenario` (sauvegarde avec clamp défensif)

**Files:**
- Create: `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts`

**Interfaces:**
- Consumes: `getDemoClient`, `DEMO_USER_ID` (`@/lib/supabase/demo`), `PropertyScenarioRow` (`@/lib/property-detail-types`).
- Produces: `export type ScenarioPatch` et `updatePropertyScenario(propertyId: string, patch: ScenarioPatch): Promise<void>`. Consommé par Task 6 (`useDebouncedScenarioSave`).

- [ ] **Step 1: Écrire le fichier**

Fichier `src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts` :

```ts
"use server";

import { DEMO_USER_ID, getDemoClient } from "@/lib/supabase/demo";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

export type ScenarioPatch = Partial<
  Pick<
    PropertyScenarioRow,
    | "apport_pct"
    | "interest_rate"
    | "duration_years"
    | "loan_type"
    | "insurance_rate"
    | "insurance_on_initial"
    | "notary_fees_pct"
    | "dossier_fees"
    | "guarantee_fees"
    | "broker_fees"
    | "deferral_months"
    | "tax_regime"
    | "tmi_pct"
    | "management_fees_pct"
    | "gli"
    | "pno"
    | "vacancy_pct"
    | "works_provision"
    | "horizon_years"
    | "market_scenario"
  >
>;

/** Bornes de clamp défensif — mêmes valeurs que les curseurs côté UI
 *  (`SectionScenario`). Un patch hors bornes est clampé silencieusement,
 *  jamais rejeté (un slider qui pousse une valeur limite ne doit jamais
 *  faire échouer la sauvegarde). */
const CLAMP_RANGES: Partial<Record<keyof ScenarioPatch, [number, number]>> = {
  apport_pct: [0, 100],
  interest_rate: [0, 8],
  duration_years: [5, 30],
  insurance_rate: [0, 1.5],
  notary_fees_pct: [2, 10],
  dossier_fees: [0, Number.MAX_SAFE_INTEGER],
  guarantee_fees: [0, Number.MAX_SAFE_INTEGER],
  broker_fees: [0, Number.MAX_SAFE_INTEGER],
  deferral_months: [0, 24],
  tmi_pct: [0, 45],
  management_fees_pct: [0, 12],
  vacancy_pct: [0, 20],
  works_provision: [0, Number.MAX_SAFE_INTEGER],
  horizon_years: [5, 30],
};

function clampPatch(patch: ScenarioPatch): ScenarioPatch {
  const clamped: Record<string, unknown> = { ...patch };
  for (const [key, range] of Object.entries(CLAMP_RANGES)) {
    if (!range) continue;
    const value = clamped[key];
    if (typeof value === "number") {
      const [min, max] = range;
      clamped[key] = Math.min(max, Math.max(min, value));
    }
  }
  return clamped as ScenarioPatch;
}

/** Sauvegarde partielle du scénario (N3) d'un bien — appelée en debounce
 *  depuis le panneau de curseurs (⑦, Plan 5b). Filtre `property_id` +
 *  `user_id`, défense en profondeur (RLS contournée par le client démo —
 *  même précaution que Plan 5a). */
export async function updatePropertyScenario(propertyId: string, patch: ScenarioPatch): Promise<void> {
  const supabase = getDemoClient();
  const clamped = clampPatch(patch);

  const { error } = await supabase
    .from("property_scenarios")
    .update(clamped)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur le nouveau fichier.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/bien/[propertyId]/actions.ts"
git commit -m "feat(fiche): server action updatePropertyScenario (clamp défensif + filtre user_id)"
```

---

### Task 6: Hook `useDebouncedScenarioSave`

**Files:**
- Create: `src/lib/hooks/use-debounced-scenario-save.ts`

**Interfaces:**
- Consumes: `updatePropertyScenario`, `type ScenarioPatch` (`@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions`, Task 5), `PropertyScenarioRow` (`@/lib/property-detail-types`).
- Produces: `export type SaveStatus = "idle" | "saving" | "saved" | "error"` et `useDebouncedScenarioSave(propertyId: string): { status: SaveStatus; scheduleSave: (patch: ScenarioPatch) => void }`. Consommé par Task 14 (`FicheScenarioSections`).

- [ ] **Step 1: Écrire le hook**

Fichier `src/lib/hooks/use-debounced-scenario-save.ts` :

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updatePropertyScenario, type ScenarioPatch } from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/actions";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 600;
const SAVED_RESET_MS = 2000;

/** Debounce les écritures du scénario en base : un seul appel réseau même
 *  si plusieurs curseurs sont bougés rapidement (les patchs successifs sont
 *  fusionnés). Le statut retourné pilote l'indicateur "Enregistrement…" /
 *  "Enregistré" à côté de la section ⑦. En cas d'échec, le state local
 *  n'est jamais reverté — l'utilisateur peut retenter en rebougeant un
 *  curseur (aucun bouton "réessayer" dans ce plan). */
export function useDebouncedScenarioSave(propertyId: string): {
  status: SaveStatus;
  scheduleSave: (patch: ScenarioPatch) => void;
} {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatchRef = useRef<ScenarioPatch>({});

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleSave = useCallback(
    (patch: ScenarioPatch) => {
      pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const toSave = pendingPatchRef.current;
        pendingPatchRef.current = {};
        setStatus("saving");
        updatePropertyScenario(propertyId, toSave)
          .then(() => {
            setStatus("saved");
            setTimeout(() => {
              setStatus((current) => (current === "saved" ? "idle" : current));
            }, SAVED_RESET_MS);
          })
          .catch(() => {
            setStatus("error");
          });
      }, DEBOUNCE_MS);
    },
    [propertyId],
  );

  return { status, scheduleSave };
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/hooks/use-debounced-scenario-save.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/use-debounced-scenario-save.ts
git commit -m "feat(fiche): hook useDebouncedScenarioSave (autosave ~600ms, statut idle/saving/saved/error)"
```

---

### Task 7: `SectionVerdict` réactive au scénario (score/100 + détail des 3 sous-notes)

**Files:**
- Modify: `src/components/app/fiche/SectionVerdict.tsx` (réécriture complète du fichier)

**Interfaces:**
- Consumes: `computeInvestmentMetrics` (`@/lib/calc/metrics`, Task 4), `computeScoreSur100`, `computeVerdictFromScore` (`@/lib/calc/scoring`, Task 1), `verdictLabel`, `type Verdict` (`@/lib/calc/score`), `VerdictBadge` (`@/components/app/VerdictBadge`), `formatEUR`, `formatPercent`, `formatPricePerM2` (`@/lib/format`), `SectionCard`, `InfoTooltip` (`@/components/app/fiche/`), `PropertyRow`, `PropertyScenarioRow` (`@/lib/property-detail-types`), `STATUS_COLUMNS` (`@/lib/pipeline-types`).
- Produces: `SectionVerdict({ property: PropertyRow; scenario: PropertyScenarioRow })` — **signature changée** (ajout de `scenario`, obligatoire). Consommé par Task 14 (`FicheScenarioSections`).

- [ ] **Step 1: Remplacer tout le contenu du fichier**

Fichier `src/components/app/fiche/SectionVerdict.tsx` (remplace entièrement le fichier existant) :

```tsx
"use client";

import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { computeScoreSur100, computeVerdictFromScore } from "@/lib/calc/scoring";
import { verdictLabel, type Verdict } from "@/lib/calc/score";
import { VerdictBadge } from "@/components/app/VerdictBadge";
import { formatEUR, formatPercent, formatPricePerM2 } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { InfoTooltip } from "@/components/app/fiche/InfoTooltip";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";
import { STATUS_COLUMNS } from "@/lib/pipeline-types";

const STATUS_LABELS: Record<PropertyRow["status"], string> = Object.fromEntries(
  STATUS_COLUMNS.map((c) => [c.key, c.label]),
) as Record<PropertyRow["status"], string>;

/** Phrase de pré-verdict en français — gabarit déterministe (pas un LLM),
 *  basée sur le score/100 (fonction du scénario). Affinée avec les profils
 *  de priorité pondérés au Plan 7. */
function preVerdictSentence(verdict: Verdict, scoreSur100: number): string {
  switch (verdict) {
    case "pepite":
      return `Score de ${scoreSur100}/100 avec ce scénario : ce bien se détache nettement du lot.`;
    case "solide":
      return `Score de ${scoreSur100}/100 avec ce scénario : un dossier solide, dans la bonne moyenne.`;
    case "correct":
      return `Score de ${scoreSur100}/100 avec ce scénario : correct, sans être exceptionnel — à comparer aux autres finalistes.`;
    case "a_eviter":
      return `Score de ${scoreSur100}/100 avec ce scénario : en dessous du seuil attendu pour ce type de projet.`;
  }
}

export function SectionVerdict({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  const metrics = computeInvestmentMetrics(property, scenario);
  const breakdown = computeScoreSur100({
    rendementNetNetPct: metrics.rendementNetNetPct,
    cashOnCashPct: metrics.cashOnCashPct,
    triPct: metrics.tri,
  });
  const verdict = computeVerdictFromScore(breakdown.scoreSur100);

  return (
    <SectionCard number="①" title="Verdict">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={verdict} />
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
          {STATUS_LABELS[property.status]}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text">
        {preVerdictSentence(verdict, breakdown.scoreSur100)}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-faint">Verdict</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{verdictLabel(verdict)}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Score global</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{breakdown.scoreSur100}/100</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Prix</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatEUR(property.asking_price)}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Prix / m²</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">
            {formatPricePerM2(property.asking_price, property.surface_carrez)}
          </dd>
        </div>
      </dl>
      <div className="mt-5 border-t border-border pt-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wide text-faint">
          Détail du score
          <InfoTooltip text="Score automatique combinant rendement net-net (40%), cash-on-cash (35%) et TRI (25%), recalculé avec le scénario ⑦. Les pondérations personnalisées par profil arrivent avec l'arbitrage (Plan 7)." />
        </h3>
        <dl className="grid grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-faint">Rendement</dt>
            <dd className="mt-0.5 text-sm font-medium text-text">
              {breakdown.rendementScore}/100{" "}
              <span className="text-faint">({formatPercent(metrics.rendementNetNetPct)})</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-faint">Cash-flow</dt>
            <dd className="mt-0.5 text-sm font-medium text-text">
              {breakdown.cashflowScore}/100{" "}
              <span className="text-faint">({formatPercent(metrics.cashOnCashPct)})</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-faint">Long terme</dt>
            <dd className="mt-0.5 text-sm font-medium text-text">
              {breakdown.longTermeScore}/100 <span className="text-faint">({formatPercent(metrics.tri)})</span>
            </dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-xs text-faint">
        Le statut et les actions (visite, négo, écarter…) se gèrent depuis le board ou le tableau du projet.
      </p>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: erreurs attendues à ce stade sur les appelants de `SectionVerdict` qui ne passent pas encore `scenario` (`page.tsx`) — normal, corrigé à la Task 15. Aucune erreur ne doit provenir du fichier `SectionVerdict.tsx` lui-même.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionVerdict.tsx
git commit -m "feat(fiche): SectionVerdict réactive au scénario (score/100 + détail des sous-notes)"
```

---

### Task 8: `SectionCalculs` — utilise `metrics.ts` (dédoublonnage), passe en `"use client"`

**Files:**
- Modify: `src/components/app/fiche/SectionCalculs.tsx` (réécriture complète du fichier)

**Interfaces:**
- Consumes: `computeInvestmentMetrics` (`@/lib/calc/metrics`, Task 4), `formatEUR`, `formatPercent` (`@/lib/format`), `SectionCard`, `InfoTooltip`, `PropertyRow`, `PropertyScenarioRow`.
- Produces: `SectionCalculs({ property: PropertyRow; scenario: PropertyScenarioRow })` — signature inchangée. Consommé par Task 14 (`FicheScenarioSections`).

- [ ] **Step 1: Remplacer tout le contenu du fichier**

Fichier `src/components/app/fiche/SectionCalculs.tsx` (remplace entièrement le fichier existant) :

```tsx
"use client";

import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { formatEUR, formatPercent } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { InfoTooltip } from "@/components/app/fiche/InfoTooltip";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export function SectionCalculs({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  const metrics = computeInvestmentMetrics(property, scenario);

  return (
    <SectionCard number="⑤" title="Tous les calculs">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Metric label="Rendement brut" value={formatPercent(metrics.rendementBrutPct)} />
        <Metric label="Rendement net" value={formatPercent(metrics.rendementNetPct)} />
        <Metric label="Rendement net-net" value={formatPercent(metrics.rendementNetNetPct)} />
        <Metric label="Cash-flow avant impôt / mois" value={formatEUR(metrics.cashflowBeforeTaxMonthly ?? null)} />
        <Metric label="Cash-flow après impôt / mois" value={formatEUR(metrics.cashflowAfterTaxMonthly ?? null)} />
        <Metric label="Effort d'épargne / mois" value={formatEUR(metrics.effortEpargne ?? null)} />
        <Metric
          label="TRI"
          value={formatPercent(metrics.tri)}
          tooltip="Taux de rendement interne sur l'apport, cash-flows + revente estimée à l'horizon du scénario."
        />
        <Metric label="Cash-on-cash" value={formatPercent(metrics.cashOnCashPct)} />
        <Metric
          label="Point mort"
          value={metrics.pointMortPct !== null ? formatPercent(metrics.pointMortPct) : "—"}
          tooltip="Part du loyer effectif nécessaire pour couvrir charges + mensualité + assurance."
        />
        <Metric
          label="Enrichissement net"
          value={formatEUR(metrics.enrichissementNet)}
          tooltip="Capital du prêt remboursé à l'horizon du scénario."
        />
        <Metric
          label="Plus-value nette estimée"
          value={formatEUR(Math.round(metrics.plusValueNette))}
          tooltip="Après frais de vente estimés, sur la base du scénario de marché choisi."
        />
      </dl>
    </SectionCard>
  );
}

function Metric({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-faint">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/SectionCalculs.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionCalculs.tsx
git commit -m "refactor(fiche): SectionCalculs consomme metrics.ts (dédoublonnage avec SectionVerdict)"
```

---

### Task 9: `SectionFiscalite` — passe en `"use client"` (aucun changement de logique)

**Files:**
- Modify: `src/components/app/fiche/SectionFiscalite.tsx:1`

**Interfaces:**
- Consumes: inchangé.
- Produces: `SectionFiscalite({ property: PropertyRow; scenario: PropertyScenarioRow })` — signature et logique inchangées, seul le mode de rendu change (nécessaire car ce composant devient enfant du wrapper client `FicheScenarioSections`, Task 14).

- [ ] **Step 1: Ajouter la directive client**

En tête de `src/components/app/fiche/SectionFiscalite.tsx`, avant la ligne 1 actuelle (`import { computeFinancingCosts } from "@/lib/calc/financing";`), ajouter :

```tsx
"use client";

```

(Aucune autre ligne du fichier ne change — la 3ᵉ dette technique notée au Plan 5a, différence de base d'intérêt entre ⑤ et ⑥, reste intentionnellement non traitée dans ce plan.)

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/SectionFiscalite.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionFiscalite.tsx
git commit -m "chore(fiche): SectionFiscalite en use client (préparation wrapper scénario live)"
```

---

### Task 10: `SectionCharges` — passe en `"use client"` (aucun changement de logique)

**Files:**
- Modify: `src/components/app/fiche/SectionCharges.tsx:1`

**Interfaces:**
- Consumes: inchangé.
- Produces: `SectionCharges({ property: PropertyRow; scenario: PropertyScenarioRow })` — signature et logique inchangées.

- [ ] **Step 1: Ajouter la directive client**

En tête de `src/components/app/fiche/SectionCharges.tsx`, avant la ligne 1 actuelle (`import { formatEUR, formatPercent } from "@/lib/format";`), ajouter :

```tsx
"use client";

```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/SectionCharges.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionCharges.tsx
git commit -m "chore(fiche): SectionCharges en use client (préparation wrapper scénario live)"
```

---

### Task 11: `SectionFinancement` — réutilise `computeInFineMonthlyPayment` (dette technique #1)

**Files:**
- Modify: `src/components/app/fiche/SectionFinancement.tsx:4-10` et `:44-47`

**Interfaces:**
- Consumes (ajout) : `computeInFineMonthlyPayment` (`@/lib/calc/financing`, Task 2).
- Produces: `SectionFinancement({ property: PropertyRow; scenario: PropertyScenarioRow })` — signature inchangée.

- [ ] **Step 1: Ajouter l'import**

Dans `src/components/app/fiche/SectionFinancement.tsx`, remplacer le bloc d'import (lignes 4-10) :

```tsx
import {
  computeAmortizationSchedule,
  computeFinancingCosts,
  computeInFineSchedule,
  computeMonthlyPayment,
  groupAmortizationByYear,
} from "@/lib/calc/financing";
```

par :

```tsx
import {
  computeAmortizationSchedule,
  computeFinancingCosts,
  computeInFineMonthlyPayment,
  computeInFineSchedule,
  computeMonthlyPayment,
  groupAmortizationByYear,
} from "@/lib/calc/financing";
```

- [ ] **Step 2: Utiliser la fonction partagée**

Dans le même fichier, remplacer :

```tsx
  const monthlyPayment =
    scenario.loan_type === "in_fine"
      ? (costs.loanPrincipal * (scenario.interest_rate / 100)) / 12
      : computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);
```

par :

```tsx
  const monthlyPayment =
    scenario.loan_type === "in_fine"
      ? computeInFineMonthlyPayment(costs.loanPrincipal, scenario.interest_rate)
      : computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/SectionFinancement.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/fiche/SectionFinancement.tsx
git commit -m "refactor(fiche): SectionFinancement réutilise computeInFineMonthlyPayment (dette technique Plan 5a)"
```

---

### Task 12: Contrôles génériques du panneau de curseurs (`scenario-controls.tsx`)

**Files:**
- Create: `src/components/app/fiche/scenario-controls.tsx`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: `SliderControl({ label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void })` · `SelectControl<T extends string | number>({ label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void })` · `CheckboxControl({ label: string; checked: boolean; onChange: (checked: boolean) => void })` · `NumberControl({ label: string; value: number; min: number; onChange: (value: number) => void })`. Consommés par Task 13 (`SectionScenario`).

- [ ] **Step 1: Écrire le fichier**

Fichier `src/components/app/fiche/scenario-controls.tsx` :

```tsx
"use client";

/** Contrôles génériques et purement présentationnels pour le panneau de
 *  curseurs du scénario (⑦, Plan 5b) — un composant par type de champ,
 *  réutilisés pour chacun des ~19 réglages. Aucun état interne : tout est
 *  contrôlé par le parent (`SectionScenario`), qui porte la valeur et
 *  appelle `onChange` à chaque interaction. */

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs text-faint">
        <span>{label}</span>
        <span className="font-medium text-text">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-brand"
      />
    </label>
  );
}

export function SelectControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-faint">{label}</span>
      <select
        value={String(value)}
        onChange={(e) => {
          const match = options.find((opt) => String(opt.value) === e.target.value);
          if (match) onChange(match.value);
        }}
        className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border-strong accent-brand"
      />
      {label}
    </label>
  );
}

export function NumberControl({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-faint">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text"
      />
    </label>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/scenario-controls.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/scenario-controls.tsx
git commit -m "feat(fiche): contrôles génériques du scénario (slider/select/checkbox/number)"
```

---

### Task 13: `SectionScenario` réécrite — curseurs/menus/cases + `onChange`

**Files:**
- Modify: `src/components/app/fiche/SectionScenario.tsx` (réécriture complète du fichier)

**Interfaces:**
- Consumes: `SliderControl`, `SelectControl`, `CheckboxControl`, `NumberControl` (`@/components/app/fiche/scenario-controls`, Task 12), `SectionCard` (`@/components/app/fiche/SectionCard`), `REGIME_LABELS` (`@/lib/calc/tax`, Task 3), `PropertyScenarioRow`.
- Produces: `SectionScenario({ scenario: PropertyScenarioRow; onChange: (patch: Partial<PropertyScenarioRow>) => void })` — **signature changée** (ajout de `onChange`, plus de lecture seule). Consommé par Task 14 (`FicheScenarioSections`).

- [ ] **Step 1: Remplacer tout le contenu du fichier**

Fichier `src/components/app/fiche/SectionScenario.tsx` (remplace entièrement le fichier existant) :

```tsx
"use client";

import {
  CheckboxControl,
  NumberControl,
  SelectControl,
  SliderControl,
} from "@/components/app/fiche/scenario-controls";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { REGIME_LABELS } from "@/lib/calc/tax";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

const LOAN_TYPE_OPTIONS: { value: PropertyScenarioRow["loan_type"]; label: string }[] = [
  { value: "amortissable", label: "Amortissable" },
  { value: "in_fine", label: "In fine" },
];

const TAX_REGIME_OPTIONS: { value: PropertyScenarioRow["tax_regime"]; label: string }[] = (
  Object.keys(REGIME_LABELS) as PropertyScenarioRow["tax_regime"][]
).map((regime) => ({ value: regime, label: REGIME_LABELS[regime] }));

const MARKET_SCENARIO_OPTIONS: { value: PropertyScenarioRow["market_scenario"]; label: string }[] = [
  { value: "prudent", label: "Prudent" },
  { value: "central", label: "Central" },
  { value: "dynamique", label: "Dynamique" },
];

const TMI_OPTIONS: { value: number; label: string }[] = [0, 11, 30, 41, 45].map((v) => ({
  value: v,
  label: `${v} %`,
}));

/** Panneau de curseurs/menus/cases du scénario — chaque changement appelle
 *  `onChange` avec un patch partiel, qui déclenche le recalcul instantané
 *  des sections ①④⑤⑥⑧ (state porté par `FicheScenarioSections`) et la
 *  sauvegarde débouncée (Plan 5b). */
export function SectionScenario({
  scenario,
  onChange,
}: {
  scenario: PropertyScenarioRow;
  onChange: (patch: Partial<PropertyScenarioRow>) => void;
}) {
  return (
    <SectionCard number="⑦" title="Scénario">
      <p className="mb-5 text-xs text-faint">
        Bouge les curseurs pour simuler d&apos;autres hypothèses — le verdict et tous les calculs se recalculent
        instantanément, et le scénario est sauvegardé automatiquement.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Financement</legend>
          <SliderControl
            label="Apport"
            value={scenario.apport_pct}
            min={0}
            max={100}
            step={1}
            unit=" %"
            onChange={(v) => onChange({ apport_pct: v })}
          />
          <SliderControl
            label="Taux d'intérêt"
            value={scenario.interest_rate}
            min={0}
            max={8}
            step={0.05}
            unit=" %"
            onChange={(v) => onChange({ interest_rate: v })}
          />
          <SliderControl
            label="Durée"
            value={scenario.duration_years}
            min={5}
            max={30}
            step={1}
            unit=" ans"
            onChange={(v) => onChange({ duration_years: v })}
          />
          <SelectControl
            label="Type de prêt"
            value={scenario.loan_type}
            options={LOAN_TYPE_OPTIONS}
            onChange={(v) => onChange({ loan_type: v })}
          />
          <SliderControl
            label="Différé"
            value={scenario.deferral_months}
            min={0}
            max={24}
            step={1}
            unit=" mois"
            onChange={(v) => onChange({ deferral_months: v })}
          />
          <SliderControl
            label="Taux d'assurance"
            value={scenario.insurance_rate}
            min={0}
            max={1.5}
            step={0.01}
            unit=" %"
            onChange={(v) => onChange({ insurance_rate: v })}
          />
          <CheckboxControl
            label="Assurance calculée sur le capital initial"
            checked={scenario.insurance_on_initial}
            onChange={(v) => onChange({ insurance_on_initial: v })}
          />
          <SliderControl
            label="Frais de notaire"
            value={scenario.notary_fees_pct}
            min={2}
            max={10}
            step={0.1}
            unit=" %"
            onChange={(v) => onChange({ notary_fees_pct: v })}
          />
          <NumberControl
            label="Frais de dossier (€)"
            value={scenario.dossier_fees}
            min={0}
            onChange={(v) => onChange({ dossier_fees: v })}
          />
          <NumberControl
            label="Frais de garantie (€)"
            value={scenario.guarantee_fees}
            min={0}
            onChange={(v) => onChange({ guarantee_fees: v })}
          />
          <NumberControl
            label="Frais de courtage (€)"
            value={scenario.broker_fees}
            min={0}
            onChange={(v) => onChange({ broker_fees: v })}
          />
        </fieldset>

        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Fiscalité</legend>
            <SelectControl
              label="Régime fiscal"
              value={scenario.tax_regime}
              options={TAX_REGIME_OPTIONS}
              onChange={(v) => onChange({ tax_regime: v })}
            />
            <SelectControl
              label="TMI"
              value={scenario.tmi_pct}
              options={TMI_OPTIONS}
              onChange={(v) => onChange({ tmi_pct: v })}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Charges &amp; exploitation</legend>
            <SliderControl
              label="Frais de gestion"
              value={scenario.management_fees_pct}
              min={0}
              max={12}
              step={0.5}
              unit=" %"
              onChange={(v) => onChange({ management_fees_pct: v })}
            />
            <SliderControl
              label="Vacance locative"
              value={scenario.vacancy_pct}
              min={0}
              max={20}
              step={0.5}
              unit=" %"
              onChange={(v) => onChange({ vacancy_pct: v })}
            />
            <NumberControl
              label="Provision travaux (€)"
              value={scenario.works_provision}
              min={0}
              onChange={(v) => onChange({ works_provision: v })}
            />
            <CheckboxControl
              label="Garantie loyers impayés (GLI)"
              checked={scenario.gli}
              onChange={(v) => onChange({ gli: v })}
            />
            <CheckboxControl
              label="Assurance PNO"
              checked={scenario.pno}
              onChange={(v) => onChange({ pno: v })}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Marché &amp; horizon</legend>
            <SelectControl
              label="Scénario de marché"
              value={scenario.market_scenario}
              options={MARKET_SCENARIO_OPTIONS}
              onChange={(v) => onChange({ market_scenario: v })}
            />
            <SliderControl
              label="Horizon"
              value={scenario.horizon_years}
              min={5}
              max={30}
              step={1}
              unit=" ans"
              onChange={(v) => onChange({ horizon_years: v })}
            />
          </fieldset>
        </div>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: erreurs attendues à ce stade sur les appelants de `SectionScenario` qui ne passent pas encore `onChange` (`page.tsx`) — normal, corrigé à la Task 15. Aucune erreur ne doit provenir du fichier `SectionScenario.tsx` lui-même.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionScenario.tsx
git commit -m "feat(fiche): SectionScenario interactive (curseurs/menus/cases + onChange)"
```

---

### Task 14: Wrapper client `FicheScenarioSections`

**Files:**
- Create: `src/components/app/fiche/FicheScenarioSections.tsx`

**Interfaces:**
- Consumes: `SectionVerdict` (Task 7), `SectionBien`, `SectionMarche` (inchangées, Plan 5a), `SectionCalculs` (Task 8), `SectionFiscalite` (Task 9), `SectionCharges` (Task 10), `SectionFinancement` (Task 11), `SectionScenario` (Task 13), `useDebouncedScenarioSave`, `type SaveStatus` (`@/lib/hooks/use-debounced-scenario-save`, Task 6), `PropertyRow`, `PropertyScenarioRow`.
- Produces: `FicheScenarioSections({ property: PropertyRow; scenario: PropertyScenarioRow; propertyId: string })`. Consommé par Task 15 (`page.tsx`).

- [ ] **Step 1: Écrire le fichier**

Fichier `src/components/app/fiche/FicheScenarioSections.tsx` :

```tsx
"use client";

import { useState } from "react";
import { SectionVerdict } from "@/components/app/fiche/SectionVerdict";
import { SectionBien } from "@/components/app/fiche/SectionBien";
import { SectionMarche } from "@/components/app/fiche/SectionMarche";
import { SectionFinancement } from "@/components/app/fiche/SectionFinancement";
import { SectionCalculs } from "@/components/app/fiche/SectionCalculs";
import { SectionFiscalite } from "@/components/app/fiche/SectionFiscalite";
import { SectionScenario } from "@/components/app/fiche/SectionScenario";
import { SectionCharges } from "@/components/app/fiche/SectionCharges";
import { useDebouncedScenarioSave, type SaveStatus } from "@/lib/hooks/use-debounced-scenario-save";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Enregistrement…",
  saved: "Enregistré",
  error: "Échec de l'enregistrement, réessaie",
};

/**
 * Regroupe ①②③④⑤⑥⑦⑧ sous un seul point de bascule client. ② et ③ ne
 * dépendent pas du scénario (inchangées depuis le Plan 5a) mais restent ici
 * pour préserver l'ordre visuel de la fiche — ①④⑤⑥⑦⑧ consomment le state
 * `scenario` en cours d'édition, recalculé à chaque changement de curseur
 * dans ⑦ (Plan 5b). ⑨ (`SectionHumain`) reste en dehors, rendue par
 * `page.tsx` directement (Plan 5c, hors scope de ce plan).
 */
export function FicheScenarioSections({
  property,
  scenario: initialScenario,
  propertyId,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
  propertyId: string;
}) {
  const [scenario, setScenario] = useState(initialScenario);
  const { status, scheduleSave } = useDebouncedScenarioSave(propertyId);

  const handleScenarioChange = (patch: Partial<PropertyScenarioRow>) => {
    setScenario((current) => ({ ...current, ...patch }));
    scheduleSave(patch);
  };

  return (
    <>
      <SectionVerdict property={property} scenario={scenario} />
      <SectionBien property={property} />
      <SectionMarche property={property} />
      <SectionFinancement property={property} scenario={scenario} />
      <SectionCalculs property={property} scenario={scenario} />
      <SectionFiscalite property={property} scenario={scenario} />
      <div className="relative">
        {status !== "idle" && (
          <span
            className={`absolute right-6 top-6 text-xs ${status === "error" ? "text-score-low" : "text-faint"}`}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
        <SectionScenario scenario={scenario} onChange={handleScenarioChange} />
      </div>
      <SectionCharges property={property} scenario={scenario} />
    </>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/FicheScenarioSections.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/FicheScenarioSections.tsx
git commit -m "feat(fiche): wrapper client FicheScenarioSections (state scénario + autosave)"
```

---

### Task 15: `page.tsx` — délègue ①②③④⑤⑥⑦⑧ au wrapper

**Files:**
- Modify: `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx`

**Interfaces:**
- Consumes: `FicheScenarioSections` (`@/components/app/fiche/FicheScenarioSections`, Task 14), `SectionHumain` (inchangée).
- Produces: aucun changement de signature de route (fetch de données inchangé).

- [ ] **Step 1: Remplacer les imports de sections**

Dans `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx`, remplacer le bloc d'imports de sections (lignes 4-12) :

```tsx
import { SectionVerdict } from "@/components/app/fiche/SectionVerdict";
import { SectionBien } from "@/components/app/fiche/SectionBien";
import { SectionMarche } from "@/components/app/fiche/SectionMarche";
import { SectionFinancement } from "@/components/app/fiche/SectionFinancement";
import { SectionCalculs } from "@/components/app/fiche/SectionCalculs";
import { SectionFiscalite } from "@/components/app/fiche/SectionFiscalite";
import { SectionScenario } from "@/components/app/fiche/SectionScenario";
import { SectionCharges } from "@/components/app/fiche/SectionCharges";
import { SectionHumain } from "@/components/app/fiche/SectionHumain";
```

par :

```tsx
import { FicheScenarioSections } from "@/components/app/fiche/FicheScenarioSections";
import { SectionHumain } from "@/components/app/fiche/SectionHumain";
```

- [ ] **Step 2: Remplacer le bloc de rendu des sections**

Dans le même fichier, remplacer :

```tsx
      <div className="mt-6 flex flex-col gap-6">
        <SectionVerdict property={property} />
        <SectionBien property={property} />
        <SectionMarche property={property} />
        <SectionFinancement property={property} scenario={scenario} />
        <SectionCalculs property={property} scenario={scenario} />
        <SectionFiscalite property={property} scenario={scenario} />
        <SectionScenario scenario={scenario} />
        <SectionCharges property={property} scenario={scenario} />
        <SectionHumain property={property} contact={contact} notes={notes} photos={photos} documents={documents} />
      </div>
```

par :

```tsx
      <div className="mt-6 flex flex-col gap-6">
        <FicheScenarioSections property={property} scenario={scenario} propertyId={propertyId} />
        <SectionHumain property={property} contact={contact} notes={notes} photos={photos} documents={documents} />
      </div>
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: **zéro erreur** sur l'ensemble du projet (les erreurs attendues aux Tasks 7 et 13 doivent avoir disparu).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx"
git commit -m "feat(fiche): page.tsx délègue ①②③④⑤⑥⑦⑧ à FicheScenarioSections"
```

---

### Task 16: Vérification finale (build, lint, QA manuelle)

**Files:** aucun fichier créé — tâche de vérification uniquement.

**Interfaces:** N/A.

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: build réussi, aucune erreur TypeScript ni erreur de build.

- [ ] **Step 2: Lint complet**

Run: `npm run lint`
Expected: 0 erreur (les warnings préexistants hors périmètre, déjà notés au Plan 5a, sont acceptables).

- [ ] **Step 3: QA manuelle — recalcul live**

Run: `npm run dev`, puis ouvrir dans le navigateur la fiche d'un bien seedé (`/app/p/<projectId>/bien/<propertyId>`, IDs disponibles via `supabase/migrations/20260721000007_seed_demo.sql` ou la vue Tableau du projet).

Vérifier :
- Bouger le curseur "Apport" recalcule **instantanément** (sans rechargement) : ① Score global, ④ Capital emprunté, ⑤ tous les indicateurs, ⑥ le tableau fiscal.
- Changer "Régime fiscal" recalcule ⑤ et surligne la nouvelle ligne "Actuel" dans ⑥.
- Cocher/décocher "GLI"/"PNO" et changer "Type de prêt" (amortissable ↔ in fine) recalculent ④⑤.
- Un indicateur "Enregistrement…" apparaît près de ⑦ après un changement, puis "Enregistré" ~0,6s après, qui disparaît après ~2s.
- **Recharger la page** (F5) : les valeurs de scénario modifiées sont bien celles affichées (persistées en base).
- ② Le bien et ③ Marché n'affichent jamais de changement quel que soit le scénario.

- [ ] **Step 4: Commit final (si des ajustements ont été faits pendant la QA)**

```bash
git add -A
git commit -m "fix(fiche): ajustements post-QA manuelle Plan 5b"
```

(Ne committer que si la QA a nécessité une correction — sinon cette étape est un no-op.)

---

## Self-Review (fait par l'auteur du plan avant remise)

- **Couverture de la spec** : §3 architecture → Tasks 14-15 · §4 score/100 → Tasks 1, 4, 7 · §5 contrôles par champ → Tasks 12-13 (les 19 champs du tableau sont tous présents dans Task 13) · §6 sauvegarde → Tasks 5-6 · §7 dette technique → Tasks 2, 3, 8, 11 · §8 fichiers → couverts intégralement (le fichier `metrics.ts`, absent de la liste §8 de la spec, est une décomposition d'implémentation ajoutée pour éviter la duplication de logique entre ① et ⑤ — documentée explicitement dans les Global Constraints de ce plan).
- **Cohérence des types** : `ScenarioPatch` (Task 5) et le patch émis par `SectionScenario`/`FicheScenarioSections` (Tasks 13-14) portent exactement les mêmes clés ; `SaveStatus` défini une seule fois (Task 6), réutilisé tel quel (Task 14) ; `InvestmentMetrics` (Task 4) expose tous les champs consommés par Tasks 7 et 8, vérifié champ par champ.
- **Aucun placeholder** : chaque étape contient le code complet, aucun "TODO"/"à compléter".
