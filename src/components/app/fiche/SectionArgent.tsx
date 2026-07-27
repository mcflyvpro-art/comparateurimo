"use client";

import { computeInvestmentMetrics } from "@/lib/calc/metrics";
import {
  computeFinancingCosts,
  computeInFineMonthlyPayment,
  computeMonthlyPayment,
} from "@/lib/calc/financing";
import { compareTaxRegimes, REGIME_LABELS } from "@/lib/calc/tax";
import { formatEUR, formatPercent } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { Disclosure } from "@/components/ui/Disclosure";
import { SourceTag } from "@/components/ui/Stat";
import { BlocFinancement } from "@/components/app/fiche/SectionFinancement";
import { BlocCalculs } from "@/components/app/fiche/SectionCalculs";
import { BlocFiscalite } from "@/components/app/fiche/SectionFiscalite";
import { BlocCharges } from "@/components/app/fiche/SectionCharges";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

/**
 * L'ARGENT — un seul panneau au lieu de quatre.
 *
 * En v1, financement, calculs, fiscalité et charges étaient quatre panneaux
 * plein écran empilés : la page faisait cinq écrans de haut et l'on perdait le
 * fil dès le deuxième. Ici, quatre replis dans un panneau unique.
 *
 * Chaque repli porte un RÉSUMÉ visible sans l'ouvrir — la mensualité, le
 * rendement, le régime retenu, le total des charges. C'est ce qui distingue un
 * contenu rangé d'un contenu caché : on sait ce qu'il y a derrière la porte
 * avant de l'ouvrir, donc on ne l'ouvre que si on en a besoin.
 */
export function SectionArgent({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  const m = computeInvestmentMetrics(property, scenario);

  const costs = computeFinancingCosts({
    askingPrice: property.asking_price ?? 0,
    worksEstimate: property.works_estimate,
    apportPct: scenario.apport_pct,
    notaryFeesPct: scenario.notary_fees_pct,
    dossierFees: scenario.dossier_fees,
    guaranteeFees: scenario.guarantee_fees,
    brokerFees: scenario.broker_fees,
  });
  const months = scenario.duration_years * 12;
  const mensualite =
    scenario.loan_type === "in_fine"
      ? computeInFineMonthlyPayment(costs.loanPrincipal, scenario.interest_rate)
      : computeMonthlyPayment(costs.loanPrincipal, scenario.interest_rate, months);

  const regimes = compareTaxRegimes({
    annualRent: (property.estimated_rent ?? 0) * 12,
    annualCharges: property.monthly_copro_charges * 12 + property.property_tax,
    annualInterest: costs.loanPrincipal * (scenario.interest_rate / 100),
    annualAmortissement: (property.asking_price ?? 0) * 0.025,
    tmiPct: scenario.tmi_pct,
  });
  const current = regimes.find((r) => r.regime === scenario.tax_regime);
  const economie = current ? Math.round(current.annualTax - regimes[0].annualTax) : 0;

  const chargesAnnuelles =
    property.monthly_copro_charges * 12 + property.property_tax + scenario.works_provision;

  return (
    <Panel>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="t-head text-text">L&apos;argent</h2>
        <SourceTag kind="calcule" />
      </div>

      <Disclosure
        title="Financement"
        summary={`${formatEUR(Math.round(mensualite))} / mois`}
      >
        <BlocFinancement property={property} scenario={scenario} />
      </Disclosure>

      <Disclosure
        title="Détail des rendements"
        summary={`${formatPercent(m.rendementNetNetPct)} après impôt`}
      >
        <BlocCalculs property={property} scenario={scenario} />
      </Disclosure>

      <Disclosure
        title="Fiscalité"
        summary={
          economie > 0
            ? `${formatEUR(economie)} / an à gagner`
            : REGIME_LABELS[scenario.tax_regime]
        }
      >
        <BlocFiscalite property={property} scenario={scenario} />
      </Disclosure>

      <Disclosure
        title="Charges et exploitation"
        summary={`${formatEUR(chargesAnnuelles)} / an`}
      >
        <BlocCharges property={property} scenario={scenario} />
      </Disclosure>
    </Panel>
  );
}
