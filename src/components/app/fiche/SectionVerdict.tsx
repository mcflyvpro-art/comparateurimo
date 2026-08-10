"use client";

import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { computeScoreSur100 } from "@/lib/calc/scoring";
import { formatEUR, formatPercent, formatPricePerM2 } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { VerdictBlock } from "@/components/ui/Verdict";
import { Stat, StatGrid, SourceTag } from "@/components/ui/Stat";
import { toneCashflow, toneRendementNet } from "@/lib/tone";
import { STATUS_COLUMNS } from "@/lib/pipeline-types";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const STATUS_LABELS = Object.fromEntries(
  STATUS_COLUMNS.map((c) => [c.key, c.label]),
) as Record<PropertyRow["status"], string>;

/**
 * Le verdict — la seule chose qu'on lit vraiment.
 *
 * Quatre chiffres, pas quinze. Ceux qui décident si l'on va plus loin :
 * combien ça coûte, combien ça coûte au mètre, ce que ça rapporte une fois
 * l'impôt payé, et ce que ça fait à la fin du mois.
 *
 * La décomposition en trois axes pondérés a disparu de cette vue : un
 * primo-investisseur n'a pas besoin de savoir que le rendement pèse 40 % du
 * score pour décider d'aller visiter. Elle reste disponible dans « L'argent ».
 */
export function SectionVerdict({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  const m = computeInvestmentMetrics(property, scenario);
  const { scoreSur100 } = computeScoreSur100({
    rendementNetNetPct: m.rendementNetNetPct,
    cashOnCashPct: m.cashOnCashPct,
    triPct: m.tri,
  });

  const cashflow = m.cashflowAfterTaxMonthly ?? null;

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-[13px] text-text-3">
          Étape : <span className="text-text-2">{STATUS_LABELS[property.status]}</span>
        </span>
        <SourceTag kind="calcule" />
      </div>

      <VerdictBlock score={scoreSur100} />

      <div className="mt-8 border-t border-line-soft pt-7">
        <StatGrid cols={4}>
          <Stat label="Prix affiché" value={formatEUR(property.asking_price)} size="lg" />
          <Stat
            term="prixM2"
            value={formatPricePerM2(property.asking_price, property.surface_carrez)}
            size="lg"
          />
          <Stat
            term="rendementApresImpot"
            value={formatPercent(m.rendementNetNetPct)}
            size="lg"
            tone={toneRendementNet(m.rendementNetNetPct)}
          />
          <Stat
            term="cashflowApresImpot"
            value={
              cashflow !== null
                ? `${cashflow >= 0 ? "+" : ""}${formatEUR(Math.round(cashflow))}`
                : "—"
            }
            size="lg"
            hint="par mois"
            tone={toneCashflow(cashflow)}
          />
        </StatGrid>
      </div>
    </Panel>
  );
}
