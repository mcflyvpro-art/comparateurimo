import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Confidentialité — Estio",
  description: "Politique de confidentialité et traitement des données personnelles.",
};

export default function Confidentialite() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      sections={[
        {
          heading: "Responsable de traitement",
          body: "[Entité responsable du traitement des données personnelles] à compléter avant mise en ligne.",
        },
        {
          heading: "Données collectées",
          body: "Compte (email), biens et comparaisons que tu enregistres. Ces informations te sont privées et ne sont pas revendues.",
        },
        {
          heading: "Finalités",
          body: "Fournir le service (analyse, comparaison, wallet), gérer ton compte et tes crédits.",
        },
        {
          heading: "Tes droits (RGPD)",
          body: "Accès, rectification, effacement, portabilité. [Adresse de contact du DPO / procédure] à compléter.",
        },
      ]}
    />
  );
}
