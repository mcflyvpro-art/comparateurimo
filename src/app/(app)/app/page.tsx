import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord — Estio",
  description:
    "Votre espace Estio : analysez un bien et retrouvez-le dans votre wallet.",
};

export default function AppDashboard() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Tableau de bord
      </h1>

      <div className="mt-10 rounded-2xl border border-border bg-bg-alt px-6 py-16 text-center">
        <p className="text-lg text-text">Aucun bien analysé pour l&apos;instant.</p>
        <p className="mt-2 text-sm text-muted">
          Importez une annonce pour l&apos;analyser et l&apos;ajouter à votre wallet.
        </p>
        <span
          aria-disabled="true"
          title="Bientôt disponible"
          className="mt-8 inline-flex cursor-not-allowed items-center rounded-full border border-border bg-bg px-5 py-2.5 text-sm font-medium text-muted"
        >
          Importer un bien · bientôt
        </span>
      </div>
    </main>
  );
}
