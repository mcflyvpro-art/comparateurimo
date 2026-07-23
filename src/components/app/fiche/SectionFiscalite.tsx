import { computeFinancingCosts } from "@/lib/calc/financing";
import { compareTaxRegimes } from "@/lib/calc/tax";
import { formatEUR } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export function SectionFiscalite({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  // Année 1 approximée : la base de capital emprunté est désormais cohérente
  // avec SectionCalculs/SectionFinancement (computeFinancingCosts — travaux
  // et frais de financement inclus). Seule approximation restante : l'intérêt
  // est calculé sur le capital initial plutôt que sur un vrai tableau
  // d'amortissement année par année, simplification acceptable et documentée
  // pour cette vue comparative entre régimes à charges/loyer égaux.
  const costs = computeFinancingCosts({
    askingPrice: property.asking_price ?? 0,
    worksEstimate: property.works_estimate,
    apportPct: scenario.apport_pct,
    notaryFeesPct: scenario.notary_fees_pct,
    dossierFees: scenario.dossier_fees,
    guaranteeFees: scenario.guarantee_fees,
    brokerFees: scenario.broker_fees,
  });
  const annualInterestEstimate = costs.loanPrincipal * (scenario.interest_rate / 100);
  const results = compareTaxRegimes({
    annualRent: (property.estimated_rent ?? 0) * 12,
    annualCharges: property.monthly_copro_charges * 12 + property.property_tax,
    annualInterest: annualInterestEstimate,
    annualAmortissement: (property.asking_price ?? 0) * 0.025,
    tmiPct: scenario.tmi_pct,
  });

  return (
    <SectionCard number="⑥" title="Fiscalité — comparateur des régimes">
      <p className="mb-4 text-xs text-faint">
        Les 6 régimes calculés à loyer/charges égaux, du plus favorable au moins favorable. Le régime actuellement
        choisi pour ce bien est surligné.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-faint">
              <th className="px-3 py-2 font-normal">Régime</th>
              <th className="px-3 py-2 font-normal">Revenu imposable</th>
              <th className="px-3 py-2 font-normal">Impôt annuel estimé</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.regime}
                className={`border-b border-border text-text ${
                  r.regime === scenario.tax_regime ? "bg-brand/10" : ""
                }`}
              >
                <td className="px-3 py-2 font-medium">
                  {r.label}
                  {r.regime === scenario.tax_regime && (
                    <span className="ml-2 rounded-full border border-brand px-2 py-0.5 text-[10px] text-brand">
                      Actuel
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{formatEUR(Math.round(r.taxableIncome))}</td>
                <td className="px-3 py-2">{formatEUR(Math.round(r.annualTax))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
