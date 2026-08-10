import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Reveal } from "@/components/ui/Feedback";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { IconArrowRight } from "@/components/ui/Icon";
import { STATUS_COLUMNS } from "@/lib/pipeline-types";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "Du repérage à l'offre : créer un projet, alimenter le pipeline par capture, régler son scénario, arbitrer entre finalistes. Le parcours complet d'une recherche d'achat.",
};

const ETAPES = [
  {
    n: "01",
    titre: "Ouvrez un projet",
    lede: "Un projet, c'est un achat.",
    texte:
      "« T2/T3 Lyon, ≤ 250 000 €, cash-flow positif ». Le projet porte le pipeline, les candidats, vos notes et les raisons de ce que vous écartez. Quand l'offre est faite, il s'archive — et vous en ouvrez un autre au prochain achat.",
  },
  {
    n: "02",
    titre: "Alimentez par capture",
    lede: "N'importe quel document devient un bien.",
    texte:
      "Capture d'écran d'une annonce, PDF d'agence, message de mandataire, photo d'une fiche papier. Un modèle multimodal en extrait les champs, l'adresse est géocodée, et la carte-bien apparaît avec son pré-verdict. Vous corrigez ce qui manque : le formulaire est la destination, pas le point de départ.",
  },
  {
    n: "03",
    titre: "Pilotez le board",
    lede: "Six étapes, du froid à l'incandescent.",
    texte:
      "À analyser, analysé, visite, en négo, offre — et écarté, avec sa raison obligatoire. Chaque bien porte ses chiffres et son contexte humain : votre prix maximum, l'agent à relancer, pourquoi vous hésitez.",
  },
  {
    n: "04",
    titre: "Réglez votre scénario",
    lede: "Les curseurs recalculent tout, en direct.",
    texte:
      "Apport, taux, durée, régime fiscal, horizon de revente. Le verdict, les rendements, le tableau d'amortissement et la comparaison des six régimes se recalculent à chaque geste. Rien n'est figé, rien n'est à relancer.",
  },
  {
    n: "05",
    titre: "Tranchez",
    lede: "Le profil de priorité fait basculer le gagnant.",
    texte:
      "Deux ou trois finalistes côte à côte, chacun décomposé critère par critère. Selon que vous cherchez du revenu immédiat, de la sécurité ou de la valorisation, le classement change — et le verdict est formulé en français, pas en tableau.",
  },
];

const NIVEAUX = [
  {
    tag: "N1",
    titre: "Le bien",
    color: "var(--text-2)",
    texte:
      "Huit à dix champs irréductibles, saisis ou extraits. C'est la seule chose stockée, parce que c'est la seule qui ne vieillit pas.",
  },
  {
    tag: "N2",
    titre: "Le marché",
    color: "var(--text-2)",
    texte:
      "Dérivé de l'adresse seule : prix/m² notarié, loyer de marché, tension, risques, démographie. Recalculé à chaque ouverture, jamais figé.",
  },
  {
    tag: "N3",
    titre: "Votre scénario",
    color: "var(--text-2)",
    texte:
      "Apport, taux, durée, fiscalité, horizon. Ce qui transforme un bien en investissement — et ce qui fait que votre verdict n'est pas celui du voisin.",
  },
];

