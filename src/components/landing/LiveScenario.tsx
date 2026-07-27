"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/Field";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { VerdictBlock } from "@/components/ui/Verdict";
import { Panel, Rule } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Feedback";
import { GLOSSARY } from "@/lib/glossary";
import { formatEUR, formatPercent } from "@/lib/format";

/**
 * LE SCÉNARIO EN DIRECT — la démonstration jouable, sur la page d'accueil.
 *
 * Pas une capture d'écran, pas une vidéo : les curseurs marchent vraiment, et le
 * verdict chauffe sous les doigts. C'est le geste qui distingue Estio des
 * simulateurs du marché — eux calculent une fois et figent un résultat.
 *
 * Le calcul ci-dessous est volontairement simplifié et affiché comme tel : dans
 * l'outil, c'est le moteur déterministe complet (fiscalité réelle, amortissement,
 * TRI) qui produit ces chiffres. Ici, l'exactitude au centime importe moins que
 * la sensation d'un instrument qui répond.
 */

const BIEN = {
  label: "T3 · Lyon 3ᵉ · Guillotière",
  prix: 245_000,
  surface: 68,
  loyerMensuel: 890,
  chargesCoproAnnuelles: 1_320,
  taxeFonciere: 940,
};

const FRAIS_NOTAIRE = 0.08;
const GESTION = 0.07;
const VACANCE = 0.05;

function mensualite(capital: number, tauxPct: number, annees: number): number {
  const r = tauxPct / 100 / 12;
  const n = annees * 12;
  if (r === 0) return capital / n;
  return (capital * r) / (1 - Math.pow(1 + r, -n));
}

export function LiveScenario() {
  const [apport, setApport] = useState(15);
  const [taux, setTaux] = useState(3.4);
  const [duree, setDuree] = useState(20);

  const r = useMemo(() => {
    const coutTotal = BIEN.prix * (1 + FRAIS_NOTAIRE);
    const apportEuros = coutTotal * (apport / 100);
    const capital = coutTotal - apportEuros;

    const echeance = mensualite(capital, taux, duree);

    const loyerEffectifAnnuel = BIEN.loyerMensuel * 12 * (1 - VACANCE);
    const chargesAnnuelles =
      BIEN.chargesCoproAnnuelles + BIEN.taxeFonciere + loyerEffectifAnnuel * GESTION;

    const cashflowMensuel = (loyerEffectifAnnuel - chargesAnnuelles) / 12 - echeance;
    const rendementBrut = ((BIEN.loyerMensuel * 12) / coutTotal) * 100;
    const rendementNet = ((loyerEffectifAnnuel - chargesAnnuelles) / coutTotal) * 100;
    const cashOnCash = apportEuros > 0 ? ((cashflowMensuel * 12) / apportEuros) * 100 : null;

    // Même logique de température que dans l'outil : trois axes pondérés.
    const norm = (v: number, min: number, max: number) =>
      Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
    const score = Math.round(
      norm(rendementNet, 0, 6) * 0.4 +
        norm(cashflowMensuel, -450, 250) * 0.35 +
        norm(rendementBrut, 0, 9) * 0.25,
    );

    return {
      apportEuros,
      capital,
      echeance,
      cashflowMensuel,
      rendementBrut,
      rendementNet,
      cashOnCash,
      score,
    };
  }, [apport, taux, duree]);

  return (
    <section
      id="scenario"
      data-header-theme="dark"
      className="border-t border-hairline py-28 lg:py-40"
    >
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
        <Reveal cine>
          <h2 className="t-display max-w-3xl text-text">
            Bougez un curseur.
            <br />
            Tout se recalcule.
          </h2>
          <p className="t-lead mt-8 max-w-xl">
            Les simulateurs calculent une fois et figent un résultat. Ici, essayez — c&apos;est
            le comportement réel de l&apos;outil.
          </p>
        </Reveal>

        <Reveal cine delay={0.1}>
          <div className="mt-14 grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <Panel>
              <h3 className="t-head mb-6 text-text">Vos hypothèses</h3>
              <div className="flex flex-col gap-6">
                <Slider
                  label={GLOSSARY.apport.label}
                  info={GLOSSARY.apport.def}
                  value={apport}
                  min={0}
                  max={45}
                  step={1}
                  unit=" %"
                  onChange={setApport}
                />
                <Slider
                  label={GLOSSARY.taux.label}
                  info={GLOSSARY.taux.def}
                  value={taux}
                  min={1}
                  max={6}
                  step={0.05}
                  unit=" %"
                  onChange={setTaux}
                />
                <Slider
                  label={GLOSSARY.duree.label}
                  info={GLOSSARY.duree.def}
                  value={duree}
                  min={10}
                  max={25}
                  step={1}
                  unit=" ans"
                  onChange={setDuree}
                />
              </div>

              <Rule className="my-6" />

              <StatGrid cols={2}>
                <Stat label="Apport" value={formatEUR(Math.round(r.apportEuros))} />
                <Stat label="Emprunt" value={formatEUR(Math.round(r.capital))} />
              </StatGrid>
            </Panel>

            <Panel>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className="t-head text-text">Verdict</h3>
                <span className="text-[12.5px] text-text-4">{BIEN.label}</span>
              </div>

              <VerdictBlock score={r.score} />

              <Rule className="my-7" />

              <StatGrid cols={4}>
                <Stat label="Prix affiché" value={formatEUR(BIEN.prix)} size="lg" />
                <Stat
                  label="Mensualité"
                  value={formatEUR(Math.round(r.echeance))}
                  size="lg"
                  hint="hors assurance"
                />
                <Stat
                  term="cashflow"
                  value={`${r.cashflowMensuel >= 0 ? "+" : ""}${formatEUR(Math.round(r.cashflowMensuel))}`}
                  size="lg"
                  hint="par mois"
                  tone={r.cashflowMensuel >= 0 ? "var(--good)" : "var(--mid)"}
                />
                <Stat
                  term="rendementNet"
                  value={formatPercent(r.rendementNet)}
                  size="lg"
                />
              </StatGrid>

              <p className="mt-8 border-t border-hairline pt-5 text-[12.5px] text-text-4">
                Simulation d&apos;illustration. Dans l&apos;outil, la fiscalité réelle et
                la rentabilité totale sont calculées en plus.
              </p>
            </Panel>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
