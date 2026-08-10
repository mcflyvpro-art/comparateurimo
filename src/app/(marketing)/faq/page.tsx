import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { Reveal } from "@/components/ui/Feedback";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Sources de données, fiabilité des calculs, absence de scraping, granularité, confidentialité, formules : les réponses franches sur Estio.",
};

export default function Faq() {
  return (
    <>
      <PageHeader
        eyebrow="Questions"
        title="Ce qu'on nous demande."
        intro="Y compris les questions qui nous désavantagent. Un public sceptique ne se convainc pas à coups d'arguments — il se convainc quand on lui dit où sont les limites."
      />

      <section className="mx-auto max-w-4xl px-[var(--gutter)] pb-24">
        <FaqAccordion />

        <Reveal cine>
          <div className="mt-16 rounded-lg border border-line-soft bg-surface px-7 py-6">
            <h2 className="text-[15px] font-medium text-text">
              Une question qui n&apos;est pas là ?
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-text-3">
              Écrivez-nous, on lit tout. Les questions récurrentes finissent sur cette
              page.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 text-[13px] text-accent underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
            >
              Nous écrire
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
