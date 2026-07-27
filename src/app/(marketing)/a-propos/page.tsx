import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Reveal } from "@/components/ui/Feedback";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { IconArrowRight } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Estio possède le milieu que personne n'occupe : la couche décision d'une recherche d'achat immobilier. Nos convictions, et ce qu'on refuse de faire.",
};

const CONVICTIONS = [
  {
    n: "01",
    titre: "Le problème n'est pas de chercher. C'est de trancher.",
    texte:
      "Il existe d'excellents moteurs de recherche immobilière et des dizaines de calculettes de rentabilité. Ce qui n'existe pas, c'est l'outil du milieu — celui qui se souvient des vingt biens que vous suivez, de ce que vous avez écarté et pourquoi, de l'agent qu'il faut relancer, du bien entre lequel et un autre vous hésitez depuis trois semaines. Aujourd'hui ça vit dans un Trello, un tableur et quinze onglets. C'est cette couche qu'Estio occupe.",
  },
  {
    n: "02",
    titre: "On stocke le bien, jamais l'analyse.",
    texte:
      "Une analyse vieillit : les taux bougent, le marché bouge, votre situation bouge. Un bien, lui, ne bouge pas — prix, surface, adresse, DPE. Estio ne conserve donc que le bien, et recalcule tout le reste contre les données du jour à chaque ouverture. Conséquence directe : rouvrir un dossier trois mois plus tard ne coûte rien, et le problème du « résultat périmé » n'existe simplement pas.",
  },
  {
    n: "03",
    titre: "Un chiffre financier ne sort jamais d'une IA.",
    texte:
      "L'intelligence artificielle sert à deux choses chez Estio : lire vos documents pour en extraire les champs d'un bien, et mettre un arbitrage en mots. Elle ne calcule jamais. Rendement, cash-flow, fiscalité, TRI et plus-value viennent d'un moteur déterministe, testé, dont chaque formule est affichée. C'est une frontière d'architecture, pas une politique éditoriale.",
  },
  {
    n: "04",
    titre: "C'est votre score, pas le nôtre.",
    texte:
      "Un classement « objectif » de biens immobiliers n'existe pas : tout dépend de ce que vous cherchez. Vous choisissez donc les pondérations — rendement, sécurité, potentiel — et le classement bascule avec elles. Le détail est toujours affiché, critère par critère. Un score qu'on ne peut pas ouvrir est un score qu'on ne peut pas défendre.",
  },
  {
    n: "05",
    titre: "On dit où sont les limites.",
    texte:
      "Les données publiques sont inégales. La tension locative est communale, pas par immeuble. L'extraction automatique peut se tromper. Les projections de revente sont des scénarios, pas des prédictions. Rien de tout cela n'est caché dans une note de bas de page : c'est écrit à l'endroit où ça compte, dans l'interface, au moment où vous lisez le chiffre.",
  },
];

const REFUS = [
  "Extraire automatiquement les annonces des portails.",
  "Vendre de la donnée publique brute.",
  "Facturer le fait de savoir si un bien vaut le coup d'œil.",
  "Promettre une valeur de revente.",
  "Se faire passer pour un conseil en investissement réglementé.",
];

export default function APropos() {
  return (
    <>
      <PageHeader
        eyebrow="À propos"
        title="Estio occupe le milieu que personne n'occupe."
        intro="Entre le moment où vous repérez une annonce et celui où vous faites une offre, il se passe quatre mois, deux cents biens et une centaine de micro-décisions. Aucun outil ne tenait ce fil. Maintenant si."
      />

      <section className="mx-auto max-w-[104rem] px-[var(--gutter)] pb-24">
        <ol className="flex flex-col">
          {CONVICTIONS.map((c, i) => (
            <Reveal key={c.n} cine delay={i * 0.04}>
              <li className="grid gap-6 border-t border-hairline py-12 lg:grid-cols-[5rem_minmax(0,1fr)] lg:gap-12 lg:py-14">
                <span className="num text-[13px] text-brand">{c.n}</span>
                <div className="max-w-3xl">
                  <h2 className="t-head text-text">{c.titre}</h2>
                  <p className="mt-5 text-[14px] leading-relaxed text-text-3">{c.texte}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
          <Reveal cine>
            <h2 className="t-title max-w-2xl text-text">Ce qu&apos;on ne fera pas.</h2>
            <p className="t-lead mt-6 max-w-xl">
              Une position produit se lit autant à ce qu&apos;elle refuse qu&apos;à ce
              qu&apos;elle promet.
            </p>
          </Reveal>

          <ul className="mt-10 flex flex-col">
            {REFUS.map((r, i) => (
              <Reveal key={r} cine delay={i * 0.04}>
                <li className="flex items-center gap-5 border-b border-hairline py-5">
                  <span className="h-px w-8 shrink-0 bg-ember-300" aria-hidden />
                  <span className="text-[15px] text-text-2">{r}</span>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal cine delay={0.2}>
            <div className="mt-14">
              <MagneticButton href="/connexion" trailing={<IconArrowRight size={15} />}>
                Ouvrir un pipeline
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
