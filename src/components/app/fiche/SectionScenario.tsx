import { formatPercent } from "@/lib/format";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

const LOAN_TYPE_LABELS: Record<PropertyScenarioRow["loan_type"], string> = {
  amortissable: "Amortissable",
  in_fine: "In fine",
};

const TAX_REGIME_LABELS: Record<PropertyScenarioRow["tax_regime"], string> = {
  nu_micro: "Location nue — micro-foncier",
  nu_reel: "Location nue — réel",
  lmnp_micro: "LMNP — micro-BIC",
  lmnp_reel: "LMNP — réel",
  sci_ir: "SCI à l'IR",
  sci_is: "SCI à l'IS",
};

const MARKET_SCENARIO_LABELS: Record<PropertyScenarioRow["market_scenario"], string> = {
  prudent: "Prudent",
  central: "Central",
  dynamique: "Dynamique",
};

/** Lecture seule dans ce plan — les curseurs et le recalcul live arrivent au Plan 5b. */
export function SectionScenario({ scenario }: { scenario: PropertyScenarioRow }) {
  return (
    <SectionCard number="⑦" title="Scénario">
      <p className="mb-4 text-xs text-faint">
        Valeurs actuelles du scénario. Les curseurs de simulation en direct arrivent au Plan 5b.
      </p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Apport" value={formatPercent(scenario.apport_pct, 0)} />
        <Field label="Taux d'intérêt" value={formatPercent(scenario.interest_rate, 2)} />
        <Field label="Durée" value={`${scenario.duration_years} ans`} />
        <Field label="Type de prêt" value={LOAN_TYPE_LABELS[scenario.loan_type]} />
        <Field label="Différé" value={scenario.deferral_months > 0 ? `${scenario.deferral_months} mois` : "Aucun"} />
        <Field label="Régime fiscal" value={TAX_REGIME_LABELS[scenario.tax_regime]} />
        <Field label="TMI" value={formatPercent(scenario.tmi_pct, 0)} />
        <Field label="Frais de gestion" value={formatPercent(scenario.management_fees_pct, 1)} />
        <Field label="Vacance locative" value={formatPercent(scenario.vacancy_pct, 1)} />
        <Field label="Scénario de marché" value={MARKET_SCENARIO_LABELS[scenario.market_scenario]} />
        <Field label="Horizon" value={`${scenario.horizon_years} ans`} />
        <Field label="GLI" value={scenario.gli ? "Oui" : "Non"} />
        <Field label="PNO" value={scenario.pno ? "Oui" : "Non"} />
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
