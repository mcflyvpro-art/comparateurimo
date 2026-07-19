import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Reveal } from "@/components/landing/Reveal";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";

export const metadata: Metadata = {
  title: "Comment ça marche — Estio",
  description:
    "Une adresse déverrouille les données de marché. Estio superpose trois niveaux — le bien, le marché, les scénarios — et en tire un score personnalisé.",
};

const niveaux = [
  {
    n: "N1",
    titre: "Le bien",
    texte:
      "Tu renseignes huit champs : adresse, prix, surface, DPE. L'adresse est le champ clé — une fois géocodée, elle ouvre le reste.",
  },
  {
    n: "N2",
    titre: "Le marché",
    texte:
      "Dérivé automatiquement de l'adresse : prix/m² notarié, loyer estimé, tension locative, zonage, risques naturels et technologiques.",
  },
  {
    n: "N3",
    titre: "Les scénarios",
    texte:
      "Après comparaison, tu règles apport, emprunt, stratégie fiscale et horizon. Le moteur recalcule rendement, cash-flow et TRI.",
  },
];

export default function CommentCaMarche() {
  return (
    <>
      <PageHeader
        eyebrow="Comment ça marche"
        title="Une adresse, et tout se déverrouille."
        intro="Estio superpose trois niveaux de données. Tu ne saisis que le premier ; les deux autres apparaissent en résultat."
      />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-12 md:gap-16">
          {niveaux.map((niv, i) => (
            <Reveal key={niv.n} delay={i * 0.05}>
              <div className="grid items-center gap-4 md:grid-cols-2 md:gap-12">
                <div
                  className={`font-sans text-[4.5rem] font-semibold leading-none tracking-tighter text-brand/20 md:text-[7rem] ${
                    i % 2 === 1 ? "md:order-2 md:text-right" : ""
                  }`}
                >
                  {niv.n}
                </div>
                <div>
                  <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
                    {niv.titre}
                  </h2>
                  <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">
                    {niv.texte}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t border-border px-6 py-16">
        <Reveal>
          <h2 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text">
            Le score, transparent de bout en bout.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Tu choisis un profil (rentabilité, patrimoine, sécurité, équilibré)
            ou tu règles les pondérations. Elles se normalisent à 100 %, et le
            détail du calcul reste visible, critère par critère.
          </p>
        </Reveal>
        <div className="mt-12">
          <SourcesMarquee />
        </div>
      </section>
    </>
  );
}
