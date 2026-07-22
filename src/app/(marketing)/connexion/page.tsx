import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/marketing/LoginForm";

export const metadata: Metadata = {
  title: "Se connecter — Estio",
  description: "Accède à ton espace Estio.",
};

export default function Connexion() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" aria-label="Estio — accueil" className="inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/estio-wordmark.svg" alt="Estio" className="h-8 w-auto" />
      </Link>
      <h1 className="mt-8 font-sans text-3xl font-semibold tracking-[-0.02em] text-text">
        Content de te revoir.
      </h1>
      <p className="mt-2 text-muted">
        Connecte-toi pour retrouver ton wallet et tes comparaisons.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-faint">
        Pas encore de compte ? La création arrive bientôt.
      </p>
    </main>
  );
}
