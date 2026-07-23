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
