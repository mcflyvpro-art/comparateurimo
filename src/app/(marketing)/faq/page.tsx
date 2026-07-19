import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Estio",
  description:
    "Sources de données, fiabilité des calculs, crédits, confidentialité : les réponses aux questions fréquentes sur Estio.",
};

export default function Faq() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Les questions qu'on nous pose."
      />
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <FaqAccordion />
      </section>
    </>
  );
}
