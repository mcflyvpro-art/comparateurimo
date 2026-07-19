import type { Metadata } from "next";
import { Reveal } from "@/components/landing/Reveal";
import { Hero } from "@/components/landing/Hero";
import { PinnedNiveaux } from "@/components/landing/PinnedNiveaux";
import { ScoreProfiles } from "@/components/landing/ScoreProfiles";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";
import { MagneticButton } from "@/components/landing/MagneticButton";

export const metadata: Metadata = {
  title: "Estio — comparateur immobilier d’investissement",
  description:
    "Compare tes biens immobiliers côte à côte, du point de vue de l’investissement. Une adresse déverrouille les données de marché, et le score reflète tes priorités.",
};

export default function Home() {
  return (
    <>
      <Hero />

      {/* Principe — section « pin 600vh » dark (effet signature) */}
      <PinnedNiveaux />

      {/* Sous le pin : fond clair (le header s'adapte : logo/texte sombres) */}
      <div className="section-light" data-header-theme="light">
      <main className="mx-auto max-w-6xl px-6">
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
      </div>
    </>
  );
}
