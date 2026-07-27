import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Notice, Reveal } from "@/components/ui/Feedback";
import { Panel } from "@/components/ui/Panel";
import { Stat, StatGrid } from "@/components/ui/Stat";
import { Locked } from "@/components/ui/Locked";

export const metadata: Metadata = {
  title: "Formules",
  description:
    "Free, Pro, Expert. Le pré-verdict est gratuit et illimité — ce qui se paie, c'est l'insight : marché précis, détail du score, net-net, TRI, scénario en direct.",
};

const PRINCIPES = [
  {
    titre: "Aucun crédit sur la boucle cœur",
    texte:
      "Mettre un compteur sur le verdict reviendrait à taxer le moment où vous avez le plus besoin de volume — un investisseur regarde cinquante à deux cents biens. Le pré-verdict reste donc gratuit et illimité, quel que soit votre plan.",
  },
  {
    titre: "On ne vend jamais la donnée brute",
    texte:
      "DVF, INSEE, Géorisques sont des données publiques ouvertes. Les revendre serait malhonnête. Ce qui se paie, c'est la synthèse, le calcul, la comparaison et l'arbitrage — le travail, pas la matière première.",
  },
  {
    titre: "Un projet d'achat se borne dans le temps",
    texte:
      "Vous cherchez quatre mois, vous trouvez, vous archivez. L'abonnement suit ce rythme : vous payez le temps de votre recherche, pas un forfait perpétuel. Et vous revenez au prochain achat.",
  },
  {
    titre: "Déductible au régime réel",
    texte:
      "Si vous déclarez vos revenus fonciers au réel, l'abonnement entre dans vos charges déductibles. Renseignez-vous auprès de votre conseiller — nous ne sommes pas habilités à vous le confirmer.",
  },
];

export default function Tarifs() {
  return (
    <>
      <PageHeader
        eyebrow="Formules"
        title="Le verdict est gratuit. L'insight se paie."
        intro="Trois plans, un abonnement, aucun crédit sur le cœur du produit. Vous voyez toujours si un bien chauffe ; ce qui se débloque, c'est la précision qui vous fera signer."
      />

      <section className="mx-auto max-w-[104rem] px-[var(--gutter)] pb-24">
        <PricingTable />

        <Notice className="mt-10">
          Tarifs indicatifs et non contractuels. La grille définitive sera arrêtée avant
          l&apos;ouverture des paiements.
        </Notice>
      </section>

      {/* Ce que « flouter l'insight » veut dire, montré plutôt qu'expliqué */}
      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
          <Reveal cine>
            <h2 className="t-title max-w-2xl text-text">
              Verrouiller, ce n&apos;est pas cacher.
            </h2>
            <p className="t-lead mt-6 max-w-2xl">
              Une donnée réservée n&apos;est pas retirée de l&apos;écran : elle est
              simplement hors du plan de netteté. Vous voyez qu&apos;elle existe, vous
              voyez sa forme, et elle se cale d&apos;un coup au déverrouillage. Passez la
              souris dessus.
            </p>
          </Reveal>

          <Reveal cine delay={0.1}>
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              <Panel>
                <h3 className="t-head mb-6 text-text">Avec le plan Free</h3>
                <StatGrid cols={2}>
                  <Stat label="Prix affiché" value="245 000 €" />
                  <Stat term="prixM2Notarie" value="3 480 €" />
                </StatGrid>
                <div className="mt-7 grid grid-cols-2 gap-8">
                  <Locked label="Débloquer" href="/tarifs">
                    <Stat term="loyerMarche" value="890 €" />
                  </Locked>
                  <Locked label="Débloquer" href="/tarifs">
                    <Stat term="rendementApresImpot" value="4,1 %" />
                  </Locked>
                </div>
                <p className="mt-7 text-[12.5px] leading-relaxed text-text-4">
                  Le prix, la surface et les valeurs foncières publiques restent lisibles :
                  ce sont des données ouvertes.
                </p>
              </Panel>

              <Panel>
                <h3 className="t-head mb-6 text-text">Avec le plan Pro</h3>
                <StatGrid cols={2}>
                  <Stat label="Prix affiché" value="245 000 €" />
                  <Stat term="prixM2Notarie" value="3 480 €" />
                </StatGrid>
                <div className="mt-7">
                  <StatGrid cols={2}>
                    <Stat term="loyerMarche" value="890 €" />
                    <Stat term="rendementApresImpot" value="4,1 %" />
                  </StatGrid>
                </div>
                <p className="mt-7 text-[12.5px] leading-relaxed text-text-4">
                  Tout est net. C&apos;est la seule différence, et c&apos;est celle qui
                  fait signer ou renoncer.
                </p>
              </Panel>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
          <Reveal cine>
            <h2 className="t-title max-w-2xl text-text">
              Quatre décisions qu&apos;on assume.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PRINCIPES.map((p, i) => (
              <Reveal key={p.titre} cine delay={i * 0.05}>
                <article className="h-full rounded-lg border border-hairline bg-surface p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="num text-[11px] text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[15px] font-medium text-text">{p.titre}</h3>
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-text-3">{p.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
