"use client";

import { useState } from "react";
import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import { computeScoreSur100 } from "@/lib/calc/scoring";
import { formatEUR, formatPercent } from "@/lib/format";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/Feedback";
import {
  toneCashflow,
  toneEffort,
  toneRendementBrut,
  toneRendementNet,
} from "@/lib/tone";
import { verdictFromScore } from "@/lib/verdict";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

/**
 * Les calculs — contenu seul.
 *
 * Séparation nette entre ce dont un primo-investisseur a besoin pour décider
 * (cinq chiffres) et ce qui relève de l'analyse avancée (TRI, rendement de
 * l'apport, seuil de rentabilité, capital remboursé, plus-value).
 *
 * Les indicateurs avancés ne sont pas supprimés — ils sont repliés et tous
 * définis. Un débutant n'est pas gêné, un investisseur aguerri les trouve en un
 * clic.
 */
export function BlocCalculs({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  const [showExpert, setShowExpert] = useState(false);
  const m = computeInvestmentMetrics(property, scenario);
  const breakdown = computeScoreSur100({
    rendementNetNetPct: m.rendementNetNetPct,
    cashOnCashPct: m.cashOnCashPct,
    triPct: m.tri,
  });

  return (
    <div>
      <StatGrid cols={3}>
        <Stat
          term="rendementBrut"
          value={formatPercent(m.rendementBrutPct)}
          tone={toneRendementBrut(m.rendementBrutPct)}
        />
        <Stat
          term="rendementNet"
          value={formatPercent(m.rendementNetPct)}
          tone={toneRendementNet(m.rendementNetPct)}
        />
        <Stat
          term="rendementApresImpot"
          value={formatPercent(m.rendementNetNetPct)}
          tone={toneRendementNet(m.rendementNetNetPct)}
        />
        <Stat
          term="cashflow"
          value={formatEUR(m.cashflowBeforeTaxMonthly ?? null)}
          tone={toneCashflow(m.cashflowBeforeTaxMonthly)}
          hint="par mois, avant impôt"
        />
        <Stat
          term="cashflowApresImpot"
          value={formatEUR(m.cashflowAfterTaxMonthly ?? null)}
          tone={toneCashflow(m.cashflowAfterTaxMonthly)}
          hint="par mois"
        />
        <Stat
          term="effortEpargne"
          value={formatEUR(m.effortEpargne ?? null)}
          tone={toneEffort(m.effortEpargne)}
          hint="par mois, de votre poche"
        />
      </StatGrid>

      <div className="mt-7">
        <Button
          variant="quiet"
          size="sm"
          onClick={() => setShowExpert((v) => !v)}
          className="-ml-3"
        >
          {showExpert ? "Masquer" : "Afficher"} les indicateurs avancés
        </Button>

        {showExpert && (
          <div className="mt-5">
            <StatGrid cols={3}>
              <Stat
                term="tri"
                value={formatPercent(m.tri)}
                hint={`sur ${scenario.horizon_years} ans`}
              />
              <Stat term="cashOnCash" value={formatPercent(m.cashOnCashPct)} />
              <Stat
                term="pointMort"
                value={m.pointMortPct !== null ? formatPercent(m.pointMortPct) : "—"}
              />
              <Stat term="capitalRembourse" value={formatEUR(m.enrichissementNet)} />
              <Stat
                term="plusValue"
                value={formatEUR(Math.round(m.plusValueNette))}
                hint={`hypothèse ${scenario.market_scenario}`}
              />
            </StatGrid>

            <div className="mt-7 border-t border-hairline pt-6">
              <h4 className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-text-2">
                Comment le verdict est calculé
                <InfoTip
                  title="Composition du score"
                  text="Trois axes pondérés, recalculés à chaque mouvement de curseur. La formule est fixe et affichée : aucune boîte noire. Les pondérations personnalisables arrivent avec l'arbitrage entre finalistes."
                />
              </h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: "Rendement après impôt", weight: 40, score: breakdown.rendementScore },
                  { label: "Trésorerie", weight: 35, score: breakdown.cashflowScore },
                  { label: "Long terme", weight: 25, score: breakdown.longTermeScore },
                ].map((axis) => (
                  <li key={axis.label} className="flex items-center gap-4">
                    <span className="w-44 shrink-0 text-[12.5px] text-text-3">
                      {axis.label}
                      <span className="num ml-1.5 text-[11px] text-text-4">
                        {axis.weight} %
                      </span>
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-600">
                      <span
                        className="block h-full rounded-full transition-[width] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{
                          width: `${axis.score.toFixed(1)}%`,
                          background: verdictFromScore(axis.score).color,
                        }}
                      />
                    </span>
                    <span
                      className="num w-9 shrink-0 text-right text-[12.5px]"
                      style={{ color: verdictFromScore(axis.score).color }}
                    >
                      {axis.score}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
