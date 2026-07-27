import { formatEUR, formatPercent } from "@/lib/format";
import { Field } from "@/components/ui/Stat";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

/**
 * Charges et exploitation — contenu seul.
 *
 * Sept lignes, en liste plutôt qu'en grille : ce sont des paramètres qu'on
 * vérifie un par un, pas des chiffres qu'on compare entre eux.
 */
export function BlocCharges({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  return (
    <dl>
      <Field
        label="Charges de copropriété"
        value={`${formatEUR(property.monthly_copro_charges)} / mois`}
      />
      <Field label="Taxe foncière" value={`${formatEUR(property.property_tax)} / an`} />
      <Field
        term="fraisGestion"
        value={formatPercent(scenario.management_fees_pct, 1)}
      />
      <Field term="vacanceLocative" value={formatPercent(scenario.vacancy_pct, 1)} />
      <Field term="provisionTravaux" value={formatEUR(scenario.works_provision)} />
      <Field term="pno" value={scenario.pno ? "Souscrite" : "Non souscrite"} />
      <Field term="gli" value={scenario.gli ? "Souscrite" : "Non souscrite"} />
    </dl>
  );
}
