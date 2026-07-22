# Plan 5a — Fiche complète (moteur de calcul + page) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activer le bouton « Analyse complète → » du `PropertyDrawer` vers une page pleine `/app/p/[projectId]/bien/[propertyId]` qui déroule les 9 sections (①→⑨) de l'analyse d'un bien — verdict, N1, marché (mock déterministe), financement, tous les calculs, fiscalité tous régimes, scénario (lecture seule), charges, contexte humain — avec un moteur de calcul TS déterministe et des tooltips explicatifs.

**Architecture:** Le moteur de calcul est éclaté en 4 modules purs et sans I/O sous `src/lib/calc/` (`financing.ts`, `cashflow.ts`, `tax.ts`, `market-mock.ts`), tous consommés uniquement côté serveur par la nouvelle route (Server Component, une seule requête Supabase qui joint bien + scénario + contact + notes). Chaque section de la fiche est un composant dédié sous `src/components/app/fiche/`, purement présentationnel (aucun état, aucune requête — reçoit ses données calculées en props). Aucune nouvelle migration Supabase : tout le schéma existe depuis le Plan 1.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 (tokens `src/design/tokens.css`). Pas de nouvelle dépendance npm.

## Global Constraints

- **Desktop-first** ; pas de traitement mobile particulier.
- **Identité = dark grotesk** des tokens existants : `bg-bg`, `bg-bg-alt`, `text-text`, `text-muted`, `text-faint`, `text-brand`, `bg-brand`, `border-border`, `border-border-strong`, `text-score-high`/`bg-score-high`, `text-score-mid`/`bg-score-mid`, `text-score-low`/`bg-score-low`. Aucune couleur hors tokens.
- **Pas de lib d'icônes/UI/charts** : tout fait main. Pas de nouvelle dépendance npm dans ce plan.
- **Aucun framework de test dans ce repo.** Vérification de chaque tâche = `npx tsc --noEmit` après chaque fichier, puis `npm run build` + `npm run lint` en fin de plan (doivent rester verts), + vérification manuelle via `npm run dev`. **Ne jamais écrire de test unitaire.**
- **Accès données** : `getDemoClient()` (`@/lib/supabase/demo`) + filtre explicite `user_id = DEMO_USER_ID`, `project_id`/`property_id` sur les lectures ciblées. Pas d'auth réelle (Phase 5).
- **`page.tsx` de la nouvelle route doit avoir `export const dynamic = "force-dynamic";`** (lit Supabase), comme toutes les routes `(app)` existantes.
- **Composants app → `src/components/app/` (sous-dossier `fiche/` pour les sections)** ; moteur de calcul pur → `src/lib/calc/` ; types → `src/lib/`.
- **Moteur de calcul = TS pur, synchrone, sans I/O ni appel LLM.** Jamais un chiffre financier produit par une IA. Formules **provisoires** (affinées à une étape ultérieure) — ne jamais retourner `NaN`/`Infinity`, toujours `null` en repli si les données sont insuffisantes.
- **Réutiliser tel quel (ne pas redéfinir)** : `computeRendementBrutPct`/`computeVerdict`/`verdictLabel`/`Verdict` (`src/lib/calc/score.ts`), `formatEUR`/`formatM2`/`formatPercent`/`formatPricePerM2`/`daysSince` (`src/lib/format.ts`), `VerdictBadge` (`src/components/app/VerdictBadge.tsx`), `PipelineProperty`/`PropertyStatus`/`STATUS_COLUMNS` (`src/lib/pipeline-types.ts`), `getDemoClient`/`DEMO_USER_ID` (`src/lib/supabase/demo.ts`), `Database`/`Json` (`src/lib/supabase/types.ts`).
- **Section ⑦ Scénario = lecture seule dans ce plan** (aucun curseur, aucune sauvegarde — Plan 5b). **Section ⑨ photos/documents = placeholder explicite** (`title`/texte pointant vers le Plan 5c, jamais un lien mort).
- **Aucune nouvelle migration Supabase.**
- **Hors-scope de ce plan** : interactivité du scénario (Plan 5b), upload photos/documents (Plan 5c), vrai piochage N2, formules fiscales exactes/maintenues, verdict multi-critère pondéré (Plan 7), vue Carte (Plan 6), comparer/arbitrage (Plan 7), flux d'ajout (Plan 8).

---

### Task 1: Moteur de calcul — `market-mock.ts` (marché N2 déterministe)

**Files:**
- Create: `src/lib/calc/market-mock.ts`

**Interfaces:**
- Consumes: rien (module autonome).
- Produces: `export type MockMarketData = { pricePerM2DVF: number; rentPerM2: number; tensionLocative: "faible" | "moyenne" | "forte"; vacancyPct: number; riskLevel: "faible" | "modere" | "eleve"; demographicTrend: "declin" | "stable" | "croissance" }` et `computeMockMarketData(inseeCode: string | null, address: string | null): MockMarketData`. Consommé par Task 9 (`SectionMarche`).

- [ ] **Step 1: Écrire le module**

Fichier `src/lib/calc/market-mock.ts` :

```ts
export type MockMarketData = {
  pricePerM2DVF: number;
  rentPerM2: number;
  tensionLocative: "faible" | "moyenne" | "forte";
  vacancyPct: number;
  riskLevel: "faible" | "modere" | "eleve";
  demographicTrend: "declin" | "stable" | "croissance";
};

/** Hash FNV-1a — déterministe, stable, aucune dépendance. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Génère des valeurs de marché (N2) plausibles et STABLES à partir de
 * l'adresse/code INSEE du bien — aucune vraie donnée DVF/loyers/tension pour
 * l'instant (le vrai piochage N2 est une étape ultérieure de la roadmap,
 * hors-scope de ce build). Même interface que prendra le vrai N2 : seule
 * cette implémentation interne sera remplacée le moment venu.
 */
export function computeMockMarketData(inseeCode: string | null, address: string | null): MockMarketData {
  const key = inseeCode || address || "estio-defaut";
  const hash = hashString(key);

  const pricePerM2DVF = 1800 + (hash % 6200); // 1800 → 8000 €/m²
  const rentPerM2 = 9 + ((hash >>> 4) % 16); // 9 → 25 €/m²
  const tensionLocative = (["faible", "moyenne", "forte"] as const)[(hash >>> 8) % 3];
  const vacancyPct = 2 + ((hash >>> 12) % 10); // 2 → 12 %
  const riskLevel = (["faible", "modere", "eleve"] as const)[(hash >>> 16) % 3];
  const demographicTrend = (["declin", "stable", "croissance"] as const)[(hash >>> 20) % 3];

  return { pricePerM2DVF, rentPerM2, tensionLocative, vacancyPct, riskLevel, demographicTrend };
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/market-mock.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/market-mock.ts
git commit -m "feat(calc): market-mock.ts — générateur déterministe de données N2 d'exemple"
```

---

### Task 2: Moteur de calcul — `financing.ts` (mensualité, amortissement, coûts)

**Files:**
- Create: `src/lib/calc/financing.ts`

**Interfaces:**
- Consumes: rien (module autonome).
- Produces : `export type AmortizationRow = { month: number; payment: number; interest: number; principal: number; remainingBalance: number }` · `export type AnnualAmortizationRow = { year: number; payment: number; interest: number; principal: number; remainingBalance: number }` · `computeMonthlyPayment(principal: number, annualRatePct: number, months: number): number` · `computeAmortizationSchedule(principal: number, annualRatePct: number, months: number, deferralMonths?: number): AmortizationRow[]` · `computeInFineSchedule(principal: number, annualRatePct: number, months: number): AmortizationRow[]` · `groupAmortizationByYear(schedule: AmortizationRow[]): AnnualAmortizationRow[]` · `export type FinancingScenarioInput = { askingPrice: number; worksEstimate: number; apportPct: number; notaryFeesPct: number; dossierFees: number; guaranteeFees: number; brokerFees: number }` · `export type FinancingCosts = { loanPrincipal: number; notaryFees: number; totalFinancingCosts: number; totalProjectCost: number }` · `computeFinancingCosts(input: FinancingScenarioInput): FinancingCosts`. Consommé par Task 3 (`cashflow.ts`) et Task 10 (`SectionFinancement`).

- [ ] **Step 1: Écrire le module**

Fichier `src/lib/calc/financing.ts` :

