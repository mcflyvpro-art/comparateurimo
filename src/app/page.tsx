import { SiteNav } from "@/components/landing/SiteNav";
import { Reveal } from "@/components/landing/Reveal";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { ScoreProfiles } from "@/components/landing/ScoreProfiles";
import { SourcesMarquee } from "@/components/landing/SourcesMarquee";
import { MagneticButton } from "@/components/landing/MagneticButton";

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
      <SiteNav />

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero — asymétrique, texte à gauche / carte flottante à droite */}
        <section className="grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <Reveal>
              <span className="text-sm font-medium uppercase tracking-wide text-brand">
                Comparateur immobilier d’investissement
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-5 font-sans text-4xl font-semibold leading-[1.03] tracking-[-0.03em] text-text md:text-6xl">
                Compare tes biens.
                <br />
                Laisse les chiffres trancher.
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
                Estio met tes annonces côte à côte, du point de vue de
                l’investissement. Une adresse suffit : elle déverrouille les
                données de marché, et le score reflète <em>tes</em> priorités.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <MagneticButton href="#">Ajouter un bien</MagneticButton>
                <MagneticButton href="#principe" variant="ghost">
                  Comment ça marche
                </MagneticButton>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-8 text-sm text-faint">
                Données open data · BAN · DVF · INSEE · Géorisques
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="flex justify-center lg:justify-end">
            <HeroVisual />
          </Reveal>
        </section>

        {/* Principe — zig-zag asymétrique (pas de rangée de 3 cartes) */}
        <section
          id="principe"
          className="scroll-mt-24 border-t border-border py-20 lg:py-28"
        >
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-wide text-brand">
              Le principe
            </span>
            <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
              L’adresse déverrouille 80 % de la donnée.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              Le formulaire est court parce que l’essentiel apparaît en
              résultat, pas en saisie. Trois niveaux se superposent.
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

        {/* Score — split asymétrique + démo interactive */}
        <section
          id="score"
          className="scroll-mt-24 border-t border-border py-20 lg:py-28"
        >
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <span className="text-sm font-medium uppercase tracking-wide text-brand">
                Le score
              </span>
              <h2 className="mt-4 font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
                C’est <em>ton</em> score, pas le nôtre.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Choisis un profil, ou règle finement les pondérations. Le score
                se recalcule en direct, et on affiche toujours le détail :
                pourquoi ce bien l’emporte, critère par critère. Jamais de boîte
                noire.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <ScoreProfiles />
            </Reveal>
          </div>
        </section>

        {/* Données — marquee plein cadre */}
        <section
          id="donnees"
          className="scroll-mt-24 border-t border-border py-20 lg:py-28"
        >
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-wide text-brand">
              Les données
            </span>
            <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
              De la donnée publique, un calcul transparent.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              Toutes les sources sont ouvertes et gratuites. Le moteur de calcul
              est déterministe : chaque chiffre financier est vérifiable, jamais
              produit par une IA.
            </p>
          </Reveal>
          <div className="mt-12">
            <SourcesMarquee />
          </div>
        </section>

        {/* CTA final — décentré (titre à gauche, action à droite) */}
        <section className="border-t border-border py-24">
          <Reveal>
            <div className="grid gap-8 md:grid-cols-[1.4fr_0.6fr] md:items-end">
              <h2 className="font-sans text-4xl font-semibold tracking-[-0.02em] text-text md:text-5xl">
                Ajoute ton premier bien.
              </h2>
              <div className="md:justify-self-end md:text-right">
                <p className="mb-4 text-muted">Colle une adresse, on s’occupe du reste.</p>
                <MagneticButton href="#" className="px-8 py-3.5">
                  Commencer
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <span className="font-sans text-lg font-semibold tracking-tight text-text">
            estio<span className="text-brand">.</span>
          </span>
          <span className="text-sm text-faint">
            Comparateur immobilier d’investissement · données open data
          </span>
        </div>
      </footer>
    </>
  );
}
