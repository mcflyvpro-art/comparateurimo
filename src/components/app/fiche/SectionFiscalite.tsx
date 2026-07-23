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
  // Année 1 approximée : intérêts non recalculés ici (déjà fait dans
  // SectionCalculs) — ce tableau compare les régimes entre eux à charges/
  // loyer égaux, l'exactitude de l'intérêt exact n'affecte pas le classement
  // relatif de façon significative pour cette vue comparative.
  const annualInterestEstimate = (property.asking_price ?? 0) * (1 - scenario.apport_pct / 100) * (scenario.interest_rate / 100);
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