```ts
export type AmortizationRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
};

export type AnnualAmortizationRow = {
  year: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
};

/** Mensualité d'un prêt amortissable classique. Retourne 0 si les entrées
 *  sont invalides (jamais NaN/Infinity). */
export function computeMonthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** Tableau d'amortissement MENSUEL complet (prêt amortissable), avec un
 *  différé partiel optionnel (intérêts seuls pendant `deferralMonths`).
 *  L'UI (Task 10) regroupe ces lignes par 12 pour la vue annuelle — un seul
 *  calcul sous-jacent, jamais deux logiques. */
export function computeAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  months: number,
  deferralMonths = 0,
): AmortizationRow[] {
  if (principal <= 0 || months <= 0) return [];
  const monthlyRate = annualRatePct / 100 / 12;
  const rows: AmortizationRow[] = [];
  let balance = principal;

  const deferral = Math.min(Math.max(deferralMonths, 0), months - 1);
  for (let m = 1; m <= deferral; m++) {
    const interest = balance * monthlyRate;
    rows.push({ month: m, payment: interest, interest, principal: 0, remainingBalance: balance });
  }

  const remainingMonths = months - deferral;
  const payment = computeMonthlyPayment(balance, annualRatePct, remainingMonths);
  for (let m = deferral + 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(payment - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month: m, payment, interest, principal: principalPaid, remainingBalance: balance });
  }
  return rows;
}

/** Tableau d'amortissement d'un prêt in fine : intérêts seuls chaque mois,
 *  capital remboursé en une fois au dernier mois. */
export function computeInFineSchedule(principal: number, annualRatePct: number, months: number): AmortizationRow[] {
  if (principal <= 0 || months <= 0) return [];
  const monthlyRate = annualRatePct / 100 / 12;
  const rows: AmortizationRow[] = [];
  for (let m = 1; m < months; m++) {
    const interest = principal * monthlyRate;
    rows.push({ month: m, payment: interest, interest, principal: 0, remainingBalance: principal });
  }
  const lastInterest = principal * monthlyRate;
  rows.push({
    month: months,
    payment: lastInterest + principal,
    interest: lastInterest,
    principal,
    remainingBalance: 0,
  });
  return rows;
}

/** Regroupe un tableau mensuel en récapitulatif annuel (une ligne par
 *  paquet de 12 mois) — utilisé par le toggle annuel/mensuel de l'UI. */
export function groupAmortizationByYear(schedule: AmortizationRow[]): AnnualAmortizationRow[] {
  const years: AnnualAmortizationRow[] = [];
  for (let i = 0; i < schedule.length; i += 12) {
    const chunk = schedule.slice(i, i + 12);
    if (chunk.length === 0) continue;
    const last = chunk[chunk.length - 1];
    years.push({
      year: Math.floor(i / 12) + 1,
      payment: chunk.reduce((s, r) => s + r.payment, 0),
      interest: chunk.reduce((s, r) => s + r.interest, 0),
      principal: chunk.reduce((s, r) => s + r.principal, 0),
      remainingBalance: last.remainingBalance,
    });
  }
  return years;
}

export type FinancingScenarioInput = {
  askingPrice: number;
  worksEstimate: number;
  apportPct: number;
  notaryFeesPct: number;
  dossierFees: number;
  guaranteeFees: number;
  brokerFees: number;
};

export type FinancingCosts = {
  loanPrincipal: number;
  notaryFees: number;
  totalFinancingCosts: number;
  totalProjectCost: number;
};

/** Coût total du financement : frais annexes (notaire/dossier/garantie/
 *  courtage) financés dans l'emprunt, capital emprunté = coût total du
 *  projet moins l'apport, plus ces frais. */
export function computeFinancingCosts(input: FinancingScenarioInput): FinancingCosts {
  const totalCost = input.askingPrice + input.worksEstimate;
  const apport = totalCost * (input.apportPct / 100);
  const notaryFees = input.askingPrice * (input.notaryFeesPct / 100);
  const totalFinancingCosts = notaryFees + input.dossierFees + input.guaranteeFees + input.brokerFees;
  const loanPrincipal = Math.max(0, totalCost - apport + totalFinancingCosts);
  return {
    loanPrincipal,
    notaryFees,
    totalFinancingCosts,
    totalProjectCost: totalCost + totalFinancingCosts,
  };
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/financing.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/financing.ts
git commit -m "feat(calc): financing.ts — mensualité, tableaux d'amortissement, coûts annexes"
```

---

### Task 3: Moteur de calcul — `cashflow.ts` (rentabilité, cash-flow, TRI)

**Files:**
- Create: `src/lib/calc/cashflow.ts`

