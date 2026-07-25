"use server";

import { DEMO_USER_ID, getDemoClient } from "@/lib/supabase/demo";
import type { PropertyScenarioRow } from "@/lib/property-detail-types";

export type ScenarioPatch = Partial<
  Pick<
    PropertyScenarioRow,
    | "apport_pct"
    | "interest_rate"
    | "duration_years"
    | "loan_type"
    | "insurance_rate"
    | "insurance_on_initial"
    | "notary_fees_pct"
    | "dossier_fees"
    | "guarantee_fees"
    | "broker_fees"
    | "deferral_months"
    | "tax_regime"
    | "tmi_pct"
    | "management_fees_pct"
    | "gli"
    | "pno"
    | "vacancy_pct"
    | "works_provision"
    | "horizon_years"
    | "market_scenario"
  >
>;

/** Bornes de clamp défensif — mêmes valeurs que les curseurs côté UI
 *  (`SectionScenario`). Un patch hors bornes est clampé silencieusement,
 *  jamais rejeté (un slider qui pousse une valeur limite ne doit jamais
 *  faire échouer la sauvegarde). */
const CLAMP_RANGES: Partial<Record<keyof ScenarioPatch, [number, number]>> = {
  apport_pct: [0, 100],
  interest_rate: [0, 8],
  duration_years: [5, 30],
  insurance_rate: [0, 1.5],
  notary_fees_pct: [2, 10],
  dossier_fees: [0, Number.MAX_SAFE_INTEGER],
  guarantee_fees: [0, Number.MAX_SAFE_INTEGER],
  broker_fees: [0, Number.MAX_SAFE_INTEGER],
  deferral_months: [0, 24],
  tmi_pct: [0, 45],
  management_fees_pct: [0, 12],
  vacancy_pct: [0, 20],
  works_provision: [0, Number.MAX_SAFE_INTEGER],
  horizon_years: [5, 30],
};

function clampPatch(patch: ScenarioPatch): ScenarioPatch {
  const clamped: Record<string, unknown> = { ...patch };
  for (const [key, range] of Object.entries(CLAMP_RANGES)) {
    if (!range) continue;
    const value = clamped[key];
    if (typeof value === "number") {
      const [min, max] = range;
      clamped[key] = Math.min(max, Math.max(min, value));
    }
  }
  return clamped as ScenarioPatch;
}

/** Sauvegarde partielle du scénario (N3) d'un bien — appelée en debounce
 *  depuis le panneau de curseurs (⑦, Plan 5b). Filtre `property_id` +
 *  `user_id`, défense en profondeur (RLS contournée par le client démo —
 *  même précaution que Plan 5a). */
export async function updatePropertyScenario(propertyId: string, patch: ScenarioPatch): Promise<void> {
  const supabase = getDemoClient();
  const clamped = clampPatch(patch);

  const { error } = await supabase
    .from("property_scenarios")
    .update(clamped)
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID);

  if (error) throw new Error(error.message);
}
