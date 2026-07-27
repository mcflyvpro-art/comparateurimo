import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Estio collecte, pourquoi, combien de temps, et comment exercer vos droits.",
};

export default function Confidentialite() {
  return (
    <LegalPage
      eyebrow="Confidentialité"
      title="Politique de confidentialité"
      intro="Vos projets, vos candidats et vos notes vous appartiennent. Voici précisément ce que nous conservons, et pourquoi."
      sections={[
        {
          heading: "Responsable de traitement",
          body: "Entité responsable du traitement des données personnelles à compléter avant mise en ligne, ainsi que ses coordonnées et, le cas échéant, celles du délégué à la protection des données.",
        },
        {
          heading: "Données collectées",
          body: "Données de compte : adresse e-mail, mot de passe chiffré, plan d'abonnement.\n\nDonnées de service : vos projets, les biens que vous y enregistrez, vos notes, vos prix maximums, vos raisons d'écarter, vos scénarios, ainsi que les photographies et documents que vous téléversez.\n\nDonnées techniques : journaux de connexion et de sécurité nécessaires au fonctionnement et à la protection du service.",
        },
        {
          heading: "Ce que nous ne conservons pas",
          body: "Estio ne stocke pas les analyses. Les données de marché et les résultats de calcul sont recalculés à la demande contre les données du jour, et ne constituent pas un enregistrement à votre nom. Au plus, un cache technique de données publiques, daté et périssable, non rattaché à votre compte.",
        },
        {
          heading: "Finalités",
          body: "Fournir le service : constituer et piloter vos pipelines, calculer les analyses, générer les arbitrages.\n\nGérer votre compte et votre abonnement.\n\nAssurer la sécurité du service et prévenir les usages abusifs.\n\nAméliorer le produit, sur la base de données agrégées et non identifiantes.",
        },
        {
          heading: "Sous-traitants",
          body: "Le service s'appuie sur des prestataires techniques pour l'hébergement, la base de données, le stockage de fichiers, le paiement et l'extraction assistée de documents. La liste nominative, leurs localisations et les garanties applicables aux transferts hors Union européenne sont à compléter avant mise en ligne.",
        },
        {
          heading: "Absence de revente",
          body: "Nous ne vendons aucune donnée personnelle et ne cédons aucune donnée de recherche à des tiers commerciaux. Le modèle économique repose exclusivement sur l'abonnement.",
        },
        {
          heading: "Durée de conservation",
          body: "Les données de compte sont conservées tant que le compte existe. Les projets archivés restent accessibles jusqu'à suppression par vos soins. Après suppression du compte, les données sont effacées sous un délai à préciser, hors obligations légales de conservation comptable.",
        },
        {
          heading: "Vos droits",
          body: "Conformément au règlement général sur la protection des données, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité.\n\nProcédure d'exercice et adresse de contact à compléter. Vous pouvez également introduire une réclamation auprès de la CNIL.",
        },
        {
          heading: "Cookies et mesure d'audience",
          body: "Le service utilise les cookies strictement nécessaires à l'authentification et à la sécurité. Toute mesure d'audience éventuelle sera soumise à consentement préalable et détaillée ici avant activation.",
        },
      ]}
    />
  );
}
