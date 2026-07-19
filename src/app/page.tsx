import { SiteNav } from "@/components/landing/SiteNav";
import { Reveal } from "@/components/landing/Reveal";
import { PropertyCardDemo } from "@/components/landing/PropertyCardDemo";

const niveaux = [
  {
    n: "N1",
    titre: "Le bien",
    texte:
      "Tu saisis l'essentiel : adresse, prix, surface, DPE. Huit champs, pas une page entière à recopier.",
  },
  {
    n: "N2",
    titre: "Le marché",
    texte:
      "Déduit automatiquement de l'adresse : prix/m² réel (DVF), loyer estimé, tension locative, risques naturels.",
  },
  {
    n: "N3",
    titre: "Les scénarios",
    texte:
      "Tu règles l'apport, l'emprunt, la stratégie et l'horizon. Le moteur calcule rendement, cash-flow et TRI.",
  },
];

const profils = [
  "Rentabilité immédiate",
  "Patrimoine long terme",
  "Sécurité",
  "Équilibré",
];

const sources = [
  "BAN — adresses",
  "DVF — prix réels",
  "Carte des loyers",
  "INSEE — tension & vacance",
  "Géorisques",
  "ADEME — DPE",
];

export default function Home() {
  return (
    <>
      <SiteNav />

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="grid items-center gap-14 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div>
            <Reveal>
              <span className="text-sm font-medium uppercase tracking-wide text-brand">
                Comparateur immobilier d’investissement
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-5 font-sans text-5xl font-semibold leading-[1.04] tracking-[-0.03em] text-text sm:text-6xl">
                Compare tes biens.
                <br />
                Laisse les chiffres trancher.
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Estio met tes annonces côte à côte, du point de vue de
                l’investissement. Une adresse suffit : elle déverrouille les
                données de marché, et le score reflète <em>tes</em> priorités.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#"
                  className="rounded-full bg-brand px-6 py-3 text-center font-medium text-white transition-[transform,background-color] duration-100 hover:bg-brand-hover active:scale-[0.97]"
                >
                  Ajouter un bien
                </a>
                <a
                  href="#principe"
                  className="rounded-full border border-border bg-bg-elevated px-6 py-3 text-center font-medium text-text transition-[transform,border-color] duration-100 hover:border-faint active:scale-[0.97]"
                >
                  Comment ça marche
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-8 text-sm text-faint">
                Données open data · BAN · DVF · INSEE · Géorisques
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="flex justify-center lg:justify-end">
            <PropertyCardDemo />
          </Reveal>
        </section>

        {/* Principe — 3 niveaux */}
        <section id="principe" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-wide text-brand">
              Le principe
            </span>
            <h2 className="mt-4 max-w-2xl font-sans text-4xl font-semibold tracking-[-0.02em] text-text">
              L’adresse déverrouille 80 % de la donnée.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              Le formulaire est court parce que l’essentiel apparaît en
              résultat, pas en saisie. Trois niveaux se superposent.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {niveaux.map((niv, i) => (
              <Reveal key={niv.n} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-border bg-bg-elevated p-6 shadow-sm">
                  <div className="flex size-11 items-center justify-center rounded-md bg-bg-alt font-sans text-sm font-bold text-brand">
                    {niv.n}
                  </div>
                  <h3 className="mt-5 font-sans text-xl font-semibold tracking-tight text-text">
                    {niv.titre}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted">{niv.texte}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Score */}
        <section id="score" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <span className="text-sm font-medium uppercase tracking-wide text-brand">
                Le score
              </span>
              <h2 className="mt-4 font-sans text-4xl font-semibold tracking-[-0.02em] text-text">
                C’est <em>ton</em> score, pas le nôtre.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Tu choisis un profil, ou tu règles finement les pondérations —
                elles se normalisent à 100 %. Et on affiche toujours le détail :
                pourquoi ce bien l’emporte, critère par critère. Jamais de boîte
                noire.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-xl border border-border bg-bg-elevated p-6 shadow-sm">
                <div className="text-sm text-faint">Profils préréglés</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profils.map((p, i) => (
                    <span
                      key={p}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        i === 3
                          ? "bg-brand text-white"
                          : "bg-bg-alt text-text"
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { label: "Rendement", val: "35 %", w: "35%" },
                    { label: "Sécurité", val: "40 %", w: "40%" },
                    { label: "Potentiel", val: "25 %", w: "25%" },
                  ].map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between text-sm text-muted">
                        <span>{c.label}</span>
                        <span className="font-medium text-text">{c.val}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-alt">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-brand"
                          style={{ width: c.w }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Données */}
        <section id="donnees" className="scroll-mt-24 border-t border-border py-20 lg:py-28">
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-wide text-brand">
              Les données
            </span>
            <h2 className="mt-4 max-w-2xl font-sans text-4xl font-semibold tracking-[-0.02em] text-text">
              De la donnée publique, un calcul transparent.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              Toutes les sources sont ouvertes et gratuites. Le moteur de calcul
              est déterministe : chaque chiffre financier est vérifiable, jamais
              produit par une IA.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-3">
            {sources.map((s, i) => (
              <Reveal key={s} delay={i * 0.05}>
                <span className="rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm text-text">
                  {s}
                </span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-border py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-sans text-4xl font-semibold tracking-[-0.02em] text-text sm:text-5xl">
              Ajoute ton premier bien.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Colle une adresse, on s’occupe du reste.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="#"
                className="rounded-full bg-brand px-8 py-3.5 font-medium text-white transition-[transform,background-color] duration-100 hover:bg-brand-hover active:scale-[0.97]"
              >
                Commencer
              </a>
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
