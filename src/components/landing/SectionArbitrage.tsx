"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Feedback";
import { Chip } from "@/components/ui/Controls";
import { VerdictBlock } from "@/components/ui/Verdict";
import { verdictFromScore } from "@/lib/verdict";
import { cx } from "@/lib/cx";

/**
 * L'ARBITRAGE — le point culminant du produit, jouable sur la page d'accueil.
 *
 * Deux finalistes, trois critères, quatre profils de priorité. Changez de profil
 * et le gagnant bascule sous vos yeux : c'est la démonstration littérale de
 * « c'est votre score, pas le nôtre ».
 *
 * L'argument défensif est là aussi : un classement personnalisé n'est pas
 * contestable, parce qu'il n'a jamais prétendu être objectif. On affiche
 * d'ailleurs toujours la contribution de chaque critère — jamais de boîte noire.
 */

const CRITERES = [
  { key: "rendement", label: "Rendement" },
  { key: "securite", label: "Sécurité" },
  { key: "potentiel", label: "Potentiel" },
] as const;

type Critere = (typeof CRITERES)[number]["key"];

const PROFILS: {
  key: string;
  label: string;
  weights: Record<Critere, number>;
  verdict: (winner: string, loser: string) => string;
}[] = [
  {
    key: "rentabilite",
    label: "Rentabilité immédiate",
    weights: { rendement: 55, securite: 20, potentiel: 25 },
    verdict: (w, l) =>
      `${w} l'emporte : il dégage du revenu dès la première année, quand ${l} vous demande de patienter. Vous arbitrez le présent contre le futur — et vous avez choisi le présent.`,
  },
  {
    key: "equilibre",
    label: "Équilibré",
    weights: { rendement: 34, securite: 33, potentiel: 33 },
    verdict: (w, l) =>
      `${w} passe devant, mais de peu. À ce niveau d'écart, ${l} reste dans la course : allez visiter les deux, et laissez le terrain trancher ce que les chiffres ne tranchent pas.`,
  },
  {
    key: "patrimoine",
    label: "Patrimoine long terme",
    weights: { rendement: 25, securite: 25, potentiel: 50 },
    verdict: (w, l) =>
      `${w} l'emporte nettement : quartier en transformation, valorisation attendue supérieure. ${l} paiera mieux chaque mois, mais vaudra moins dans quinze ans.`,
  },
  {
    key: "securite",
    label: "Sécurité",
    weights: { rendement: 20, securite: 55, potentiel: 25 },
    verdict: (w, l) =>
      `${w} l'emporte : tension locative forte, copropriété saine, vacance faible. C'est le dossier qui vous fera le moins d'appels le dimanche soir — ${l} rapporte davantage, mais vous surveillerez.`,
  },
];

const BIENS = [
  {
    id: "a",
    name: "Guillotière",
    meta: "T3 · 68 m² · 245 000 €",
    scores: { rendement: 88, securite: 58, potentiel: 42 } as Record<Critere, number>,
    note: "Cash-flow positif dès la première année.",
  },
  {
    id: "b",
    name: "Croix-Rousse",
    meta: "T3 · 71 m² · 289 000 €",
    scores: { rendement: 49, securite: 70, potentiel: 78 } as Record<Critere, number>,
    note: "Secteur en tension, valorisation attendue.",
  },
];

function weighted(scores: Record<Critere, number>, weights: Record<Critere, number>) {
  return Math.round(
    CRITERES.reduce((sum, c) => sum + scores[c.key] * (weights[c.key] / 100), 0),
  );
}

export function SectionArbitrage() {
  const [profil, setProfil] = useState(PROFILS[1]);

  const results = BIENS.map((b) => ({ ...b, total: weighted(b.scores, profil.weights) }));
  const winner = results[0].total >= results[1].total ? results[0] : results[1];
  const loser = winner.id === results[0].id ? results[1] : results[0];
  const gap = Math.abs(results[0].total - results[1].total);

  return (
    <section
      id="arbitrage"
      data-header-theme="dark"
      className="border-t border-hairline py-28 lg:py-40"
    >
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
        <Reveal cine>
          <h2 className="t-display max-w-3xl text-text">
            C&apos;est votre score,
            <br />
            pas le nôtre.
          </h2>
          <p className="t-lead mt-8 max-w-xl">
            Le classement dépend de ce que vous cherchez. Changez de priorité : le gagnant
            bascule.
          </p>
        </Reveal>

        <Reveal cine delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-2">
            {PROFILS.map((p) => (
              <Chip
                key={p.key}
                active={p.key === profil.key}
                onClick={() => setProfil(p)}
              >
                {p.label}
              </Chip>
            ))}
          </div>

          {/* Les pondérations, toujours visibles */}
          <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2">
            {CRITERES.map((c) => (
              <span key={c.key} className="flex items-center gap-2.5">
                <span className="text-[11px] text-text-3">{c.label}</span>
                <span className="h-1 w-20 overflow-hidden rounded-full bg-ink-600">
                  <span
                    className="block h-full rounded-full bg-brand transition-[width] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ width: `${profil.weights[c.key]}%` }}
                  />
                </span>
                <span className="num w-8 text-[11px] text-text-2">
                  {profil.weights[c.key]} %
                </span>
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {results.map((b) => {
              const isWinner = b.id === winner.id;
              return (
                <article
                  key={b.id}
                  className={cx(
                    "relative rounded-lg border bg-surface p-6 transition-all duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isWinner ? "border-hairline-ember" : "border-hairline",
                  )}
                  style={
                    isWinner
                      ? { boxShadow: "0 0 60px -22px var(--brand-glow)" }
                      : { opacity: 0.72 }
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="t-head text-text">{b.name}</h3>
                      <p className="num mt-1 text-[11px] text-text-3">{b.meta}</p>
                    </div>
                    <span
                      className={cx(
                        "rounded-[2px] border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] transition-opacity duration-[420ms]",
                        isWinner
                          ? "border-hairline-ember text-brand opacity-100"
                          : "border-transparent opacity-0",
                      )}
                    >
                      Gagnant
                    </span>
                  </div>

                  <div className="mt-6">
                    <VerdictBlock score={b.total} compact />
                  </div>

                  <ul className="mt-6 flex flex-col gap-3 border-t border-hairline pt-5">
                    {CRITERES.map((c) => {
                      const raw = b.scores[c.key];
                      const contrib = (raw * profil.weights[c.key]) / 100;
                      return (
                        <li key={c.key} className="flex items-center gap-3">
                          <span className="w-20 shrink-0 text-[12px] text-text-3">
                            {c.label}
                          </span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-600">
                            <span
                              className="block h-full rounded-full transition-[width,background-color] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                              style={{
                                width: `${((contrib / 55) * 100).toFixed(2)}%`,
                                background: verdictFromScore(raw).color,
                              }}
                            />
                          </span>
                          <span
                            className="num w-8 shrink-0 text-right text-[12px]"
                            style={{ color: verdictFromScore(raw).color }}
                          >
                            {raw}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="mt-5 text-[12.5px] leading-relaxed text-text-3">{b.note}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-hairline bg-surface px-7 py-6">
            <p className="max-w-3xl text-[15px] leading-relaxed text-text">
              {profil.verdict(winner.name, loser.name)}
            </p>
            <p className="mt-3 text-[12.5px] text-text-4">
              Écart de <span className="num">{gap}</span> point{gap > 1 ? "s" : ""} sur 100.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
