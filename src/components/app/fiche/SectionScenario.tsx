"use client";

import {
  CheckboxControl,
  NumberControl,
  SelectControl,
  SliderControl,
} from "@/components/app/fiche/scenario-controls";
import { SectionCard } from "@/components/app/fiche/SectionCard";
import { REGIME_LABELS } from "@/lib/calc/tax";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

const LOAN_TYPE_OPTIONS: { value: PropertyScenarioRow["loan_type"]; label: string }[] = [
  { value: "amortissable", label: "Amortissable" },
  { value: "in_fine", label: "In fine" },
];

const TAX_REGIME_OPTIONS: { value: PropertyScenarioRow["tax_regime"]; label: string }[] = (
  Object.keys(REGIME_LABELS) as PropertyScenarioRow["tax_regime"][]
).map((regime) => ({ value: regime, label: REGIME_LABELS[regime] }));

const MARKET_SCENARIO_OPTIONS: { value: PropertyScenarioRow["market_scenario"]; label: string }[] = [
  { value: "prudent", label: "Prudent" },
  { value: "central", label: "Central" },
  { value: "dynamique", label: "Dynamique" },
];

const TMI_OPTIONS: { value: number; label: string }[] = [0, 11, 30, 41, 45].map((v) => ({
  value: v,
  label: `${v} %`,
}));

/** Panneau de curseurs/menus/cases du scénario — chaque changement appelle
 *  `onChange` avec un patch partiel, qui déclenche le recalcul instantané
 *  des sections ①④⑤⑥⑧ (state porté par `FicheScenarioSections`) et la
 *  sauvegarde débouncée (Plan 5b). */
export function SectionScenario({
  scenario,
  onChange,
}: {
  scenario: PropertyScenarioRow;
  onChange: (patch: Partial<PropertyScenarioRow>) => void;
}) {
  return (
    <SectionCard number="⑦" title="Scénario">
      <p className="mb-5 text-xs text-faint">
        Bouge les curseurs pour simuler d&apos;autres hypothèses — le verdict et tous les calculs se recalculent
        instantanément, et le scénario est sauvegardé automatiquement.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Financement</legend>
          <SliderControl
            label="Apport"
            value={scenario.apport_pct}
            min={0}
            max={100}
            step={1}
            unit=" %"
            onChange={(v) => onChange({ apport_pct: v })}
          />
          <SliderControl
            label="Taux d'intérêt"
            value={scenario.interest_rate}
            min={0}
            max={8}
            step={0.05}
            unit=" %"
            onChange={(v) => onChange({ interest_rate: v })}
          />
          <SliderControl
            label="Durée"
            value={scenario.duration_years}
            min={5}
            max={30}
            step={1}
            unit=" ans"
            onChange={(v) => onChange({ duration_years: v })}
          />
          <SelectControl
            label="Type de prêt"
            value={scenario.loan_type}
            options={LOAN_TYPE_OPTIONS}
            onChange={(v) => onChange({ loan_type: v })}
          />
          <SliderControl
            label="Différé"
            value={scenario.deferral_months}
            min={0}
            max={24}
            step={1}
            unit=" mois"
            onChange={(v) => onChange({ deferral_months: v })}
          />
          <SliderControl
            label="Taux d'assurance"
            value={scenario.insurance_rate}
            min={0}
            max={1.5}
            step={0.01}
            unit=" %"
            onChange={(v) => onChange({ insurance_rate: v })}
          />
          <CheckboxControl
            label="Assurance calculée sur le capital initial"
            checked={scenario.insurance_on_initial}
            onChange={(v) => onChange({ insurance_on_initial: v })}
          />
          <SliderControl
            label="Frais de notaire"
            value={scenario.notary_fees_pct}
            min={2}
            max={10}
            step={0.1}
            unit=" %"
            onChange={(v) => onChange({ notary_fees_pct: v })}
          />
          <NumberControl
            label="Frais de dossier (€)"
            value={scenario.dossier_fees}
            min={0}
            onChange={(v) => onChange({ dossier_fees: v })}
          />
          <NumberControl
            label="Frais de garantie (€)"
            value={scenario.guarantee_fees}
            min={0}
            onChange={(v) => onChange({ guarantee_fees: v })}
          />
          <NumberControl
            label="Frais de courtage (€)"
            value={scenario.broker_fees}
            min={0}
            onChange={(v) => onChange({ broker_fees: v })}
          />
        </fieldset>

        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Fiscalité</legend>
            <SelectControl
              label="Régime fiscal"
              value={scenario.tax_regime}
              options={TAX_REGIME_OPTIONS}
              onChange={(v) => onChange({ tax_regime: v })}
            />
            <SelectControl
              label="TMI"
              value={scenario.tmi_pct}
              options={TMI_OPTIONS}
              onChange={(v) => onChange({ tmi_pct: v })}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Charges &amp; exploitation</legend>
            <SliderControl
              label="Frais de gestion"
              value={scenario.management_fees_pct}
              min={0}
              max={12}
              step={0.5}
              unit=" %"
              onChange={(v) => onChange({ management_fees_pct: v })}
            />
            <SliderControl
              label="Vacance locative"
              value={scenario.vacancy_pct}
              min={0}
              max={20}
              step={0.5}
              unit=" %"
              onChange={(v) => onChange({ vacancy_pct: v })}
            />
            <NumberControl
              label="Provision travaux (€)"
              value={scenario.works_provision}
              min={0}
              onChange={(v) => onChange({ works_provision: v })}
            />
            <CheckboxControl
              label="Garantie loyers impayés (GLI)"
              checked={scenario.gli}
              onChange={(v) => onChange({ gli: v })}
            />
            <CheckboxControl
              label="Assurance PNO"
              checked={scenario.pno}
              onChange={(v) => onChange({ pno: v })}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-xs uppercase tracking-wide text-faint">Marché &amp; horizon</legend>
            <SelectControl
              label="Scénario de marché"
              value={scenario.market_scenario}
              options={MARKET_SCENARIO_OPTIONS}
              onChange={(v) => onChange({ market_scenario: v })}
            />
            <SliderControl
              label="Horizon"
              value={scenario.horizon_years}
              min={5}
              max={30}
              step={1}
              unit=" ans"
              onChange={(v) => onChange({ horizon_years: v })}
            />
          </fieldset>
        </div>
      </div>
    </SectionCard>
  );
}
