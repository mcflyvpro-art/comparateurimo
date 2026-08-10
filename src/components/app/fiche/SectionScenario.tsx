"use client";

import { Checkbox, NumberField, Select, Slider } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { Disclosure } from "@/components/ui/Disclosure";
import { GLOSSARY } from "@/lib/glossary";
import { REGIME_LABELS } from "@/lib/calc/tax";
import type { SaveStatus } from "@/lib/hooks/use-debounced-scenario-save";
import type { FicheMode } from "@/components/app/fiche/FicheShell";
import { cx } from "@/lib/cx";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

const LOAN_TYPE_OPTIONS: { value: PropertyScenarioRow["loan_type"]; label: string }[] = [
  { value: "amortissable", label: "Classique (amortissable)" },
  { value: "in_fine", label: "In fine" },
];

const TAX_REGIME_OPTIONS: { value: PropertyScenarioRow["tax_regime"]; label: string }[] = (
  Object.keys(REGIME_LABELS) as PropertyScenarioRow["tax_regime"][]
).map((regime) => ({ value: regime, label: REGIME_LABELS[regime] }));

const MARKET_SCENARIO_OPTIONS: {
  value: PropertyScenarioRow["market_scenario"];
  label: string;
}[] = [
  { value: "prudent", label: "Prudent — le marché stagne" },
  { value: "central", label: "Central — le marché suit l'inflation" },
  { value: "dynamique", label: "Dynamique — le marché progresse" },
];

const TMI_OPTIONS = [0, 11, 30, 41, 45].map((v) => ({ value: v, label: `${v} %` }));

const SAVE_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "enregistrement…",
  saved: "enregistré",
  error: "échec — réessayez",
};

/**
 * VOS HYPOTHÈSES — le panneau de réglage.
 *
 * En v1 : dix-neuf contrôles ouverts d'un coup dans une colonne de 23 rem.
 * Personne ne sait quoi faire d'un « taux d'assurance » ou d'un « différé »
 * quand il regarde son premier appartement.
 *
 * En v2 : trois curseurs. Ceux qui bougent réellement le verdict, et que tout
 * le monde comprend — combien je mets, à quel taux, sur combien de temps. Les
 * seize autres sont derrière un repli, présents et définis, jamais imposés.
 */
