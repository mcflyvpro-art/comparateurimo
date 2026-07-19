import type { Metadata } from "next";
import { Reveal } from "@/components/landing/Reveal";
import { Hero } from "@/components/landing/Hero";
import { ScoreProfiles } from "@/components/landing/ScoreProfiles";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";
import { MagneticButton } from "@/components/landing/MagneticButton";

export const metadata: Metadata = {
  title: "Estio — comparateur immobilier d’investissement",
  description:
    "Compare tes biens immobiliers côte à côte, du point de vue de l’investissement. Une adresse déverrouille les données de marché, et le score reflète tes priorités.",
};

const niveaux = [
  {
    n: "N1",
    titre: "Le bien",
    texte:
      "Tu saisis l’essentiel : adresse, prix, surface, DPE. Huit champs, pas une page entière à recopier.",
  },
  {
    n: "N2",
    titre: "Le marché",
    texte:
      "Déduit de l’adresse : prix/m² notarié (DVF), loyer estimé, tension locative, risques naturels et techno.",
  },
  {
    n: "N3",
    titre: "Les scénarios",
    texte:
      "Tu règles l’apport, l’emprunt, la stratégie et l’horizon. Le moteur calcule rendement, cash-flow et TRI.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <main className="mx-auto max-w-6xl px-6">
      {/* Principe — zig-zag */}
      <section id="principe" className="scroll-mt-24 py-20 lg:py-28">
        <Reveal>
          <span className="text-sm font-medium uppercase tracking-wide text-brand">
            Le principe
          </span>
          <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
            L’adresse déverrouille 80 % de la donnée.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Le formulaire est court parce que l’essentiel apparaît en résultat,
            pas en saisie. Trois niveaux se superposent.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-12 md:gap-16">
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
                  <h3 className="font-sans text-2xl font-semibold tracking-tight text-text">
                    {niv.titre}
                  </h3>
                  <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">
                    {niv.texte}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Score */}
      <section id="score" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-wide text-brand">
              Le score
            </span>
            <h2 className="mt-4 font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
              C’est <em>ton</em> score, pas le nôtre.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Choisis un profil, ou règle finement les pondérations. Le score se
              recalcule en direct, et on affiche toujours le détail : pourquoi ce
              bien l’emporte, critère par critère. Jamais de boîte noire.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ScoreProfiles />
          </Reveal>
        </div>
      </section>

      {/* Données */}
      <section id="donnees" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
        <Reveal>
          <span className="text-sm font-medium uppercase tracking-wide text-brand">
            Les données
          </span>
          <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
            De la donnée publique, un calcul transparent.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Toutes les sources sont publiques et officielles. Le moteur de calcul
            est déterministe : chaque chiffre financier est vérifiable, jamais
            produit par une IA.
          </p>
        </Reveal>
        <div className="mt-12">
          <SourcesMarquee />
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border py-24">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[1.4fr_0.6fr] md:items-end">
            <h2 className="font-sans text-4xl font-semibold tracking-[-0.02em] text-text md:text-5xl">
              Ajoute ton premier bien.
            </h2>
            <div className="md:justify-self-end md:text-right">
              <p className="mb-4 text-muted">Colle une adresse, on s’occupe du reste.</p>
              <MagneticButton href="/connexion" className="px-8 py-3.5">
                Commencer
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>
      </main>
    </>
  );
}
