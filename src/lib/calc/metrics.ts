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
