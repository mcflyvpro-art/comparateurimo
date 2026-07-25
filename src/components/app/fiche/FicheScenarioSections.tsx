"use client";

import { useState } from "react";
import { SectionVerdict } from "@/components/app/fiche/SectionVerdict";
import { SectionBien } from "@/components/app/fiche/SectionBien";
import { SectionMarche } from "@/components/app/fiche/SectionMarche";
import { SectionFinancement } from "@/components/app/fiche/SectionFinancement";
import { SectionCalculs } from "@/components/app/fiche/SectionCalculs";
import { SectionFiscalite } from "@/components/app/fiche/SectionFiscalite";
import { SectionScenario } from "@/components/app/fiche/SectionScenario";
import { SectionCharges } from "@/components/app/fiche/SectionCharges";
import { useDebouncedScenarioSave, type SaveStatus } from "@/lib/hooks/use-debounced-scenario-save";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Enregistrement…",
  saved: "Enregistré",
  error: "Échec de l'enregistrement, réessaie",
};

/**
 * Regroupe ①②③④⑤⑥⑦⑧ sous un seul point de bascule client. ② et ③ ne
 * dépendent pas du scénario (inchangées depuis le Plan 5a) mais restent ici
 * pour préserver l'ordre visuel de la fiche — ①④⑤⑥⑦⑧ consomment le state
 * `scenario` en cours d'édition, recalculé à chaque changement de curseur
 * dans ⑦ (Plan 5b). ⑨ (`SectionHumain`) reste en dehors, rendue par
 * `page.tsx` directement (Plan 5c, hors scope de ce plan).
 */
export function FicheScenarioSections({
  property,
  scenario: initialScenario,
  propertyId,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
  propertyId: string;
}) {
  const [scenario, setScenario] = useState(initialScenario);
  const { status, scheduleSave } = useDebouncedScenarioSave(propertyId);

  const handleScenarioChange = (patch: Partial<PropertyScenarioRow>) => {
    setScenario((current) => ({ ...current, ...patch }));
    scheduleSave(patch);
  };

  return (
    <>
      <SectionVerdict property={property} scenario={scenario} />
      <SectionBien property={property} />
      <SectionMarche property={property} />
      <SectionFinancement property={property} scenario={scenario} />
      <SectionCalculs property={property} scenario={scenario} />
      <SectionFiscalite property={property} scenario={scenario} />
      <div className="relative">
        {status !== "idle" && (
          <span
            className={`absolute right-6 top-6 text-xs ${status === "error" ? "text-score-low" : "text-faint"}`}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
        <SectionScenario scenario={scenario} onChange={handleScenarioChange} />
      </div>
      <SectionCharges property={property} scenario={scenario} />
    </>
  );
}
