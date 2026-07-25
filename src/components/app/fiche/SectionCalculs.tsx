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
