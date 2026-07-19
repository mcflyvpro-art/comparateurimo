import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales — Estio",
  description: "Mentions légales du site Estio.",
};

export default function MentionsLegales() {
  return (
    <LegalPage
      title="Mentions légales"
      sections={[
        {
          heading: "Éditeur du site",
          body: "Estio — [raison sociale, forme juridique, capital, RCS, adresse] à compléter avant mise en ligne.",
        },
        {
          heading: "Directeur de la publication",
          body: "[Nom du responsable de la publication] à compléter.",
        },
        {
          heading: "Hébergement",
          body: "Site hébergé par Vercel Inc. — [adresse de l'hébergeur] à compléter.",
        },
        {
          heading: "Propriété intellectuelle",
          body: "Les contenus du site (marque, textes, interface) sont protégés. Les données de marché proviennent de sources publiques officielles et restent la propriété de leurs producteurs respectifs.",
        },
      ]}
    />
  );
}
