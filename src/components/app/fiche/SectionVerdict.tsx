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
