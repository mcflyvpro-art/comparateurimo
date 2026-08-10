import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Reveal } from "@/components/ui/Feedback";
import { IconMail } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question, un chiffre qui cloche, un usage professionnel ? Écrivez-nous, on lit tout.",
};

const CANAUX = [
  {
    titre: "Un chiffre qui cloche",
    texte:
      "C'est le message qui nous intéresse le plus. La qualité des données de marché est le vrai enjeu du produit — signalez-nous une valeur qui vous semble fausse, avec l'adresse concernée.",
  },
  {
    titre: "Usage professionnel",
    texte:
      "CGP, chasseur immobilier, marchand de biens : le plan Expert et le rapport en marque blanche se construisent avec vous. Dites-nous ce qu'il vous manque.",
  },
  {
    titre: "Presse",
    texte:
      "Pour un article, une interview ou des visuels du produit, écrivez-nous en précisant le média et votre échéance.",
  },
];

export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Dites-nous ce qui ne va pas."
        intro="Les compliments font plaisir, mais ce sont les objections qui font le produit. Un chiffre douteux, une étape qui manque, une formule fiscale à revoir : on prend."
      />

      <section className="mx-auto max-w-[104rem] px-[var(--gutter)] pb-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <Reveal cine>
              <a
                href="mailto:contact@estio.immo"
                className="group inline-flex items-center gap-3 text-[15px] text-text transition-colors hover:text-accent"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-text-3 transition-colors group-hover:border-accent-line group-hover:text-accent">
                  <IconMail size={15} />
                </span>
                contact@estio.immo
              </a>
              <p className="mt-4 text-[13px] leading-relaxed text-text-3">
                Réponse sous quelques jours ouvrés.
              </p>
            </Reveal>

            <div className="mt-12 flex flex-col">
              {CANAUX.map((c, i) => (
                <Reveal key={c.titre} cine delay={i * 0.05}>
                  <div className="border-t border-line-soft py-6">
                    <h2 className="text-[14px] font-medium text-text">{c.titre}</h2>
                    <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-text-3">
                      {c.texte}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal cine delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
