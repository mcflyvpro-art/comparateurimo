"use client";

import { Reveal } from "@/components/ui/Feedback";

/**
 * Les trois niveaux de données.
 *
 * En v1, cette section enseignait un code couleur (ivoire / givre / braise) que
 * l'utilisateur devait retenir pour lire l'outil. Ce code a disparu — il
 * demandait un apprentissage pour une information que le contexte donne déjà.
 *
 * Le concept, lui, reste : il explique pourquoi Estio ne périme jamais. Réduit
 * à trois cartes de trois lignes.
 */

const LEVELS = [
  {
    n: "01",
    name: "Le bien",
    lede: "Ce que vous saisissez.",
    body: "Adresse, prix, surface, note énergétique. Une dizaine de champs, souvent extraits d'une capture. C'est la seule chose qu'Estio conserve.",
    color: "var(--text-3)",
  },
  {
    n: "02",
    name: "Le marché",
    lede: "Ce que l'adresse déverrouille.",
    body: "Prix au mètre carré du secteur, loyers observés, tension locative, risques. Rien à saisir : tout est dérivé de l'adresse et recalculé à chaque ouverture.",
    color: "var(--info)",
  },
  {
    n: "03",
    name: "Vos hypothèses",
    lede: "Ce qui rend le verdict vôtre.",
    body: "Apport, taux, durée, fiscalité. C'est ce qui fait que deux personnes n'ont pas le même verdict sur la même annonce.",
    color: "var(--brand)",
  },
];

export function SectionLevels() {
  return (
    <section
      id="niveaux"
      data-header-theme="dark"
      className="border-t border-hairline py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
        <Reveal cine>
          <h2 className="t-display max-w-3xl text-text">
            Estio ne stocke jamais
            <br />
            une analyse.
          </h2>
          <p className="t-lead mt-8 max-w-xl">
            Seulement le bien. Le reste se recalcule à chaque ouverture, contre les
            données du jour. Un dossier rouvert trois mois plus tard n&apos;est donc
            jamais périmé.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {LEVELS.map((lvl, i) => (
            <Reveal key={lvl.n} cine delay={0.07 * i}>
              <article className="h-full overflow-hidden rounded-lg border border-hairline bg-surface">
                <span
                  className="block h-[3px] w-full"
                  style={{ background: lvl.color }}
                  aria-hidden
                />
                <div className="p-7">
                  <span className="num text-[12px]" style={{ color: lvl.color }}>
                    {lvl.n}
                  </span>
                  <h3 className="t-head mt-4 text-text">{lvl.name}</h3>
                  <p className="mt-3 text-[14px] text-text-2">{lvl.lede}</p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-text-3">
                    {lvl.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
