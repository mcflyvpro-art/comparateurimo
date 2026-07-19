import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PricingTable } from "@/components/marketing/PricingTable";

export const metadata: Metadata = {
  title: "Tarifs — Estio",
  description:
    "Un crédit analyse un bien neuf et l’ajoute à ton wallet, réutilisable ensuite gratuitement. Free, Pro, Expert.",
};

export default function Tarifs() {
  return (
    <>
      <PageHeader
        eyebrow="Tarifs"
        title="Paie pour analyser, réutilise à volonté."
        intro="Un crédit analyse un bien neuf et l’ajoute à ton wallet. Une fois dedans, tu le recompares autant que tu veux, sans recoût."
      />

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <PricingTable />
        <p className="mt-10 rounded-lg border border-border bg-bg-alt px-4 py-3 text-center text-sm text-muted">
          Tarifs indicatifs, non contractuels — la grille définitive sera
          précisée avant l’ouverture des paiements.
        </p>
      </section>
    </>
  );
}
