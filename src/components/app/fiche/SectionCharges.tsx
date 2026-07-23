import { formatEUR, formatPercent } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

export function SectionCharges({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  return (
    <SectionCard number="⑧" title="Charges & exploitation">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Charges copro / mois" value={formatEUR(property.monthly_copro_charges)} />
        <Field label="Taxe foncière / an" value={formatEUR(property.property_tax)} />
        <Field label="Frais de gestion" value={formatPercent(scenario.management_fees_pct, 1)} />
        <Field label="Vacance locative" value={formatPercent(scenario.vacancy_pct, 1)} />
        <Field label="Provision travaux" value={formatEUR(scenario.works_provision)} />
        <Field label="Assurance PNO" value={scenario.pno ? "Souscrite" : "Non souscrite"} />
        <Field label="Garantie loyers impayés (GLI)" value={scenario.gli ? "Souscrite" : "Non souscrite"} />
      </dl>
    </SectionCard>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
