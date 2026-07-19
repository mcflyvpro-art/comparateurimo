import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Estio",
  description: "Une question, une remarque ? Écris-nous.",
};

export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Parlons-en."
        intro="Une question sur Estio, une suggestion, un partenariat ? Écris-nous, on lit tout."
      />
      <section className="mx-auto grid max-w-5xl gap-12 px-6 pb-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="font-sans text-lg font-semibold text-text">Par email</h2>
          <a
            href="mailto:contact@estio.immo"
            className="mt-2 inline-block text-brand hover:underline"
          >
            contact@estio.immo
          </a>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            On répond en général sous quelques jours ouvrés.
          </p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
