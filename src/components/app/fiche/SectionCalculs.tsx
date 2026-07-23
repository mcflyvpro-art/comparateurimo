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
  // Prêt in fine : mensualité = intérêts seuls sur le capital (jamais la
  // formule amortissable classique, qui suppose un remboursement de capital
  // progressif inexistant ici) — même correction que SectionFinancement (Task 9).
  const monthlyPayment =
    scenario.loan_type === "in_fine"
      ? (costs.loanPrincipal * (scenario.interest_rate / 100)) / 12
      : computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);
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
