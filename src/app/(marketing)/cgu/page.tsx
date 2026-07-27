import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation du service Estio.",
};

export default function Cgu() {
  return (
    <LegalPage
      eyebrow="Conditions"
      title="Conditions générales d'utilisation"
      intro="Ce que le service fait, ce qu'il ne fait pas, et ce qui relève de votre responsabilité."
      sections={[
        {
          heading: "Objet",
          body: "Les présentes conditions régissent l'utilisation d'Estio, outil de pilotage d'une recherche d'achat immobilier destiné à l'investissement locatif. Elles s'appliquent à toute personne accédant au service, quel que soit son plan d'abonnement. Version à compléter avant mise en ligne.",
        },
        {
          heading: "Nature du service",
          body: "Estio agrège des données publiques, applique un moteur de calcul déterministe et restitue des analyses comparatives. Il s'agit d'un outil d'aide à la décision.\n\nEstio ne fournit pas de conseil en investissement au sens réglementaire, ne réalise aucune recommandation personnalisée et n'exerce aucune activité d'intermédiation. Les résultats affichés sont des indicateurs, pas des préconisations.",
        },
        {
          heading: "Sources de données et exactitude",
          body: "Les données de marché proviennent de sources publiques (DVF, BAN, INSEE, Géorisques, ADEME, carte des loyers). Leur granularité est communale ou infracommunale (IRIS), jamais à l'immeuble.\n\nEstio met en œuvre des moyens raisonnables pour normaliser ces données mais ne garantit ni leur exhaustivité, ni leur actualité, ni leur exactitude au cas particulier. Toute valeur déterminante pour une décision doit être vérifiée à la source.",
        },
        {
          heading: "Extraction automatique de documents",
          body: "Le service propose une extraction assistée des champs d'un bien depuis un document que vous fournissez (capture d'écran, PDF, photographie). Cette extraction repose sur un modèle multimodal susceptible d'erreur.\n\nElle donne systématiquement lieu à un écran de confirmation : vous validez ou corrigez les valeurs avant enregistrement. Aucune valeur financière n'est produite par ce modèle.",
        },
        {
          heading: "Contenus que vous téléversez",
          body: "Vous restez responsable des documents, photographies et notes que vous ajoutez à vos biens, et garantissez disposer des droits nécessaires à leur usage dans le service. Estio n'exploite pas ces contenus à d'autres fins que la fourniture du service à votre bénéfice.",
        },
        {
          heading: "Abonnements et facturation",
          body: "Le service est proposé selon trois plans : Free, Pro et Expert. Le plan Free est gratuit et ne requiert aucun moyen de paiement.\n\nLes plans payants sont des abonnements mensuels ou annuels, résiliables à tout terme. Les modalités détaillées de facturation, de renouvellement et de remboursement seront précisées avant l'ouverture des paiements. Les tarifs affichés à ce jour sont indicatifs et non contractuels.",
        },
        {
          heading: "Disponibilité et évolutions",
          body: "Le service est en construction active. Des fonctionnalités peuvent être ajoutées, modifiées ou retirées. Estio s'efforce d'assurer une disponibilité continue sans y être tenu, et peut suspendre l'accès pour maintenance.",
        },
        {
          heading: "Responsabilité",
          body: "Vous demeurez seul responsable de vos décisions d'investissement et de leurs conséquences patrimoniales, fiscales et financières.\n\nEstio ne saurait être tenu responsable d'une décision prise sur la base des analyses fournies, ni des écarts entre une projection et une réalité constatée. Clauses de responsabilité complètes à compléter.",
        },
        {
          heading: "Droit applicable",
          body: "Les présentes conditions sont régies par le droit français. Juridiction compétente et procédure de médiation à compléter.",
        },
      ]}
    />
  );
}