export default function CommentCaMarche() {
  return (
    <>
      <PageHeader
        eyebrow="Comment ça marche"
        title="Du repérage à l'offre, sans changer d'outil."
        intro="Un investisseur voit cent à deux cents annonces en quatre mois, en retient une vingtaine, et fait une seule offre. Estio possède ce milieu-là — celui où l'on jongle, où l'on hésite, et où l'on tranche."
      />

      {/* Le parcours */}
      <section className="mx-auto max-w-[104rem] px-[var(--gutter)] pb-28">
        <ol className="flex flex-col">
          {ETAPES.map((e, i) => (
            <Reveal key={e.n} cine delay={i * 0.04}>
              <li className="grid gap-6 border-t border-line-soft py-12 lg:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-16">
                <span className="num text-[13px] text-accent">{e.n}</span>
                <div>
                  <h2 className="t-head text-text">{e.titre}</h2>
                  <p className="mt-2 text-[14px] text-text-2">{e.lede}</p>
                </div>
                <p className="max-w-xl text-[14px] leading-relaxed text-text-3">
                  {e.texte}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Le board, en résumé visuel */}
      <section className="border-t border-line-soft py-24">
        <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
          <Reveal cine>
            <h2 className="t-title max-w-2xl text-text">Six étapes, pas plus.</h2>
            <p className="t-lead mt-6 max-w-xl">
              Celles d&apos;un vrai achat immobilier. Vous lisez l&apos;avancement
              d&apos;une recherche entière sans ouvrir un seul dossier.
            </p>
          </Reveal>

          <Reveal cine delay={0.1}>
            <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {STATUS_COLUMNS.map((col, i) => (
                <li
                  key={col.key}
                  className="rounded-md border border-line-soft bg-surface p-5"
                >
                  <span className="num block text-[12px] text-text-4">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 block text-[13.5px] font-medium text-text">
                    {col.label}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Les trois niveaux */}
      <section className="border-t border-line-soft py-24">
        <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
          <Reveal cine>
            <h2 className="t-title max-w-2xl text-text">Trois niveaux de données.</h2>
            <p className="t-lead mt-6 max-w-2xl">
              Vous ne saisissez que le premier. Les deux autres apparaissent en résultat —
              et chaque chiffre de l&apos;interface porte la marque de sa provenance.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {NIVEAUX.map((n, i) => (
              <Reveal key={n.tag} cine delay={0.06 * i}>
                <article className="h-full rounded-lg border border-line-soft bg-surface p-6">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="h-4 w-[2px] rounded-full"
                      style={{ background: n.color, opacity: n.tag === "N1" ? 0.45 : 1 }}
                    />
                    <span className="num text-[11px]" style={{ color: n.color }}>
                      {n.tag}
                    </span>
                    <h3 className="t-head text-text">{n.titre}</h3>
                  </div>
                  <p className="mt-5 text-[13px] leading-relaxed text-text-3">{n.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sources & garde-fous */}
      <section className="border-t border-line-soft py-24">
        <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
          <Reveal cine>
            <h2 className="t-title max-w-3xl text-text">
              De la donnée publique, un calcul transparent.
            </h2>
            <p className="t-lead mt-6 max-w-2xl">
              Toutes les sources sont officielles et ouvertes. Le moteur de calcul est
              déterministe : chaque chiffre financier est vérifiable, aucun n&apos;est
              produit par une intelligence artificielle.
            </p>
          </Reveal>

          <div className="mt-12">
            <SourcesMarquee />
          </div>

          <Reveal cine delay={0.1}>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <Guard
                titre="Aucun scraping"
                texte="Les portails interdisent l'extraction, et la jurisprudence est sans ambiguïté. La rampe universelle, c'est votre capture d'écran — vous photographiez ce que vous regardez déjà."
              />
              <Guard
                titre="Honnêteté sur la granularité"
                texte="Tension et vacance sont établies à la maille commune ou IRIS, jamais par immeuble. On l'affiche plutôt que de laisser croire à une précision qui n'existe pas."
              />
              <Guard
                titre="Aucune prédiction garantie"
                texte="Les projections de revente sont des scénarios explicitement extrapolés. Vous choisissez l'hypothèse de marché, et vous voyez l'écart entre elles."
              />
            </div>
          </Reveal>

          <Reveal cine delay={0.15}>
            <div className="mt-16 flex flex-wrap items-center gap-4">
              <MagneticButton href="/connexion" trailing={<IconArrowRight size={15} />}>
                Ouvrir un pipeline
              </MagneticButton>
              <MagneticButton href="/tarifs" variant="outline">
                Voir les formules
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Guard({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="rounded-lg border border-line-soft bg-surface p-6">
      <h3 className="text-[14px] font-medium text-text">{titre}</h3>
      <p className="mt-3 text-[13px] leading-relaxed text-text-3">{texte}</p>
    </div>
  );
}