export function SectionScenario({
  scenario,
  onChange,
  saveStatus,
  mode,
}: {
  scenario: PropertyScenarioRow;
  onChange: (patch: Partial<PropertyScenarioRow>) => void;
  saveStatus: SaveStatus;
  mode: FicheMode;
}) {
  return (
    <Panel>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="t-head text-text">Vos hypothèses</h2>
        <SaveIndicator status={saveStatus} />
      </div>
      <p className="mb-6 text-[12.5px] leading-relaxed text-text-3">
        Bougez un curseur : le verdict et tous les chiffres se recalculent
        immédiatement, et vos réglages sont gardés.
      </p>

      <div className="flex flex-col gap-6">
        <Slider
          label={GLOSSARY.apport.label}
          info={GLOSSARY.apport.def}
          value={scenario.apport_pct}
          min={0}
          max={100}
          step={1}
          unit=" %"
          onChange={(v) => onChange({ apport_pct: v })}
        />
        <Slider
          label={GLOSSARY.taux.label}
          info={GLOSSARY.taux.def}
          value={scenario.interest_rate}
          min={0}
          max={8}
          step={0.05}
          unit=" %"
          onChange={(v) => onChange({ interest_rate: v })}
        />
        <Slider
          label={GLOSSARY.duree.label}
          info={GLOSSARY.duree.def}
          value={scenario.duration_years}
          min={5}
          max={30}
          step={1}
          unit=" ans"
          onChange={(v) => onChange({ duration_years: v })}
        />
      </div>

      <div className="mt-7">
        <Disclosure
          title="Réglages avancés"
          summary={mode === "complet" ? "16 réglages" : undefined}
        >
          <div className="flex flex-col gap-7">
            <Group legend="Crédit">
              <Select
                label="Type de prêt"
                value={scenario.loan_type}
                onChange={(e) =>
                  onChange({ loan_type: e.target.value as PropertyScenarioRow["loan_type"] })
                }
              >
                {LOAN_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Slider
                label={GLOSSARY.differe.label}
                info={GLOSSARY.differe.def}
                value={scenario.deferral_months}
                min={0}
                max={24}
                step={1}
                unit=" mois"
                onChange={(v) => onChange({ deferral_months: v })}
              />
              <Slider
                label={GLOSSARY.assuranceEmprunteur.label}
                info={GLOSSARY.assuranceEmprunteur.def}
                value={scenario.insurance_rate}
                min={0}
                max={1.5}
                step={0.01}
                unit=" %"
                onChange={(v) => onChange({ insurance_rate: v })}
              />
              <Checkbox
                label="Assurance calculée sur le capital initial"
                checked={scenario.insurance_on_initial}
                onChange={(v) => onChange({ insurance_on_initial: v })}
              />
              <Slider
                label={GLOSSARY.fraisNotaire.label}
                info={GLOSSARY.fraisNotaire.def}
                value={scenario.notary_fees_pct}
                min={2}
                max={10}
                step={0.1}
                unit=" %"
                onChange={(v) => onChange({ notary_fees_pct: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Frais de dossier"
                  value={scenario.dossier_fees}
                  suffix="€"
                  onChange={(v) => onChange({ dossier_fees: v })}
                />
                <NumberField
                  label="Frais de garantie"
                  value={scenario.guarantee_fees}
                  suffix="€"
                  onChange={(v) => onChange({ guarantee_fees: v })}
                />
              </div>
              <NumberField
                label="Frais de courtage"
                value={scenario.broker_fees}
                suffix="€"
                onChange={(v) => onChange({ broker_fees: v })}
              />
            </Group>

            <Group legend="Impôts">
              <Select
                label="Régime fiscal"
                value={scenario.tax_regime}
                onChange={(e) =>
                  onChange({
                    tax_regime: e.target.value as PropertyScenarioRow["tax_regime"],
                  })
                }
              >
                {TAX_REGIME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Select
                label={GLOSSARY.tmi.label}
                value={String(scenario.tmi_pct)}
                onChange={(e) => onChange({ tmi_pct: Number(e.target.value) })}
              >
                {TMI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Group>

            <Group legend="Exploitation">
              <Slider
                label={GLOSSARY.fraisGestion.label}
                info={GLOSSARY.fraisGestion.def}
                value={scenario.management_fees_pct}
                min={0}
                max={12}
                step={0.5}
                unit=" %"
                onChange={(v) => onChange({ management_fees_pct: v })}
              />
              <Slider
                label={GLOSSARY.vacanceLocative.label}
                info={GLOSSARY.vacanceLocative.def}
                value={scenario.vacancy_pct}
                min={0}
                max={20}
                step={0.5}
                unit=" %"
                onChange={(v) => onChange({ vacancy_pct: v })}
              />
              <NumberField
                label={GLOSSARY.provisionTravaux.label}
                value={scenario.works_provision}
                suffix="€"
                onChange={(v) => onChange({ works_provision: v })}
              />
              <Checkbox
                label={GLOSSARY.gli.label}
                checked={scenario.gli}
                onChange={(v) => onChange({ gli: v })}
              />
              <Checkbox
                label={GLOSSARY.pno.label}
                checked={scenario.pno}
                onChange={(v) => onChange({ pno: v })}
              />
            </Group>

            <Group legend="Revente">
              <Select
                label="Hypothèse de marché"
                value={scenario.market_scenario}
                onChange={(e) =>
                  onChange({
                    market_scenario: e.target
                      .value as PropertyScenarioRow["market_scenario"],
                  })
                }
              >
                {MARKET_SCENARIO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Slider
                label="Horizon de revente"
                value={scenario.horizon_years}
                min={5}
                max={30}
                step={1}
                unit=" ans"
                onChange={(v) => onChange({ horizon_years: v })}
              />
            </Group>
          </div>
        </Disclosure>
      </div>
    </Panel>
  );
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-4 flex w-full items-center gap-3">
        <span className="text-[12px] font-medium text-text-3">{legend}</span>
        <span className="h-px flex-1 bg-line-soft" aria-hidden />
      </legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <span
      className={cx(
        "shrink-0 text-[11.5px]",
        status === "error" ? "text-risk" : "text-text-4",
      )}
    >
      {SAVE_LABEL[status]}
    </span>
  );
}
