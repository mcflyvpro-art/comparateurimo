"use client";

import { computeFinancingCosts } from "@/lib/calc/financing";
import { compareTaxRegimes } from "@/lib/calc/tax";
import { formatEUR } from "@/lib/format";
import { cx } from "@/lib/cx";
import type { PropertyRow, PropertyScenarioRow } from "@/lib/property-detail-types";

/**
 * Fiscalité — contenu seul.
 *
 * L'intérêt n'est pas le tableau, c'est l'ÉCART. On dit donc d'abord, en une
 * phrase, ce que coûte le régime choisi par rapport au meilleur possible. Le
 * tableau vient après, pour ceux qui veulent vérifier.
 */
export function BlocFiscalite({
  property,
  scenario,
}: {
  property: PropertyRow;
  scenario: PropertyScenarioRow;
}) {
  // Année 1 approximée : intérêts calculés sur le capital initial plutôt que sur
  // un tableau année par année. Simplification sans effet sur la comparaison
  // entre régimes, qui se fait à charges et loyer identiques.
  const costs = computeFinancingCosts({
    askingPrice: property.asking_price ?? 0,
    worksEstimate: property.works_estimate,
    apportPct: scenario.apport_pct,
    notaryFeesPct: scenario.notary_fees_pct,
    dossierFees: scenario.dossier_fees,
    guaranteeFees: scenario.guarantee_fees,
    brokerFees: scenario.broker_fees,
  });

  const results = compareTaxRegimes({
    annualRent: (property.estimated_rent ?? 0) * 12,
    annualCharges: property.monthly_copro_charges * 12 + property.property_tax,
    annualInterest: costs.loanPrincipal * (scenario.interest_rate / 100),
    annualAmortissement: (property.asking_price ?? 0) * 0.025,
    tmiPct: scenario.tmi_pct,
  });

  const best = results[0];
  const current = results.find((r) => r.regime === scenario.tax_regime);
  const saving = current && best ? Math.round(current.annualTax - best.annualTax) : 0;

  return (
    <div>
      {saving > 0 && best ? (
        <p className="mb-6 text-[14px] leading-relaxed text-text">
          En passant en <strong className="font-medium">{best.label}</strong>, vous
          économiseriez{" "}
          <strong className="num font-medium" style={{ color: "var(--good)" }}>
            {formatEUR(saving)}
          </strong>{" "}
          d&apos;impôt par an avec ces hypothèses. Le régime se change dans le panneau de
          droite.
        </p>
      ) : (
        <p className="mb-6 text-[14px] leading-relaxed text-text">
          Le régime que vous avez retenu est déjà le plus favorable avec ces hypothèses.
        </p>
      )}

      <div className="overflow-hidden rounded-md border border-hairline">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-hairline-2 bg-sunken">
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-text-3">
                Régime
              </th>
              <th className="px-3 py-2.5 text-right text-[12px] font-normal text-text-3">
                Revenu imposable
              </th>
              <th className="px-3 py-2.5 text-right text-[12px] font-normal text-text-3">
                Impôt par an
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const isCurrent = r.regime === scenario.tax_regime;
              const isBest = i === 0;
              return (
                <tr
                  key={r.regime}
                  className={cx(
                    "border-b border-hairline last:border-0",
                    isCurrent && "bg-raised",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] text-text">{r.label}</span>
                      {isBest && (
                        <span
                          className="rounded-[2px] px-1.5 py-0.5 text-[11px]"
                          style={{ background: "var(--good-wash)", color: "var(--good)" }}
                        >
                          le plus avantageux
                        </span>
                      )}
                      {isCurrent && !isBest && (
                        <span className="rounded-[2px] bg-[var(--brand-wash)] px-1.5 py-0.5 text-[11px] text-brand">
                          votre choix
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="num px-3 py-2.5 text-right text-[13px] text-text-3">
                    {formatEUR(Math.round(r.taxableIncome))}
                  </td>
                  <td className="num px-3 py-2.5 text-right text-[13px] text-text">
                    {formatEUR(Math.round(r.annualTax))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-text-4">
        Les six régimes sont comparés à loyer et charges identiques, sur une année type,
        avec votre tranche d&apos;imposition. L&apos;amortissement en location meublée est
        approché à 2,5 % du prix par an.
      </p>
    </div>
  );
}
