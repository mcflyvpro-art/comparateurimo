import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Reveal } from "@/components/landing/Reveal";

export const metadata: Metadata = {
  title: "À propos — Estio",
  description:
    "Estio aide les investisseurs à décider, chiffres à l'appui. Un score personnalisé, transparent, jamais une boîte noire.",
};

const blocs = [
  {
    titre: "Aider à décider, chiffres à l'appui.",
    texte:
      "Acheter pour investir se joue sur des chiffres — rendement, fiscalité, risques. Estio les rassemble, les calcule et les compare, pour que le choix soit clair plutôt qu'intuitif.",
  },
  {
    titre: "C'est ton score, pas le nôtre.",
    texte:
      "Le score reflète tes priorités : tu choisis ce qui compte. Et on montre toujours pourquoi un bien l'emporte, critère par critère. Un argument défendable, pas une opinion.",
  },
  {
    titre: "Honnêtes sur l'incertitude.",
    texte:
      "Les projections de revente sont des scénarios, pas des promesses. La granularité des données varie. On le dit clairement, à chaque fois.",
  },
];

export default function APropos() {
  return (
    <>
      <PageHeader
        eyebrow="À propos"
        title="Un comparateur qui assume ses chiffres."
        intro="Estio est né d'un constat simple : comparer deux biens du point de vue de l'investissement demande trop de calculs éparpillés. On les a réunis."
      />

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="flex flex-col gap-12">
          {blocs.map((b, i) => (
            <Reveal key={b.titre} delay={i * 0.05}>
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
                {b.titre}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">{b.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
