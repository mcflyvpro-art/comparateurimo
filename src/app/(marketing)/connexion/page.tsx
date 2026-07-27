import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel } from "@/components/marketing/AuthPanel";
import { LoginForm } from "@/components/marketing/LoginForm";

export const metadata: Metadata = {
  title: "Se connecter",
  description: "Retrouvez vos projets, vos pipelines et vos candidats.",
};

export default function Connexion() {
  return (
    <AuthPanel
      eyebrow="Accès"
      title="Reprenons où vous en étiez."
      intro="Vos projets, vos candidats, vos notes et les raisons de ce que vous avez écarté vous attendent exactement là où vous les avez laissés."
      claim={{
        quote:
          "Le pipeline se souvient de tout, y compris de ce que vous avez écarté. C'est ce qui fait qu'on ne réanalyse jamais deux fois le même bien.",
        source: "Principe fondateur",
      }}
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="text-brand underline-offset-4 transition-opacity hover:underline hover:opacity-80"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthPanel>
  );
}
