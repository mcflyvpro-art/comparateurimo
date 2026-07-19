import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "CGU — Estio",
  description: "Conditions générales d'utilisation d'Estio.",
};

export default function Cgu() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      sections={[
        {
          heading: "Objet",
          body: "Les présentes conditions régissent l'utilisation d'Estio, comparateur immobilier d'investissement. Version à compléter avant mise en ligne.",
        },
        {
          heading: "Nature du service",
          body: "Estio fournit des analyses et comparaisons à titre informatif. Les résultats ne constituent pas un conseil en investissement ; les projections sont des scénarios, pas des garanties.",
        },
        {
          heading: "Crédits et abonnements",
          body: "L'usage repose sur des crédits et des offres (Free, Pro, Expert). Les modalités détaillées de facturation seront précisées avant l'ouverture des paiements.",
        },
        {
          heading: "Responsabilité",
          body: "L'utilisateur reste seul responsable de ses décisions d'investissement. [Clauses de responsabilité complètes] à compléter.",
        },
      ]}
    />
  );
}
