"use client";

import { useMemo, useState } from "react";
import {
  computeAmortizationSchedule,
  computeFinancingCosts,
  computeInFineMonthlyPayment,
  computeInFineSchedule,
  computeMonthlyPayment,
  groupAmortizationByYear,
} from "@/lib/calc/financing";
import { formatEUR } from "@/lib/format";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/Feedback";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

/**
 * Financement — contenu seul, destiné à vivre dans un repli de « L'argent ».
 *
 * Le profil du prêt reste visible : c'est le seul endroit où l'on comprend
 * d'un regard qu'on paie surtout des intérêts les premières années. Le tableau
 * de deux cent quarante lignes, lui, se déplie à la demande — personne ne le
 * lit en décidant s'il visite un appartement.
 */
export function BlocFinancement({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  const [showTable, setShowTable] = useState(false);
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
        : computeAmortizationSchedule(
            costs.loanPrincipal,
            scenario.interest_rate,
            months,
            scenario.deferral_months,
          ),
    [
      costs.loanPrincipal,
      scenario.interest_rate,
      scenario.loan_type,
      scenario.deferral_months,
      months,
    ],
  );

  const monthlyPayment =
    scenario.loan_type === "in_fine"
      ? computeInFineMonthlyPayment(costs.loanPrincipal, scenario.interest_rate)
      : computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);

  const insuranceBase = scenario.insurance_on_initial
    ? costs.loanPrincipal
    : monthlySchedule.length > 0
      ? monthlySchedule[0].remainingBalance
      : costs.loanPrincipal;
  const monthlyInsurance = (insuranceBase * (scenario.insurance_rate / 100)) / 12;

  const annualRows = useMemo(() => groupAmortizationByYear(monthlySchedule), [monthlySchedule]);
  const rows = granularity === "annuel" ? annualRows : monthlySchedule;

  const totalInterest = useMemo(
    () => monthlySchedule.reduce((sum, r) => sum + r.interest, 0),
    [monthlySchedule],
  );

  return (
    <div>
      <StatGrid cols={4}>
        <Stat label="Capital emprunté" value={formatEUR(costs.loanPrincipal)} />
        <Stat
          label="Mensualité"
          value={formatEUR(Math.round(monthlyPayment + monthlyInsurance))}
          hint="assurance comprise"
        />
        <Stat term="fraisNotaire" value={formatEUR(costs.totalFinancingCosts)} hint="et frais annexes" />
        <Stat
          label="Coût total des intérêts"
          value={formatEUR(Math.round(totalInterest))}
          hint={`sur ${scenario.duration_years} ans`}
        />
      </StatGrid>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <h4 className="flex items-center gap-1.5 text-[13px] font-medium text-text-2">
            Profil du remboursement
            <InfoTip
              title="Profil du remboursement"
              text="Chaque colonne est une année. La part sombre part en intérêts à la banque, la part claire devient votre capital. Sur un prêt classique, la part claire grandit avec le temps."
            />
          </h4>
          <span className="flex items-center gap-4">
            <Legend color="var(--risk-300)" label="Intérêts versés" />
            <Legend color="var(--good)" label="Capital constitué" />
          </span>
        </div>
        <AmortizationProfile rows={annualRows} />
      </div>

      <div className="mt-6">
        <Button
          variant="quiet"
          size="sm"
          onClick={() => setShowTable((v) => !v)}
          className="-ml-3"
        >
          {showTable ? "Masquer" : "Voir"} le tableau d&apos;amortissement
        </Button>

        {showTable && (
          <div className="focal-in mt-3">
            <div className="mb-2 flex justify-end gap-1">
              {(["annuel", "mensuel"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  className={`rounded-sm px-2 py-1 text-[12px] transition-colors ${
                    granularity === g ? "text-text" : "text-text-4 hover:text-text-2"
                  }`}
                >
                  {g === "annuel" ? "Par année" : "Par mois"}
                </button>
              ))}
            </div>

            <div className="max-h-80 overflow-auto rounded-md border border-hairline">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-hairline-2">
                    {[
                      granularity === "annuel" ? "Année" : "Mois",
                      "Échéance",
                      "Intérêts",
                      "Capital",
                      "Restant dû",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-3 py-2 text-[12px] font-normal text-text-3 ${i === 0 ? "text-left" : "text-right"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={"year" in row ? row.year : row.month}
                      className="border-b border-hairline last:border-0"
                    >
                      <td className="num px-3 py-1.5 text-left text-[12px] text-text-3">
                        {"year" in row ? row.year : row.month}
                      </td>
                      <td className="num px-3 py-1.5 text-right text-[12px] text-text">
                        {formatEUR(Math.round(row.payment))}
                      </td>
                      <td className="num px-3 py-1.5 text-right text-[12px] text-text-3">
                        {formatEUR(Math.round(row.interest))}
                      </td>
                      <td className="num px-3 py-1.5 text-right text-[12px] text-text">
                        {formatEUR(Math.round(row.principal))}
                      </td>
                      <td className="num px-3 py-1.5 text-right text-[12px] text-text-3">
                        {formatEUR(Math.round(row.remainingBalance))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-[1px]" style={{ background: color }} />
      <span className="text-[12px] text-text-3">{label}</span>
    </span>
  );
}

function AmortizationProfile({
  rows,
}: {
  rows: { year: number; payment: number; interest: number; principal: number }[];
}) {
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.payment)) || 1;

  return (
    <div className="flex h-24 items-end gap-[3px] rounded-md border border-hairline bg-sunken p-2.5">
      {rows.map((row) => {
        const h = ((row.payment / max) * 100).toFixed(2);
        const interestShare = row.payment > 0 ? (row.interest / row.payment) * 100 : 0;
        return (
          <div
            key={row.year}
            className="flex h-full flex-1 flex-col justify-end"
            title={`Année ${row.year} — intérêts ${formatEUR(Math.round(row.interest))}, capital ${formatEUR(Math.round(row.principal))}`}
          >
            <div
              className="flex w-full flex-col overflow-hidden rounded-[1px]"
              style={{ height: `${h}%` }}
            >
              <span
                style={{ height: `${interestShare.toFixed(2)}%`, background: "var(--risk-300)" }}
              />
              <span
                style={{
                  height: `${(100 - interestShare).toFixed(2)}%`,
                  background: "var(--good)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
