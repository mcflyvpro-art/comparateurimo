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

export default function Home() {
  return (
    <>
      <Hero />

      {/* Sous le hero : fond clair (le header s'adapte : logo/texte sombres) */}
      <div className="section-light" data-header-theme="light">
      <main className="mx-auto max-w-[106rem] px-[6vw]">
      {/* Score */}
      <section id="score" className="scroll-mt-24 py-28 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20">
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
              Le score
            </span>
            <h2 className="h-lg mt-6 text-text">
              C’est <em className="not-italic text-brand">ton</em> score,
              <br className="hidden md:block" /> pas le nôtre.
            </h2>
            <p className="p-lead mt-8 max-w-xl text-muted">
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
      <section id="donnees" className="scroll-mt-24 border-t border-border py-28 lg:py-40">
        <Reveal>
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
            Les données
          </span>
          <h2 className="h-lg mt-6 max-w-4xl text-text">
            De la donnée publique, un calcul transparent.
          </h2>
          <p className="p-lead mt-8 max-w-2xl text-muted">
            Toutes les sources sont publiques et officielles. Le moteur de calcul
            est déterministe : chaque chiffre financier est vérifiable, jamais
            produit par une IA.
          </p>
        </Reveal>
        <div className="mt-16">
          <SourcesMarquee />
        </div>
      </section>
      </main>
      </div>

      {/* CTA final — dark plein format, « bookend » avec le hero */}
      <section
        data-header-theme="dark"
        className="bg-bg py-32 lg:py-44"
      >
        <div className="mx-auto max-w-[106rem] px-[6vw]">
          <Reveal>
            <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="h-display max-w-3xl text-text">
                Ajoute ton
                <br /> premier bien.
              </h2>
              <div className="lg:pb-4 lg:text-right">
                <p className="p-lead mb-6 max-w-sm text-muted lg:ml-auto">
                  Colle une adresse, on s’occupe du reste.
                </p>
                <MagneticButton href="/connexion" className="px-9 py-4">
                  Commencer
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
