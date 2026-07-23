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

  const monthlyPayment =
    scenario.loan_type === "in_fine"
      ? (costs.loanPrincipal * (scenario.interest_rate / 100)) / 12
      : computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);
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
          <dt className="text-xs text-faint">
            {scenario.loan_type === "in_fine" ? "Mensualité intérêts seuls (hors assurance)" : "Mensualité (hors assurance)"}
          </dt>
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
