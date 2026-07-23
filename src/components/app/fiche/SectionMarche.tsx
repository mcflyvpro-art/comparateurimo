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
