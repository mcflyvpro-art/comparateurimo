import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet — Estio",
  description:
    "Vos biens analysés, réutilisables pour de nouvelles comparaisons sans recoût.",
};

const PLACEHOLDER_SLOTS = [0, 1, 2];

export default function Wallet() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Wallet
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Vos biens analysés vivent ici. Une fois dans le wallet, un bien se
        recompare autant que vous voulez, sans nouveau crédit.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_SLOTS.map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-bg-alt p-5"
          >
            <div className="h-32 rounded-xl bg-bg" />
            <div className="mt-4 h-4 w-2/3 rounded bg-bg" />
            <div className="mt-2 h-4 w-1/2 rounded bg-bg" />
            <p className="mt-4 text-xs uppercase tracking-wide text-muted">
              Emplacement de bien
            </p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted">
        Aperçu — le wallet se remplira dès que l’analyse de biens sera active.
      </p>
    </main>
  );
}
