import { computeMockMarketData } from "@/lib/calc/market-mock";
import { formatPricePerM2 } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { Stat, StatGrid, SourceTag } from "@/components/ui/Stat";
import { InfoTip, Notice } from "@/components/ui/Feedback";
import { toneEcartPrix, toneTension, toneVacance } from "@/lib/tone";
import { GLOSSARY } from "@/lib/glossary";
import type { PropertyRow } from "@/lib/property-detail-types";

const TENSION_LABELS = { faible: "Faible", moyenne: "Moyenne", forte: "Forte" } as const;

/**
 * Le marché.
 *
 * En v1 : six statistiques, une note d'avertissement, et un paragraphe sur la
 * granularité. En v2 : trois statistiques et une comparaison — parce que la
 * seule question qu'on se pose ici est « est-ce que ce bien est cher pour le
 * quartier ? ».
 *
 * On y répond directement, en toutes lettres, plutôt que de laisser
 * l'utilisateur faire la division de tête. Les réserves sur la précision
 * géographique sont passées en définition, là où on lit le chiffre.
 */
export function SectionMarche({ property }: { property: PropertyRow }) {
  const market = computeMockMarketData(property.insee_code, property.address);

  const prixM2 =
    property.asking_price && property.surface_carrez && property.surface_carrez > 0
      ? property.asking_price / property.surface_carrez
      : null;

  const ecartPct =
    prixM2 !== null ? ((prixM2 - market.pricePerM2DVF) / market.pricePerM2DVF) * 100 : null;

  return (
    <Panel>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="t-head text-text">Le marché autour</h2>
        <SourceTag kind="public" />
      </div>

      {ecartPct !== null && (
        <p className="mb-7 text-[14px] leading-relaxed text-text">
          Ce bien est affiché{" "}
          <strong className="font-medium" style={{ color: toneEcartPrix(ecartPct) }}>
            {Math.abs(Math.round(ecartPct))} % {ecartPct >= 0 ? "au-dessus" : "en dessous"}
          </strong>{" "}
          du prix au mètre carré constaté chez les notaires du secteur.
          <InfoTip
            className="ml-1"
            title={GLOSSARY.granularite.label}
            text={GLOSSARY.granularite.def}
          />
        </p>
      )}

      <StatGrid cols={3}>
        <Stat
          term="prixM2Notarie"
          value={`${market.pricePerM2DVF.toLocaleString("fr-FR")} €`}
          hint={
            prixM2 !== null
              ? `ce bien : ${formatPricePerM2(property.asking_price, property.surface_carrez)}`
              : undefined
          }
        />
        <Stat
          term="loyerMarche"
          value={`${market.rentPerM2} € / m²`}
          hint={
            property.surface_carrez
              ? `soit environ ${Math.round(market.rentPerM2 * property.surface_carrez)} € par mois`
              : undefined
          }
        />
        <Stat
          term="tensionLocative"
          value={TENSION_LABELS[market.tensionLocative]}
          tone={toneTension(market.tensionLocative)}
          hint={
            <span style={{ color: toneVacance(market.vacancyPct) }}>
              {market.vacancyPct} % de vacance
            </span>
          }
        />
      </StatGrid>

      <Notice className="mt-7">
        Valeurs d&apos;exemple. Le branchement réel sur les données notariées et la carte
        des loyers pour cette adresse arrive plus loin dans la feuille de route.
      </Notice>
    </Panel>
  );
}
