import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, hébergeur, propriété intellectuelle et sources de données publiques d'Estio.",
};

export default function MentionsLegales() {
  return (
    <LegalPage
      eyebrow="Mentions"
      title="Mentions légales"
      intro="Qui édite ce service, qui l'héberge, et à qui appartiennent les données affichées."
      sections={[
        {
          heading: "Éditeur du site",
          body: "Estio — raison sociale, forme juridique, capital social, numéro RCS, siège social et numéro de TVA intracommunautaire à compléter avant mise en ligne.",
        },
        {
          heading: "Directeur de la publication",
          body: "Nom du responsable de la publication à compléter.",
        },
        {
          heading: "Hébergement",
          body: "Application hébergée par Vercel Inc. Base de données, authentification et stockage de fichiers assurés par Supabase. Adresses postales complètes à compléter.",
        },
        {
          heading: "Propriété intellectuelle",
          body: "La marque Estio, son logotype, l'interface, les textes et le système de représentation des données sont protégés. Toute reproduction, même partielle, est soumise à autorisation préalable.",
        },
        {
          heading: "Sources de données publiques",
          body: "Les données de marché proviennent de jeux de données publics et restent la propriété de leurs producteurs respectifs :\n\nBase adresse nationale (BAN) — adresses et géocodage.\nDemandes de valeurs foncières (DVF) — transactions notariées.\nCarte des loyers — loyers de référence.\nINSEE — tension locative, vacance, démographie.\nGéorisques — risques naturels et technologiques.\nADEME — diagnostics de performance énergétique.\n\nEstio en produit une synthèse et un calcul ; il n'en revendique pas la propriété et ne les revend pas.",
        },
        {
          heading: "Absence d'extraction des portails",
          body: "Estio ne procède à aucune extraction automatisée des annonces publiées sur les portails immobiliers. L'ingestion de biens repose exclusivement sur les documents que l'utilisateur fournit lui-même.",
        },
        {
          heading: "Statut du service",
          body: "Estio est un outil d'aide à la décision. Il n'exerce aucune activité de conseil en investissement financier, d'intermédiation en opérations de banque, ni de transaction immobilière.",
        },
        {
          heading: "Signalement",
          body: "Pour signaler un contenu, une donnée erronée ou une atteinte à un droit, écrivez à l'adresse indiquée sur la page Contact.",
        },
      ]}
    />
  );
}
