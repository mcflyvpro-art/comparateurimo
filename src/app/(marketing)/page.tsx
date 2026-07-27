import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { PipelineForms } from "@/components/landing/PipelineForms";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { KeyFigures } from "@/components/landing/KeyFigures";
import { SectionCapture } from "@/components/landing/SectionCapture";
import { SectionLevels } from "@/components/landing/SectionLevels";
import { LiveScenario } from "@/components/landing/LiveScenario";
import { SectionArbitrage } from "@/components/landing/SectionArbitrage";
import { FinalCta } from "@/components/landing/FinalCta";

export const metadata: Metadata = {
  title: { absolute: "Estio — 200 annonces, une décision" },
  description:
    "Le pipeline de décision de l'investisseur immobilier. Capture universelle, données publiques, moteur de calcul déterministe, arbitrage entre finalistes. Du repérage à l'offre.",
};

/**
 * Page d'accueil — un récit en huit temps.
 *
 *   Le champ focal     : deux cents annonces dans le noir, une seule nette.
 *   Le pipeline        : le désordre se trie sous le défilement.
 *   L'outil            : l'interface réelle, dans un cadre qui se redresse.
 *   L'entonnoir        : 200 → 20 → 3 → 1.
 *   La capture         : on photographie ce qu'aucun agrégateur ne voit.
 *   Les trois niveaux  : pourquoi une analyse Estio ne périme jamais.
 *   Le scénario        : les curseurs marchent, ici, tout de suite.
 *   L'arbitrage        : changez de priorité, le gagnant bascule.
 *
 * Trois des huit sections sont jouables ou vivantes. C'est délibéré : un produit
 * dont l'argument est « ça recalcule en direct » doit le prouver avant
 * l'inscription, pas après.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <PipelineForms />
      <ProductShowcase />
      <KeyFigures />
      <SectionCapture />
      <SectionLevels />
      <LiveScenario />
      <SectionArbitrage />
      <FinalCta />
    </>
  );
}
