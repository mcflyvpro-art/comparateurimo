import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel } from "@/components/marketing/AuthPanel";
import { SignupForm } from "@/components/marketing/SignupForm";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Ouvrez votre premier pipeline. Plan Free gratuit, sans carte bancaire : un projet, trois biens, le pré-verdict en illimité.",
};

export default function Inscription() {
  return (
    <AuthPanel
      eyebrow="Premier pipeline"
      title="Deux cents annonces vous attendent."
      intro="Ouvrez un projet, capturez votre première annonce, et regardez-la chauffer. Le plan Free ne demande pas de carte bancaire."
      claim={{
        quote:
          "Vous ne saisissez que le bien. L'adresse déverrouille le marché, vos curseurs font le reste — et le verdict se recalcule à chaque geste.",
        source: "Ce que fait l'outil",
      }}
      footer={
        <>
          Vous avez déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="text-brand underline-offset-4 transition-opacity hover:underline hover:opacity-80"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthPanel>
  );
}