**Interfaces:**
- Consumes: rien de nouveau (fonctions pures, prennent des scalaires en entrée — pas de dépendance sur `financing.ts`/`score.ts` dans ce fichier ; l'orchestration avec `computeMonthlyPayment`/`computeFinancingCosts`/`computeRendementBrutPct` se fait dans Task 11 `SectionCalculs`).
- Produces: `computeRendementNetPct(input): number | null` · `computeRendementNetNetPct(rendementNetPct: number | null, annualTax: number, totalCost: number): number | null` · `computeCashflowBeforeTax(input): number | null` · `computeCashflowAfterTax(cashflowBeforeTaxMonthly: number | null, annualTax: number): number | null` · `computeEffortEpargne(cashflowAfterTaxMonthly: number | null): number | null` · `computeCashOnCash(cashflowAfterTaxMonthly: number | null, apportInvested: number): number | null` · `computePointMort(input): number | null` · `computeTRI(cashflows: number[]): number | null` · `computeEnrichissementNet(loanPrincipal: number, remainingBalanceAtHorizon: number): number` · `computePlusValueNetteEstimee(totalCost: number, appreciationPctPerYear: number, horizonYears: number, sellingCostsPct?: number): number`. Consommé par Task 11 (`SectionCalculs`).

- [ ] **Step 1: Écrire le module**

Fichier `src/lib/calc/cashflow.ts` :

```ts
/** Rendement net annuel = (loyer effectif − charges − gestion) / coût total, en %.
 *  `null` si prix/loyer insuffisants (jamais 0/NaN). */
export function computeRendementNetPct(input: {
  asking_price: number | null;
  works_estimate: number;
  estimated_rent: number | null;
  monthly_copro_charges: number;
  property_tax: number;
  management_fees_pct: number;
  vacancy_pct: number;
}): number | null {
  const price = input.asking_price;
  const rent = input.estimated_rent;
  if (!price || price <= 0 || !rent || rent <= 0) return null;
  const totalCost = price + input.works_estimate;
  if (totalCost <= 0) return null;
  const effectiveAnnualRent = rent * 12 * (1 - input.vacancy_pct / 100);
  const managementFees = effectiveAnnualRent * (input.management_fees_pct / 100);
  const annualNetIncome =
    effectiveAnnualRent - input.monthly_copro_charges * 12 - input.property_tax - managementFees;
  return (annualNetIncome / totalCost) * 100;
}

/** Rendement net-net = rendement net moins l'impôt annuel rapporté au coût total. */
export function computeRendementNetNetPct(
  rendementNetPct: number | null,
  annualTax: number,
  totalCost: number,
): number | null {
  if (rendementNetPct === null || totalCost <= 0) return null;
  return rendementNetPct - (annualTax / totalCost) * 100;
}

/** Cash-flow mensuel avant impôt = loyer effectif − charges − mensualité − assurance. */
export function computeCashflowBeforeTax(input: {
  estimated_rent: number | null;
  monthly_copro_charges: number;
  property_tax: number;
  management_fees_pct: number;
  vacancy_pct: number;
  monthlyPayment: number;
  monthlyInsurance: number;
}): number | null {
  const rent = input.estimated_rent;
  if (!rent || rent <= 0) return null;
  const effectiveRent = rent * (1 - input.vacancy_pct / 100);
  const managementFees = effectiveRent * (input.management_fees_pct / 100);
  return (
    effectiveRent -
    input.monthly_copro_charges -
    input.property_tax / 12 -
    managementFees -
    input.monthlyPayment -
    input.monthlyInsurance
  );
}

export function computeCashflowAfterTax(
  cashflowBeforeTaxMonthly: number | null,
  annualTax: number,
): number | null {
  if (cashflowBeforeTaxMonthly === null) return null;
  return cashflowBeforeTaxMonthly - annualTax / 12;
}

/** Effort d'épargne mensuel = combien il faut sortir de sa poche si le
 *  cash-flow après impôt est négatif (0 sinon). */
export function computeEffortEpargne(cashflowAfterTaxMonthly: number | null): number | null {
  if (cashflowAfterTaxMonthly === null) return null;
  return cashflowAfterTaxMonthly < 0 ? -cashflowAfterTaxMonthly : 0;
}

export function computeCashOnCash(
  cashflowAfterTaxMonthly: number | null,
  apportInvested: number,
): number | null {
  if (cashflowAfterTaxMonthly === null || apportInvested <= 0) return null;
  return ((cashflowAfterTaxMonthly * 12) / apportInvested) * 100;
}

/** Point mort = % du loyer effectif nécessaire pour couvrir charges + mensualité + assurance. */
export function computePointMort(input: {
  estimated_rent: number | null;
  vacancy_pct: number;
  monthly_copro_charges: number;
  property_tax: number;
  monthlyPayment: number;
  monthlyInsurance: number;
}): number | null {
  const rent = input.estimated_rent;
  if (!rent || rent <= 0) return null;
  const effectiveRent = rent * (1 - input.vacancy_pct / 100);
  if (effectiveRent <= 0) return null;
  return (
    ((input.monthly_copro_charges + input.property_tax / 12 + input.monthlyPayment + input.monthlyInsurance) /
      effectiveRent) *
    100
  );
}

/** TRI (taux de rendement interne) par Newton-Raphson sur des flux annuels
 *  (flux[0] = investissement initial négatif). Retourne `null` si la série
 *  ne converge pas en 100 itérations — jamais NaN/Infinity affiché. */
export function computeTRI(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null;
  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + rate, t);
      if (t > 0) dnpv -= (t * cashflows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 1e-6) return rate * 100;
    if (dnpv === 0) break;
    const nextRate = rate - npv / dnpv;
    if (!Number.isFinite(nextRate) || nextRate <= -1) break;
    rate = nextRate;
  }
  return Number.isFinite(rate) && rate > -1 ? rate * 100 : null;
}

/** Enrichissement net = capital du prêt effectivement remboursé à l'horizon. */
export function computeEnrichissementNet(loanPrincipal: number, remainingBalanceAtHorizon: number): number {
  return Math.max(0, loanPrincipal - remainingBalanceAtHorizon);
}

/** Plus-value nette estimée à l'horizon, après frais de vente (7 % par défaut). */
export function computePlusValueNetteEstimee(
  totalCost: number,
  appreciationPctPerYear: number,
  horizonYears: number,
  sellingCostsPct = 7,
): number {
  const futureValue = totalCost * Math.pow(1 + appreciationPctPerYear / 100, horizonYears);
  const sellingCosts = futureValue * (sellingCostsPct / 100);
  return futureValue - sellingCosts - totalCost;
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/cashflow.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/cashflow.ts
git commit -m "feat(calc): cashflow.ts — rendements, cash-flow, TRI, enrichissement, plus-value"
```

---

### Task 4: Moteur de calcul — `tax.ts` (6 régimes fiscaux + comparateur)

**Files:**
- Create: `src/lib/calc/tax.ts`

**Interfaces:**
- Consumes: rien (module autonome).
- Produces: `export type TaxRegime = "nu_micro" | "nu_reel" | "lmnp_micro" | "lmnp_reel" | "sci_ir" | "sci_is"` (même valeurs que l'enum Supabase `tax_regime`) · `export type TaxInput = { annualRent: number; annualCharges: number; annualInterest: number; annualAmortissement: number; tmiPct: number; psPct?: number; isPct?: number }` · `export type TaxResult = { regime: TaxRegime; label: string; taxableIncome: number; annualTax: number }` · `computeTaxNuMicro`/`computeTaxNuReel`/`computeTaxLmnpMicro`/`computeTaxLmnpReel`/`computeTaxSciIr`/`computeTaxSciIs(input: TaxInput): TaxResult` · `compareTaxRegimes(input: TaxInput): TaxResult[]` (les 6 résultats triés par impôt croissant). Consommé par Task 12 (`SectionFiscalite`).

- [ ] **Step 1: Écrire le module**

Fichier `src/lib/calc/tax.ts` :

```ts
const PS_DEFAULT_PCT = 17.2;
const IS_DEFAULT_PCT = 25;

export type TaxRegime = "nu_micro" | "nu_reel" | "lmnp_micro" | "lmnp_reel" | "sci_ir" | "sci_is";

/** Entrées communes aux 6 régimes — mêmes chiffres, seule la règle de calcul
 *  du revenu imposable change d'un régime à l'autre. Formules provisoires. */
export type TaxInput = {
  annualRent: number;
  annualCharges: number;
  annualInterest: number;
  annualAmortissement: number;
  tmiPct: number;
  psPct?: number;
  isPct?: number;
};

export type TaxResult = {
  regime: TaxRegime;
  label: string;
  taxableIncome: number;
  annualTax: number;
};

const REGIME_LABELS: Record<TaxRegime, string> = {
  nu_micro: "Location nue — micro-foncier",
  nu_reel: "Location nue — réel",
  lmnp_micro: "LMNP — micro-BIC",
  lmnp_reel: "LMNP — réel",
  sci_ir: "SCI à l'IR",
  sci_is: "SCI à l'IS",
};

export function computeTaxNuMicro(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent * 0.7); // abattement forfaitaire 30 %
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "nu_micro", label: REGIME_LABELS.nu_micro, taxableIncome, annualTax };
}

export function computeTaxNuReel(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent - input.annualCharges - input.annualInterest);
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "nu_reel", label: REGIME_LABELS.nu_reel, taxableIncome, annualTax };
}

export function computeTaxLmnpMicro(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent * 0.5); // abattement forfaitaire 50 %
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "lmnp_micro", label: REGIME_LABELS.lmnp_micro, taxableIncome, annualTax };
}

export function computeTaxLmnpReel(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(
    0,
    input.annualRent - input.annualCharges - input.annualInterest - input.annualAmortissement,
  );
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "lmnp_reel", label: REGIME_LABELS.lmnp_reel, taxableIncome, annualTax };
}

export function computeTaxSciIr(input: TaxInput): TaxResult {
  const ps = input.psPct ?? PS_DEFAULT_PCT;
  const taxableIncome = Math.max(0, input.annualRent - input.annualCharges - input.annualInterest);
  const annualTax = taxableIncome * ((input.tmiPct + ps) / 100);
  return { regime: "sci_ir", label: REGIME_LABELS.sci_ir, taxableIncome, annualTax };
}

export function computeTaxSciIs(input: TaxInput): TaxResult {
  const isPct = input.isPct ?? IS_DEFAULT_PCT;
  const taxableIncome = Math.max(
    0,
    input.annualRent - input.annualCharges - input.annualInterest - input.annualAmortissement,
  );
  const annualTax = taxableIncome * (isPct / 100);
  return { regime: "sci_is", label: REGIME_LABELS.sci_is, taxableIncome, annualTax };
}

/** Les 6 régimes calculés à paramètres égaux, triés du plus favorable
 *  (impôt le plus faible) au moins favorable — pour le tableau comparateur. */
export function compareTaxRegimes(input: TaxInput): TaxResult[] {
  return [
    computeTaxNuMicro(input),
    computeTaxNuReel(input),
    computeTaxLmnpMicro(input),
    computeTaxLmnpReel(input),
    computeTaxSciIr(input),
    computeTaxSciIs(input),
  ].sort((a, b) => a.annualTax - b.annualTax);
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/calc/tax.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/calc/tax.ts
git commit -m "feat(calc): tax.ts — 6 régimes fiscaux + comparateur trié"
```

---

### Task 5: Types `PropertyDetail` (N1 complet + scénario + contact + notes)

**Files:**
- Create: `src/lib/property-detail-types.ts`

**Interfaces:**
- Consumes: `Database` (`@/lib/supabase/types`).
- Produces: `export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"]` · `export type PropertyScenarioRow = Database["public"]["Tables"]["property_scenarios"]["Row"]` · `export type ContactRow = Database["public"]["Tables"]["contacts"]["Row"]` · `export type PropertyDetailNote`/`PropertyDetailPhoto`/`PropertyDetailDocument` · `export type PropertyDetail = { property: PropertyRow; scenario: PropertyScenarioRow; contact: ContactRow | null; notes: PropertyDetailNote[]; photos: PropertyDetailPhoto[]; documents: PropertyDetailDocument[] }`. Les composants `SectionXxx` (Tasks 7-12) consomment individuellement `PropertyRow`/`PropertyScenarioRow`/`ContactRow`/`PropertyDetailNote`/`PropertyDetailPhoto`/`PropertyDetailDocument` en props (pas le composite). `PropertyDetail` lui-même est un type de convenance (utilisable tel quel par le Plan 5b) — Task 13 (`page.tsx`) passe les champs individuellement aux sections sans construire cet objet composite.

- [ ] **Step 1: Écrire le fichier**

Fichier `src/lib/property-detail-types.ts` :

```ts
import type { Database } from "@/lib/supabase/types";

export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyScenarioRow = Database["public"]["Tables"]["property_scenarios"]["Row"];
export type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];

export type PropertyDetailNote = {
  id: string;
  kind: Database["public"]["Enums"]["note_kind"];
  body: string;
  created_at: string;
};

export type PropertyDetailPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
};

export type PropertyDetailDocument = {
  id: string;
  storage_path: string;
  filename: string;
  doc_type: string;
};

/**
 * Vue complète d'un bien pour la fiche d'analyse (Plan 5a) : tout le N1
 * (`properties`), son scénario N3 associé (`property_scenarios`, relation
 * 1-1), son contact, ses notes, et les photos/documents — ces deux derniers
 * restent des tableaux vides tant que le Plan 5c (upload) n'est pas fait ;
 * le type existe déjà en entier pour ne pas le retoucher à ce moment-là.
 */
export type PropertyDetail = {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
  contact: ContactRow | null;
  notes: PropertyDetailNote[];
  photos: PropertyDetailPhoto[];
  documents: PropertyDetailDocument[];
};
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/lib/property-detail-types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/property-detail-types.ts
git commit -m "feat(fiche): type PropertyDetail (N1 complet + scénario + contact + notes)"
```

---

### Task 6: Composants partagés de la fiche (`InfoTooltip`, `SectionCard`)

**Files:**
- Create: `src/components/app/fiche/InfoTooltip.tsx`
- Create: `src/components/app/fiche/SectionCard.tsx`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: `InfoTooltip({ text: string })` et `SectionCard({ title: string; number: string; children: ReactNode })`. Consommés par toutes les sections (Tasks 8-12).

- [ ] **Step 1: Écrire `InfoTooltip`**

Fichier `src/components/app/fiche/InfoTooltip.tsx` :

```tsx
"use client";

import { useState } from "react";

/** Petit "?" cliquable (fait main, pas de lib) qui affiche une explication
 *  au survol/clic — utilisé sur chaque donnée complexe de la fiche. */
export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Explication"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] font-medium text-faint transition-colors hover:border-brand hover:text-brand"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-bg-alt p-3 text-xs leading-relaxed text-muted shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Écrire `SectionCard`**

Fichier `src/components/app/fiche/SectionCard.tsx` :

```tsx
import type { ReactNode } from "react";

/** Carte de section standard de la fiche : numéro ①→⑨, titre, contenu.
 *  Purement présentationnel — aucune section ne gère son propre style. */
export function SectionCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg-alt p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-faint">
        <span className="text-brand">{number}</span> {title}
      </h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur les deux fichiers.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/fiche/InfoTooltip.tsx src/components/app/fiche/SectionCard.tsx
git commit -m "feat(fiche): composants partagés InfoTooltip et SectionCard"
```

---

### Task 7: `SectionVerdict` (①) et `SectionBien` (②)

**Files:**
- Create: `src/components/app/fiche/SectionVerdict.tsx`
- Create: `src/components/app/fiche/SectionBien.tsx`

**Interfaces:**
- Consumes: `computeRendementBrutPct`, `computeVerdict`, `type Verdict` (`@/lib/calc/score`), `VerdictBadge` (`@/components/app/VerdictBadge`), `formatEUR`/`formatM2`/`formatPercent`/`formatPricePerM2` (`@/lib/format`), `SectionCard` (Task 6), `PropertyRow` (`@/lib/property-detail-types`, Task 5).
- Produces: `SectionVerdict({ property: PropertyRow })` et `SectionBien({ property: PropertyRow })`. Consommés par Task 13 (`page.tsx`).

- [ ] **Step 1: Écrire `SectionVerdict`**

Fichier `src/components/app/fiche/SectionVerdict.tsx` :

```tsx
import { computeRendementBrutPct, computeVerdict, verdictLabel, type Verdict } from "@/lib/calc/score";
import { VerdictBadge } from "@/components/app/VerdictBadge";
import { formatEUR, formatPercent, formatPricePerM2 } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyRow } from "@/lib/property-detail-types";

const STATUS_LABELS: Record<PropertyRow["status"], string> = {
  analyser: "À analyser",
  analyse: "Analysé",
  visite: "Visite",
  nego: "En négo",
  ecarte: "Écarté",
  offre: "Offre",
};

/** Phrase de pré-verdict en français — gabarit déterministe (pas un LLM),
 *  affinée avec le vrai scoring multi-critère au Plan 7. */
function preVerdictSentence(verdict: Verdict, rendement: number | null): string {
  if (rendement === null) return "Renseigne le prix et le loyer estimé pour obtenir un premier verdict.";
  const pct = formatPercent(rendement);
  switch (verdict) {
    case "pepite":
      return `Rendement brut de ${pct} : ce bien se détache nettement du lot.`;
    case "solide":
      return `Rendement brut de ${pct} : un dossier solide, dans la bonne moyenne.`;
    case "correct":
      return `Rendement brut de ${pct} : correct, sans être exceptionnel — à comparer aux autres finalistes.`;
    case "a_eviter":
      return `Rendement brut de ${pct} : en dessous du seuil attendu pour ce type de projet.`;
  }
}

export function SectionVerdict({ property }: { property: PropertyRow }) {
  const rendement = computeRendementBrutPct({
    asking_price: property.asking_price,
    works_estimate: property.works_estimate,
    estimated_rent: property.estimated_rent,
  });
  const verdict = computeVerdict(rendement);

  return (
    <SectionCard number="①" title="Verdict">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={verdict} />
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
          {STATUS_LABELS[property.status]}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text">
        {preVerdictSentence(verdict, rendement)}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-faint">Verdict</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{verdictLabel(verdict)}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Rendement brut</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatPercent(rendement)}</dd>
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
      <p className="mt-4 text-xs text-faint">
        Le statut et les actions (visite, négo, écarter…) se gèrent depuis le board ou le tableau du projet.
      </p>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Écrire `SectionBien`**

Fichier `src/components/app/fiche/SectionBien.tsx` :

```tsx
import { formatEUR, formatM2 } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyRow } from "@/lib/property-detail-types";

function yesNo(value: boolean | null): string {
  if (value === null) return "—";
  return value ? "Oui" : "Non";
}

export function SectionBien({ property }: { property: PropertyRow }) {
  return (
    <SectionCard number="②" title="Le bien">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Adresse" value={property.address ?? "—"} />
        <Field label="Ville" value={property.city ?? "—"} />
        <Field label="Code postal" value={property.postal_code ?? "—"} />
        <Field label="Type de bien" value={property.property_type ?? "—"} />
        <Field label="Surface" value={formatM2(property.surface_carrez)} />
        <Field label="Pièces" value={property.rooms?.toString() ?? "—"} />
        <Field label="Chambres" value={property.bedrooms?.toString() ?? "—"} />
        <Field label="Étage" value={property.floor !== null ? `${property.floor} / ${property.floors_total ?? "?"}` : "—"} />
        <Field label="Ascenseur" value={yesNo(property.has_elevator)} />
        <Field label="Année construction" value={property.year_built?.toString() ?? "—"} />
        <Field label="État" value={property.condition ?? "—"} />
        <Field label="DPE" value={property.dpe_letter ?? "—"} />
        <Field label="GES" value={property.ges_letter ?? "—"} />
        <Field label="Exposition" value={property.exposure ?? "—"} />
        <Field label="Balcon" value={yesNo(property.has_balcony)} />
        <Field label="Terrasse" value={yesNo(property.has_terrace)} />
        <Field label="Extérieur" value={property.outdoor_area ? formatM2(property.outdoor_area) : "—"} />
        <Field label="Parking" value={yesNo(property.has_parking)} />
        <Field label="Cave" value={yesNo(property.has_cave)} />
        <Field label="Meublé" value={yesNo(property.furnished)} />
        <Field label="Charges copro / mois" value={formatEUR(property.monthly_copro_charges)} />
        <Field label="Taxe foncière / an" value={formatEUR(property.property_tax)} />
        <Field label="Travaux estimés" value={formatEUR(property.works_estimate)} />
      </dl>
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur les deux fichiers.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/fiche/SectionVerdict.tsx src/components/app/fiche/SectionBien.tsx
git commit -m "feat(fiche): sections ① Verdict et ② Le bien"
```

---

### Task 8: `SectionMarche` (③ Marché N2 — mock déterministe)

**Files:**
- Create: `src/components/app/fiche/SectionMarche.tsx`

**Interfaces:**
- Consumes: `computeMockMarketData` (`@/lib/calc/market-mock`, Task 1), `SectionCard`, `InfoTooltip` (Task 6), `PropertyRow` (Task 5).
- Produces: `SectionMarche({ property: PropertyRow })`. Consommé par Task 13 (`page.tsx`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/SectionMarche.tsx` :

```tsx
import { computeMockMarketData } from "@/lib/calc/market-mock";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { InfoTooltip } from "@/components/app/fiche/InfoTooltip";
import type { PropertyRow } from "@/lib/property-detail-types";

const TENSION_LABELS = { faible: "Faible", moyenne: "Moyenne", forte: "Forte" } as const;
const RISK_LABELS = { faible: "Faible", modere: "Modéré", eleve: "Élevé" } as const;
const TREND_LABELS = { declin: "En déclin", stable: "Stable", croissance: "En croissance" } as const;

export function SectionMarche({ property }: { property: PropertyRow }) {
  const market = computeMockMarketData(property.insee_code, property.address);

  return (
    <SectionCard number="③" title="Marché">
      <p className="mb-4 rounded-xl border border-score-mid/30 bg-score-mid/10 px-3 py-2 text-xs text-score-mid">
        Données d&apos;exemple — le vrai piochage DVF/loyers/tension pour cette adresse arrive à une étape
        ultérieure de la roadmap.
      </p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-faint">
            Prix/m² DVF <InfoTooltip text="Prix moyen au m² des transactions notariées (DVF) dans le secteur, sur les dernières ventes connues." />
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{market.pricePerM2DVF.toLocaleString("fr-FR")} €/m²</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-faint">
            Loyer marché <InfoTooltip text="Loyer mensuel moyen au m² observé pour ce type de bien dans le secteur." />
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{market.rentPerM2} €/m²</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-faint">
            Tension locative <InfoTooltip text="Rapport demande/offre de logements locatifs dans le secteur — plus c'est tendu, plus la relocation est rapide." />
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{TENSION_LABELS[market.tensionLocative]}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Vacance locative</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{market.vacancyPct} %</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-faint">
            Risques <InfoTooltip text="Niveau de risques naturels/technologiques du secteur (source Géorisques, à connecter plus tard)." />
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{RISK_LABELS[market.riskLevel]}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Démographie</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{TREND_LABELS[market.demographicTrend]}</dd>
        </div>
      </dl>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/SectionMarche.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionMarche.tsx
git commit -m "feat(fiche): section ③ Marché (mock déterministe + mention explicite)"
```

---

### Task 9: `SectionFinancement` (④ — mensualité, coûts, tableau d'amortissement annuel/mensuel)

**Files:**
- Create: `src/components/app/fiche/SectionFinancement.tsx`

**Interfaces:**
- Consumes: `computeMonthlyPayment`, `computeAmortizationSchedule`, `computeInFineSchedule`, `groupAmortizationByYear`, `computeFinancingCosts`, `type FinancingScenarioInput` (`@/lib/calc/financing`, Task 2), `formatEUR` (`@/lib/format`), `SectionCard`, `InfoTooltip` (Task 6), `PropertyRow`, `PropertyScenarioRow` (Task 5).
- Produces: `SectionFinancement({ property: PropertyRow; scenario: PropertyScenarioRow })`. Consommé par Task 13 (`page.tsx`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/SectionFinancement.tsx` (client component : le toggle annuel/mensuel est un `useState`) :

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  computeAmortizationSchedule,
  computeFinancingCosts,
  computeInFineSchedule,
  computeMonthlyPayment,
  groupAmortizationByYear,
} from "@/lib/calc/financing";
import { formatEUR } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { InfoTooltip } from "@/components/app/fiche/InfoTooltip";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export function SectionFinancement({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  const [granularity, setGranularity] = useState<"annuel" | "mensuel">("annuel");

  const costs = computeFinancingCosts({
    askingPrice: property.asking_price ?? 0,
    worksEstimate: property.works_estimate,
    apportPct: scenario.apport_pct,
    notaryFeesPct: scenario.notary_fees_pct,
    dossierFees: scenario.dossier_fees,
    guaranteeFees: scenario.guarantee_fees,
    brokerFees: scenario.broker_fees,
  });

  const months = scenario.duration_years * 12;
  const monthlySchedule = useMemo(
    () =>
      scenario.loan_type === "in_fine"
        ? computeInFineSchedule(costs.loanPrincipal, scenario.interest_rate, months)
        : computeAmortizationSchedule(costs.loanPrincipal, scenario.interest_rate, months, scenario.deferral_months),
    [costs.loanPrincipal, scenario.interest_rate, scenario.loan_type, scenario.deferral_months, months],
  );

  const monthlyPayment = computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);
  const insuranceBase = scenario.insurance_on_initial
    ? costs.loanPrincipal
    : monthlySchedule.length > 0
      ? monthlySchedule[0].remainingBalance
      : costs.loanPrincipal;
  const monthlyInsurance = (insuranceBase * (scenario.insurance_rate / 100)) / 12;

  const annualRows = useMemo(() => groupAmortizationByYear(monthlySchedule), [monthlySchedule]);
  const rows = granularity === "annuel" ? annualRows : monthlySchedule;

  return (
    <SectionCard number="④" title="Financement">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-faint">Capital emprunté</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatEUR(costs.loanPrincipal)}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Mensualité (hors assurance)</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatEUR(monthlyPayment)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-faint">
            Assurance emprunteur / mois <InfoTooltip text="Calculée sur le capital initial ou le capital restant dû selon le réglage du scénario." />
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatEUR(Math.round(monthlyInsurance))}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-faint">
            Frais annexes <InfoTooltip text="Frais de notaire, dossier, garantie et courtage — financés dans le capital emprunté." />
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatEUR(costs.totalFinancingCosts)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wide text-faint">Tableau d&apos;amortissement</h3>
        <div className="flex gap-1 rounded-full border border-border p-1">
          {(["annuel", "mensuel"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                granularity === g ? "bg-brand text-bg" : "text-muted hover:text-text"
              }`}
            >
              {g === "annuel" ? "Annuel" : "Mensuel"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 max-h-96 overflow-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-bg-alt">
            <tr className="border-b border-border text-left text-xs text-faint">
              <th className="px-3 py-2 font-normal">{granularity === "annuel" ? "Année" : "Mois"}</th>
              <th className="px-3 py-2 font-normal">Échéance</th>
              <th className="px-3 py-2 font-normal">Intérêts</th>
              <th className="px-3 py-2 font-normal">Capital</th>
              <th className="px-3 py-2 font-normal">Restant dû</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={"year" in row ? row.year : row.month} className="border-b border-border text-text">
                <td className="px-3 py-1.5">{"year" in row ? row.year : row.month}</td>
                <td className="px-3 py-1.5">{formatEUR(Math.round(row.payment))}</td>
                <td className="px-3 py-1.5">{formatEUR(Math.round(row.interest))}</td>
                <td className="px-3 py-1.5">{formatEUR(Math.round(row.principal))}</td>
                <td className="px-3 py-1.5">{formatEUR(Math.round(row.remainingBalance))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/SectionFinancement.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionFinancement.tsx
git commit -m "feat(fiche): section ④ Financement (toggle tableau d'amortissement annuel/mensuel)"
```

---

### Task 10: `SectionCalculs` (⑤ — tous les calculs de rentabilité)

**Files:**
- Create: `src/components/app/fiche/SectionCalculs.tsx`

**Interfaces:**
- Consumes: `computeRendementBrutPct` (`@/lib/calc/score`), `computeFinancingCosts`, `computeMonthlyPayment`, `computeAmortizationSchedule`, `computeInFineSchedule` (`@/lib/calc/financing`, Task 2), `computeRendementNetPct`, `computeRendementNetNetPct`, `computeCashflowBeforeTax`, `computeCashflowAfterTax`, `computeEffortEpargne`, `computeCashOnCash`, `computePointMort`, `computeTRI`, `computeEnrichissementNet`, `computePlusValueNetteEstimee` (`@/lib/calc/cashflow`, Task 3), `compareTaxRegimes` (`@/lib/calc/tax`, Task 4), `formatEUR`/`formatPercent` (`@/lib/format`), `SectionCard`, `InfoTooltip` (Task 6), `PropertyRow`, `PropertyScenarioRow` (Task 5).
- Produces: `SectionCalculs({ property: PropertyRow; scenario: PropertyScenarioRow })`. Consommé par Task 13 (`page.tsx`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/SectionCalculs.tsx` :

```tsx
import { computeRendementBrutPct } from "@/lib/calc/score";
import {
  computeAmortizationSchedule,
  computeFinancingCosts,
  computeInFineSchedule,
  computeMonthlyPayment,
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
import { compareTaxRegimes } from "@/lib/calc/tax";
import { formatEUR, formatPercent } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { InfoTooltip } from "@/components/app/fiche/InfoTooltip";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const APPRECIATION_PCT_BY_SCENARIO: Record<PropertyScenarioRow["market_scenario"], number> = {
  prudent: 0,
  central: 1.5,
  dynamique: 3,
};

export function SectionCalculs({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
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
  const monthlyPayment = computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);
  const insuranceBase = scenario.insurance_on_initial ? costs.loanPrincipal : (schedule[0]?.remainingBalance ?? costs.loanPrincipal);
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

  return (
    <SectionCard number="⑤" title="Tous les calculs">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Metric label="Rendement brut" value={formatPercent(rendementBrutPct)} />
        <Metric label="Rendement net" value={formatPercent(rendementNetPct)} />
        <Metric label="Rendement net-net" value={formatPercent(rendementNetNetPct)} />
        <Metric label="Cash-flow avant impôt / mois" value={formatEUR(cashflowBeforeTaxMonthly ?? null)} />
        <Metric label="Cash-flow après impôt / mois" value={formatEUR(cashflowAfterTaxMonthly ?? null)} />
        <Metric label="Effort d'épargne / mois" value={formatEUR(effortEpargne ?? null)} />
        <Metric
          label="TRI"
          value={formatPercent(tri)}
          tooltip="Taux de rendement interne sur l'apport, cash-flows + revente estimée à l'horizon du scénario."
        />
        <Metric label="Cash-on-cash" value={formatPercent(cashOnCashPct)} />
        <Metric
          label="Point mort"
          value={pointMortPct !== null ? formatPercent(pointMortPct) : "—"}
          tooltip="Part du loyer effectif nécessaire pour couvrir charges + mensualité + assurance."
        />
        <Metric label="Enrichissement net" value={formatEUR(enrichissementNet)} tooltip="Capital du prêt remboursé à l'horizon du scénario." />
        <Metric label="Plus-value nette estimée" value={formatEUR(Math.round(plusValueNette))} tooltip="Après frais de vente estimés, sur la base du scénario de marché choisi." />
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
git commit -m "feat(fiche): section ⑤ Tous les calculs (rendements, cash-flow, TRI, enrichissement, plus-value)"
```

---

### Task 11: `SectionFiscalite` (⑥ — comparateur des 6 régimes)

**Files:**
- Create: `src/components/app/fiche/SectionFiscalite.tsx`

**Interfaces:**
- Consumes: `compareTaxRegimes`, `type TaxRegime` (`@/lib/calc/tax`, Task 4), `formatEUR` (`@/lib/format`), `SectionCard` (Task 6), `PropertyRow`, `PropertyScenarioRow` (Task 5).
- Produces: `SectionFiscalite({ property: PropertyRow; scenario: PropertyScenarioRow })`. Consommé par Task 13 (`page.tsx`).

- [ ] **Step 1: Écrire le composant**

Fichier `src/components/app/fiche/SectionFiscalite.tsx` :

```tsx
import { compareTaxRegimes } from "@/lib/calc/tax";
import { formatEUR } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export function SectionFiscalite({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  // Année 1 approximée : intérêts non recalculés ici (déjà fait dans
  // SectionCalculs) — ce tableau compare les régimes entre eux à charges/
  // loyer égaux, l'exactitude de l'intérêt exact n'affecte pas le classement
  // relatif de façon significative pour cette vue comparative.
  const annualInterestEstimate = (property.asking_price ?? 0) * (1 - scenario.apport_pct / 100) * (scenario.interest_rate / 100);
  const results = compareTaxRegimes({
    annualRent: (property.estimated_rent ?? 0) * 12,
    annualCharges: property.monthly_copro_charges * 12 + property.property_tax,
    annualInterest: annualInterestEstimate,
    annualAmortissement: (property.asking_price ?? 0) * 0.025,
    tmiPct: scenario.tmi_pct,
  });

  return (
    <SectionCard number="⑥" title="Fiscalité — comparateur des régimes">
      <p className="mb-4 text-xs text-faint">
        Les 6 régimes calculés à loyer/charges égaux, du plus favorable au moins favorable. Le régime actuellement
        choisi pour ce bien est surligné.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-faint">
              <th className="px-3 py-2 font-normal">Régime</th>
              <th className="px-3 py-2 font-normal">Revenu imposable</th>
              <th className="px-3 py-2 font-normal">Impôt annuel estimé</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.regime}
                className={`border-b border-border text-text ${
                  r.regime === scenario.tax_regime ? "bg-brand/10" : ""
                }`}
              >
                <td className="px-3 py-2 font-medium">
                  {r.label}
                  {r.regime === scenario.tax_regime && (
                    <span className="ml-2 rounded-full border border-brand px-2 py-0.5 text-[10px] text-brand">
                      Actuel
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{formatEUR(Math.round(r.taxableIncome))}</td>
                <td className="px-3 py-2">{formatEUR(Math.round(r.annualTax))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur `src/components/app/fiche/SectionFiscalite.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/fiche/SectionFiscalite.tsx
git commit -m "feat(fiche): section ⑥ Fiscalité (comparateur statique des 6 régimes)"
```

---

### Task 12: `SectionScenario` (⑦, lecture seule), `SectionCharges` (⑧), `SectionHumain` (⑨)

**Files:**
- Create: `src/components/app/fiche/SectionScenario.tsx`
- Create: `src/components/app/fiche/SectionCharges.tsx`
- Create: `src/components/app/fiche/SectionHumain.tsx`

**Interfaces:**
- Consumes: `formatEUR`/`formatPercent` (`@/lib/format`), `SectionCard` (Task 6), `PropertyRow`, `PropertyScenarioRow`, `ContactRow`, `PropertyDetailNote`, `PropertyDetailPhoto`, `PropertyDetailDocument` (`@/lib/property-detail-types`, Task 5).
- Produces: `SectionScenario({ scenario: PropertyScenarioRow })`, `SectionCharges({ property: PropertyRow; scenario: PropertyScenarioRow })`, `SectionHumain({ property: PropertyRow; contact: ContactRow | null; notes: PropertyDetailNote[]; photos: PropertyDetailPhoto[]; documents: PropertyDetailDocument[] })`. Consommés par Task 13 (`page.tsx`).

- [ ] **Step 1: Écrire `SectionScenario`**

Fichier `src/components/app/fiche/SectionScenario.tsx` :

```tsx
import { formatPercent } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

const LOAN_TYPE_LABELS: Record<PropertyScenarioRow["loan_type"], string> = {
  amortissable: "Amortissable",
  in_fine: "In fine",
};

const TAX_REGIME_LABELS: Record<PropertyScenarioRow["tax_regime"], string> = {
  nu_micro: "Location nue — micro-foncier",
  nu_reel: "Location nue — réel",
  lmnp_micro: "LMNP — micro-BIC",
  lmnp_reel: "LMNP — réel",
  sci_ir: "SCI à l'IR",
  sci_is: "SCI à l'IS",
};

const MARKET_SCENARIO_LABELS: Record<PropertyScenarioRow["market_scenario"], string> = {
  prudent: "Prudent",
  central: "Central",
  dynamique: "Dynamique",
};

/** Lecture seule dans ce plan — les curseurs et le recalcul live arrivent au Plan 5b. */
export function SectionScenario({ scenario }: { scenario: PropertyScenarioRow }) {
  return (
    <SectionCard number="⑦" title="Scénario">
      <p className="mb-4 text-xs text-faint">
        Valeurs actuelles du scénario. Les curseurs de simulation en direct arrivent au Plan 5b.
      </p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Apport" value={formatPercent(scenario.apport_pct, 0)} />
        <Field label="Taux d'intérêt" value={formatPercent(scenario.interest_rate, 2)} />
        <Field label="Durée" value={`${scenario.duration_years} ans`} />
        <Field label="Type de prêt" value={LOAN_TYPE_LABELS[scenario.loan_type]} />
        <Field label="Différé" value={scenario.deferral_months > 0 ? `${scenario.deferral_months} mois` : "Aucun"} />
        <Field label="Régime fiscal" value={TAX_REGIME_LABELS[scenario.tax_regime]} />
        <Field label="TMI" value={formatPercent(scenario.tmi_pct, 0)} />
        <Field label="Frais de gestion" value={formatPercent(scenario.management_fees_pct, 1)} />
        <Field label="Vacance locative" value={formatPercent(scenario.vacancy_pct, 1)} />
        <Field label="Scénario de marché" value={MARKET_SCENARIO_LABELS[scenario.market_scenario]} />
        <Field label="Horizon" value={`${scenario.horizon_years} ans`} />
        <Field label="GLI" value={scenario.gli ? "Oui" : "Non"} />
        <Field label="PNO" value={scenario.pno ? "Oui" : "Non"} />
      </dl>
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: Écrire `SectionCharges`**

Fichier `src/components/app/fiche/SectionCharges.tsx` :

```tsx
import { formatEUR, formatPercent } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export function SectionCharges({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  return (
    <SectionCard number="⑧" title="Charges & exploitation">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Charges copro / mois" value={formatEUR(property.monthly_copro_charges)} />
        <Field label="Taxe foncière / an" value={formatEUR(property.property_tax)} />
        <Field label="Frais de gestion" value={formatPercent(scenario.management_fees_pct, 1)} />
        <Field label="Vacance locative" value={formatPercent(scenario.vacancy_pct, 1)} />
        <Field label="Provision travaux" value={formatEUR(scenario.works_provision)} />
        <Field label="Assurance PNO" value={scenario.pno ? "Souscrite" : "Non souscrite"} />
        <Field label="Garantie loyers impayés (GLI)" value={scenario.gli ? "Souscrite" : "Non souscrite"} />
      </dl>
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 3: Écrire `SectionHumain`**

Fichier `src/components/app/fiche/SectionHumain.tsx` :

```tsx
import { formatEUR } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type {
  ContactRow,
  PropertyDetailDocument,
  PropertyDetailNote,
  PropertyDetailPhoto,
  PropertyRow,
} from "@/lib/property-detail-types";

const CONTACT_KIND_LABELS: Record<ContactRow["kind"], string> = {
  agent: "Agent immobilier",
  mandataire: "Mandataire",
  particulier: "Particulier",
  notaire: "Notaire",
  autre: "Autre",
};

export function SectionHumain({
  property,
  contact,
  notes,
  photos,
  documents,
}: {
  property: PropertyRow;
  contact: ContactRow | null;
  notes: PropertyDetailNote[];
  photos: PropertyDetailPhoto[];
  documents: PropertyDetailDocument[];
}) {
  return (
    <SectionCard number="⑨" title="Contexte humain">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-faint">Prix max</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">{formatEUR(property.max_price)}</dd>
        </div>
        {contact && (
          <>
            <div>
              <dt className="text-xs text-faint">Contact</dt>
              <dd className="mt-0.5 text-sm font-medium text-text">
                {contact.name} · {CONTACT_KIND_LABELS[contact.kind]}
              </dd>
            </div>
            {contact.phone && (
              <div>
                <dt className="text-xs text-faint">Téléphone</dt>
                <dd className="mt-0.5 text-sm font-medium text-text">{contact.phone}</dd>
              </div>
            )}
          </>
        )}
        {property.status === "ecarte" && property.discard_reason && (
          <div className="col-span-full">
            <dt className="text-xs text-faint">Raison de l&apos;écart</dt>
            <dd className="mt-0.5 text-sm font-medium text-text">{property.discard_reason}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5">
        <h3 className="mb-2 text-xs uppercase tracking-wide text-faint">Notes</h3>
        {notes.length === 0 ? (
          <p className="text-sm text-faint">Aucune note pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-border bg-bg p-3 text-sm text-text">
                {note.body}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div
          title="Ajout de photos — arrive au Plan 5c"
          className="flex min-h-24 cursor-not-allowed items-center justify-center rounded-xl border border-dashed border-border-strong text-center text-xs text-faint"
        >
          {photos.length === 0
            ? "Aucune photo — l'ajout de photos arrive au Plan 5c."
            : `${photos.length} photo(s)`}
        </div>
        <div
          title="Ajout de documents — arrive au Plan 5c"
          className="flex min-h-24 cursor-not-allowed items-center justify-center rounded-xl border border-dashed border-border-strong text-center text-xs text-faint"
        >
          {documents.length === 0
            ? "Aucun document — l'ajout de documents arrive au Plan 5c."
            : `${documents.length} document(s)`}
        </div>
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 4: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur sur les trois fichiers.

- [ ] **Step 5: Commit**

```bash
git add src/components/app/fiche/SectionScenario.tsx src/components/app/fiche/SectionCharges.tsx src/components/app/fiche/SectionHumain.tsx
git commit -m "feat(fiche): sections ⑦ Scénario (lecture seule), ⑧ Charges, ⑨ Contexte humain"
```

---

### Task 13: Route `bien/[propertyId]` + activation du bouton « Analyse complète → »

**Files:**
- Create: `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx`
- Modify: `src/components/app/PropertyDrawer.tsx`
- Modify: `src/components/app/PipelineBoard.tsx`
- Modify: `src/components/app/PropertyTable.tsx`

**Interfaces:**
- Consumes : toutes les sections (Tasks 7-12), `PropertyRow`/`PropertyScenarioRow` (Task 5, via le typage du client Supabase — pas de cast manuel nécessaire), `getDemoClient`/`DEMO_USER_ID` (`@/lib/supabase/demo`).
- Produces : route `/app/p/[projectId]/bien/[propertyId]` fonctionnelle ; `PropertyDrawer` reçoit désormais une prop `projectId: string` (breaking change interne, les deux appelants sont mis à jour dans cette même tâche).

- [ ] **Step 1: Écrire la page**

Fichier `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx` :

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { SectionVerdict } from "@/components/app/fiche/SectionVerdict";
import { SectionBien } from "@/components/app/fiche/SectionBien";
import { SectionMarche } from "@/components/app/fiche/SectionMarche";
import { SectionFinancement } from "@/components/app/fiche/SectionFinancement";
import { SectionCalculs } from "@/components/app/fiche/SectionCalculs";
import { SectionFiscalite } from "@/components/app/fiche/SectionFiscalite";
import { SectionScenario } from "@/components/app/fiche/SectionScenario";
import { SectionCharges } from "@/components/app/fiche/SectionCharges";
import { SectionHumain } from "@/components/app/fiche/SectionHumain";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; propertyId: string }>;
}) {
  const { projectId, propertyId } = await params;
  const supabase = getDemoClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("project_id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (!property) notFound();

  const { data: scenario } = await supabase
    .from("property_scenarios")
    .select("*")
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (!scenario) notFound();

  const [contactRes, notesRes, photosRes, documentsRes] = await Promise.all([
    property.contact_id
      ? supabase
          .from("contacts")
          .select("*")
          .eq("id", property.contact_id)
          .eq("user_id", DEMO_USER_ID)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("property_notes")
      .select("id, kind, body, created_at")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("property_photos")
      .select("id, storage_path, caption, sort_order")
      .eq("property_id", propertyId)
      .order("sort_order"),
    supabase.from("property_documents").select("id, storage_path, filename, doc_type").eq("property_id", propertyId),
  ]);

  const contact = contactRes.data ?? null;
  const notes = notesRes.data ?? [];
  const photos = photosRes.data ?? [];
  const documents = documentsRes.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href={`/app/p/${projectId}`} className="text-sm text-muted transition-colors hover:text-text">
        ← Retour au projet
      </Link>
      <h1 className="mt-3 font-sans text-2xl font-semibold text-text">
        {property.address ?? "Adresse non renseignée"}
      </h1>
      <p className="text-sm text-muted">{property.city ?? "—"}</p>

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

      <p className="mt-8 border-t border-border pt-4 text-xs text-faint">
        Estio est un outil d&apos;aide à la décision, pas un conseil en investissement réglementé. Vérifie toujours
        les chiffres importants auprès d&apos;un professionnel avant de t&apos;engager.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Activer le bouton dans `PropertyDrawer`**

Dans `src/components/app/PropertyDrawer.tsx`, ajouter l'import de `Link` en haut du fichier :

```tsx
import Link from "next/link";
```

Ajouter `projectId` à la signature des props (juste après `property: PipelineProperty;` dans le type inline) :

```tsx
  property,
  projectId,
  onClose,
  onStatusChange,
  onAddNote,
}: {
  property: PipelineProperty;
  projectId: string;
  onClose: () => void;
```

Remplacer le bouton désactivé (lignes 124-131 actuelles) :

```tsx
        <button
          type="button"
          disabled
          title="Arrive au Plan 5 (Fiche complète)"
          className="mt-6 w-full rounded-full border border-border py-2.5 text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Analyse complète →
        </button>
```

par :

```tsx
        <Link
          href={`/app/p/${projectId}/bien/${property.id}`}
          className="mt-6 block w-full rounded-full border border-border py-2.5 text-center text-sm font-medium text-text transition-colors hover:border-brand"
        >
          Analyse complète →
        </Link>
```

- [ ] **Step 4: Passer `projectId` depuis `PipelineBoard`**

Dans `src/components/app/PipelineBoard.tsx`, la balise `<PropertyDrawer` (dans le `return`, section drawer) :

```tsx
        <PropertyDrawer
          property={selectedProperty}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
```

devient :

```tsx
        <PropertyDrawer
          property={selectedProperty}
          projectId={projectId}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
```

- [ ] **Step 5: Passer `projectId` depuis `PropertyTable`**

Dans `src/components/app/PropertyTable.tsx`, même changement sur la balise `<PropertyDrawer` :

```tsx
      {selectedProperty && (
        <PropertyDrawer
          property={selectedProperty}
          projectId={projectId}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}
```

- [ ] **Step 6: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune erreur (le typage `projectId: string` requis sur `PropertyDrawer` est bien satisfait par les deux appelants).

- [ ] **Step 7: Commit**

```bash
git add "src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx" src/components/app/PropertyDrawer.tsx src/components/app/PipelineBoard.tsx src/components/app/PropertyTable.tsx
git commit -m "feat(fiche): route bien/[propertyId] + active le bouton Analyse complète du drawer"
```

---

### Task 14: Vérification finale (build + lint + QA manuelle) et mise à jour des repères techniques

**Files:**
- Modify: `PROGRESS.md` (section « Repères techniques »)

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: repo vert (`build`/`lint`), documentation à jour pour la reprise de session suivante (Plan 5b).

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: build réussi, aucune erreur TypeScript/Next.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: aucune erreur (warnings existants préexistants tolérés, ne pas en introduire de nouveaux).

- [ ] **Step 3: QA manuelle**

Run: `npm run dev`, ouvrir `/app/p/<projectId>` (vue Pipeline), cliquer une carte pour ouvrir le drawer.

Vérifier :
- Le bouton « Analyse complète → » n'est plus grisé et mène vers `/app/p/<projectId>/bien/<propertyId>`.
- La page affiche l'adresse en titre, un lien « ← Retour au projet » fonctionnel, et les 9 sections dans l'ordre ①→⑨.
- Section ① : badge verdict cohérent avec celui vu dans le drawer/board, phrase de pré-verdict lisible.
- Section ③ : le bandeau « Données d'exemple » est visible ; recharger la page (F5) donne **les mêmes valeurs** pour ce bien (déterminisme du mock) ; ouvrir un **autre** bien affiche des valeurs **différentes**.
- Section ④ : basculer le toggle Annuel/Mensuel change bien le nombre de lignes et les totaux restent cohérents (la somme des lignes mensuelles d'une année correspond à la ligne annuelle).
- Section ⑤ : aucune valeur `NaN`/`Infinity`/vide inexpliquée — un bien sans loyer estimé affiche des tirets `—` plutôt que de planter.
- Section ⑥ : le régime actuellement choisi dans le scénario du bien est bien surligné et étiqueté « Actuel » dans le tableau.
- Section ⑦ : aucune interactivité (pas de curseur) — uniquement les valeurs actuelles, en lecture seule.
- Section ⑨ : les notes existantes s'affichent ; les zones photos/documents affichent le texte de placeholder avec le `title` au survol.
- Depuis la vue **Tableau** (`?view=tableau`), ouvrir un drawer et cliquer « Analyse complète → » mène à la même page.
- Retour arrière navigateur ramène bien sur la vue d'où on venait (Pipeline ou Tableau), avec le drawer fermé.

- [ ] **Step 4: Mettre à jour `PROGRESS.md` (Repères techniques)**

Dans `PROGRESS.md`, remplacer la ligne (actuellement au format ci-dessous, section « Repères techniques ») :

```
- **Pour le Plan 5 (Fiche complète)** : le bouton "Analyse complète →" du `PropertyDrawer` (`src/components/app/PropertyDrawer.tsx:124-131`) est désactivé avec un `title` explicite, pointant vers ce plan — l'activer et créer la route associée.
```

par :

```
- **Fiche complète (Plan 5a)** : `src/lib/calc/{financing,cashflow,tax,market-mock}.ts` (moteur pur, sans I/O — voir en-tête de chaque fichier pour les fonctions exportées) · `src/lib/property-detail-types.ts` (`PropertyDetail`, `PropertyRow`, `PropertyScenarioRow`, `ContactRow` — réutiliser tel quel) · `src/components/app/fiche/` (9 sections + `SectionCard`/`InfoTooltip` partagés) · route `src/app/(app)/app/p/[projectId]/bien/[propertyId]/page.tsx` · `PropertyDrawer` a maintenant une prop `projectId: string` obligatoire.
- **Pour le Plan 5b (Scénario en direct)** : `SectionScenario` (`src/components/app/fiche/SectionScenario.tsx`) est en lecture seule avec un commentaire explicite pointant vers ce plan — y ajouter les curseurs + recalcul live (réutiliser `src/lib/calc/*` tel quel) + une server action de sauvegarde du scénario.
- **Pour le Plan 5c (Photos/documents)** : `SectionHumain` (`src/components/app/fiche/SectionHumain.tsx`) affiche des placeholders explicites pour les photos/documents (`property_photos`/`property_documents`, buckets Storage déjà créés au Plan 1) — y ajouter l'upload.
```

- [ ] **Step 5: Commit**

```bash
git add PROGRESS.md
git commit -m "docs(progress): met à jour les repères techniques après le Plan 5a (fiche complète)"
```

---

## Résumé pour la reprise de session

Après ce plan : la fiche complète d'un bien est accessible depuis le drawer (board et tableau), avec les 9 sections rendues à partir de vraies données (N1 réel, N3 réel, marché en mock déterministe) et un moteur de calcul complet (financement, tous les calculs de rentabilité, comparateur fiscal). Reste **hors-scope** : interactivité du scénario (Plan 5b — curseurs, recalcul live, sauvegarde, comparaison de 2 configs), upload photos/documents (Plan 5c), vue Carte (Plan 6), comparer/arbitrage (Plan 7), flux d'ajout (Plan 8). Le pointeur de reprise après validation Vercel : **Plan 5b — Scénario en direct**.

