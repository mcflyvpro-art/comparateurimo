"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/ui/Feedback";
import { VerdictPill, VerdictBar } from "@/components/ui/Verdict";
import { verdictFromScore } from "@/lib/verdict";
import { toneCashflow, toneDpe, toneRendementNet } from "@/lib/tone";
import { IconBoard, IconMap, IconTable } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * L'OUTIL, EN VRAI.
 *
 * Une page produit qui ne montre pas le produit demande un acte de foi. Cette
 * section montre l'interface réelle, dans un cadre de navigateur, qui se
 * redresse au défilement — la caméra passe d'une vue de trois quarts à une vue
 * de face pendant qu'on descend.
 *
 * Choix technique important : ce ne sont pas des captures d'écran mais des
 * MINIATURES VIVANTES, construites avec les composants du produit
 * (`VerdictPill`, `VerdictBar`, les mêmes teintes, la même typographie). Elles
 * ne pourront donc jamais dater d'une version antérieure de l'interface. Le
 * jour où l'on préférera de vraies captures, il suffira de remplacer le
 * contenu du cadre par une image — l'ossature est prête.
 */

/* -------------------------------------------------------------------------- */

function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-xl border border-line bg-sunken",
        "shadow-[0_60px_140px_-40px_rgb(0_0_0/0.9)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="num mx-auto rounded-sm bg-canvas px-3 py-1 text-[11px] text-text-4">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * Cadre qui se redresse au défilement : de trois quarts, réduit et estompé, à
 * plat, net et à l'échelle. Le geste est celui d'un objet qu'on pose devant soi.
 */
function TiltReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.35"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.25, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  if (reduce) return <div ref={ref}>{children}</div>;

  return (
    <div ref={ref} style={{ perspective: 1800 }}>
      <motion.div style={{ rotateX, scale, opacity, y, transformOrigin: "center top" }}>
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const BOARD = [
  {
    stage: "À analyser",
    cards: [
      { addr: "12 rue Sébastien Gryphe", city: "Lyon 7ᵉ", price: "205 000 €", score: 44 },
      { addr: "8 cours Gambetta", city: "Lyon 3ᵉ", price: "248 000 €", score: 71 },
      { addr: "31 rue Duguesclin", city: "Lyon 6ᵉ", price: "319 000 €", score: 28 },
    ],
  },
  {
    stage: "Analysé",
    cards: [
      { addr: "5 rue Pasteur", city: "Villeurbanne", price: "189 000 €", score: 78 },
      { addr: "22 avenue Berthelot", city: "Lyon 7ᵉ", price: "262 000 €", score: 51 },
    ],
  },
  {
    stage: "Visite",
    cards: [
      { addr: "17 rue de Marseille", city: "Lyon 7ᵉ", price: "234 000 €", score: 66 },
      { addr: "3 place Guichard", city: "Lyon 3ᵉ", price: "279 000 €", score: 38 },
    ],
  },
  {
    stage: "En négo",
    cards: [{ addr: "44 rue Bugeaud", city: "Lyon 6ᵉ", price: "296 000 €", score: 74 }],
  },
  {
    stage: "Offre",
    cards: [{ addr: "9 rue Chevreul", city: "Lyon 7ᵉ", price: "241 000 €", score: 82 }],
  },
];

function BoardMiniature() {
  return (
    <div className="flex h-[27rem] bg-canvas">
      {/* Rail latéral */}
      <div className="hidden w-40 shrink-0 flex-col border-r border-line-soft bg-sunken p-3 sm:flex">
        <div className="mb-5 h-4 w-14 rounded-sm bg-surface-active" />
        <div className="mb-4 h-7 rounded-sm border border-line" />
        <p className="mb-2 px-1 text-[10px] text-text-4">Projets</p>
        {["T2/T3 Lyon locatif", "Studio étudiant", "Immeuble Villeurbanne"].map((p, i) => (
          <div
            key={p}
            className={cx(
              "relative mb-0.5 flex items-center justify-between rounded-sm px-2 py-1.5",
              i === 0 && "bg-surface-hover",
            )}
          >
            {i === 0 && (
              <span className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-accent" />
            )}
            <span
              className={cx(
                "truncate text-[10.5px]",
                i === 0 ? "text-text" : "text-text-3",
              )}
            >
              {p}
            </span>
            <span className="num text-[9px] text-text-4">{[9, 4, 2][i]}</span>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre de projet */}
        <div className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5">
          <span className="text-[12px] font-medium text-text">T2/T3 Lyon locatif</span>
          <span className="h-3 w-px bg-line" />
          <span className="num text-[10px] text-text-3">≤ 250 000 € · cash-flow ≥ 0</span>
          <span className="ml-auto rounded-sm bg-accent px-2.5 py-1 text-[10.5px] font-medium text-ink-fg">
            + Ajouter un bien
          </span>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-1 border-b border-line-soft px-4">
          {[
            { l: "Pipeline", i: <IconBoard size={11} /> },
            { l: "Tableau", i: <IconTable size={11} /> },
            { l: "Carte", i: <IconMap size={11} /> },
          ].map((t, i) => (
            <span
              key={t.l}
              className={cx(
                "relative flex items-center gap-1.5 px-2.5 py-2 text-[11px]",
                i === 0 ? "text-text" : "text-text-4",
              )}
            >
              {t.i}
              {t.l}
              {i === 0 && (
                <span className="absolute inset-x-2 -bottom-px h-px bg-accent" />
              )}
            </span>
          ))}
        </div>

        {/* Colonnes */}
        <div className="flex flex-1 gap-2.5 overflow-hidden p-3.5">
          {BOARD.map((col) => (
            <div key={col.stage} className="flex w-[10.5rem] shrink-0 flex-col">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-[10.5px] font-medium text-text-2">{col.stage}</span>
                <span className="num text-[9px] text-text-4">{col.cards.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {col.cards.map((c) => (
                  <div
                    key={c.addr}
                    className="rounded-md border border-line-soft bg-surface p-2.5"
                  >
                    <p className="truncate text-[10.5px] font-medium text-text">
                      {c.addr}
                    </p>
                    <p className="num truncate text-[9.5px] text-text-3">{c.city}</p>
                    <p className="num mt-2 text-[12.5px] text-text">{c.price}</p>
                    <div className="mt-2">
                      <VerdictPill score={c.score} className="!px-1.5 !text-[9.5px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const FICHE_STATS = [
  { label: "Prix affiché", value: "241 000 €", tone: undefined },
  { label: "Prix au m²", value: "3 543 €", tone: undefined },
  { label: "Rendement après impôt", value: "4,2 %", tone: toneRendementNet(4.2) },
  { label: "Trésorerie mensuelle", value: "+ 38 €", tone: toneCashflow(38) },
];

function FicheMiniature() {
  const v = verdictFromScore(82);

  return (
    <div className="grid gap-4 bg-canvas p-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="flex flex-col gap-4">
        {/* Verdict */}
        <div className="rounded-lg border border-line-soft bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[19px] font-medium tracking-[-0.02em]" style={{ color: v.color }}>
              {v.label}
            </span>
            <span className="num text-[12px] text-text-3">
              <span className="text-text-2">82</span> / 100
            </span>
          </div>
          <VerdictBar score={82} height={5} className="mt-3" />
          <p className="mt-3.5 text-[12px] leading-relaxed text-text-2">{v.advice}</p>

          <div className="mt-5 grid grid-cols-4 gap-4 border-t border-line-soft pt-5">
            {FICHE_STATS.map((s) => (
              <div key={s.label}>
                <p className="truncate text-[10px] text-text-3">{s.label}</p>
                <p className="num mt-1 text-[15px]" style={{ color: s.tone ?? "var(--text)" }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Le marché */}
        <div className="rounded-lg border border-line-soft bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-text">Le marché autour</span>
            <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--info)" }}>
              <span className="h-1 w-1 rounded-full bg-current" />
              Données publiques
            </span>
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-text">
            Ce bien est affiché{" "}
            <strong className="font-medium" style={{ color: "var(--good)" }}>
              6 % en dessous
            </strong>{" "}
            du prix au mètre carré du secteur.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { l: "Prix au m² du secteur", v: "3 770 €", t: undefined },
              { l: "Loyer du secteur", v: "13 € / m²", t: undefined },
              { l: "Tension locative", v: "Forte", t: "var(--good)" },
              { l: "Diagnostic énergétique", v: "C", t: toneDpe("C") },
              { l: "Surface habitable", v: "68 m²", t: undefined },
              { l: "Charges copro", v: "94 € / mois", t: undefined },
            ].map((s) => (
              <div key={s.l}>
                <p className="truncate text-[10px] text-text-3">{s.l}</p>
                <p className="num mt-1 text-[12.5px]" style={{ color: s.t ?? "var(--text)" }}>
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rail d'hypothèses */}
      <div className="rounded-lg border border-line-soft bg-surface p-5">
        <p className="text-[13px] font-medium text-text">Vos hypothèses</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-text-3">
          Bougez un curseur : tout se recalcule.
        </p>
        <div className="mt-5 flex flex-col gap-5">
          {[
            { l: "Apport", v: "15 %", fill: 33 },
            { l: "Taux d'intérêt", v: "3,40 %", fill: 42 },
            { l: "Durée du prêt", v: "20 ans", fill: 60 },
          ].map((s) => (
            <div key={s.l}>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-text-2">{s.l}</span>
                <span className="num text-[11.5px] font-medium text-text">{s.v}</span>
              </div>
              <div className="relative mt-2 h-1 rounded-full bg-surface-active">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${s.fill}%` }}
                />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--text)]"
                  style={{ left: `calc(${s.fill}% - 6px)` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-line-soft pt-4">
          <span className="text-[11px] text-text-3">Réglages avancés</span>
          <span className="num ml-auto text-[10px] text-text-4">16</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function ProductShowcase() {
  return (
    <section
      id="outil"
      data-header-theme="dark"
      className="border-t border-line-soft py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
        <Reveal cine>
          <h2 className="t-display max-w-3xl text-text">
            Voilà à quoi
            <br />
            ça ressemble.
          </h2>
          <p className="t-lead mt-8 max-w-xl">
            Pas de capture retouchée : ce sont les composants réels de
            l&apos;application, avec ses vraies couleurs et sa vraie densité.
          </p>
        </Reveal>

        <div className="mt-16">
          <TiltReveal>
            <BrowserFrame url="estio.immo/app/p/lyon-locatif">
              <BoardMiniature />
            </BrowserFrame>
          </TiltReveal>

          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
              <Caption title="Le board" body="Six étapes réelles, du repérage à l'offre." />
              <Caption
                title="Le verdict"
                body="Un mot avant un chiffre, sur chaque carte."
              />
              <Caption
                title="La mémoire"
                body="Vos notes et la raison de chaque abandon."
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-28">
          <Reveal cine>
            <h3 className="t-title max-w-2xl text-text">
              Et la fiche qui décide.
            </h3>
            <p className="t-lead mt-6 max-w-xl">
              Le verdict en français, quatre chiffres, trois curseurs. Le reste est rangé,
              pas caché.
            </p>
          </Reveal>

          <div className="mt-12">
            <TiltReveal>
              <BrowserFrame url="estio.immo/app/p/lyon-locatif/bien/chevreul">
                <FicheMiniature />
              </BrowserFrame>
            </TiltReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Caption({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-[16rem]">
      <div className="mb-2 h-px w-8 bg-accent" />
      <p className="text-[13.5px] font-medium text-text">{title}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-text-3">{body}</p>
    </div>
  );
}
