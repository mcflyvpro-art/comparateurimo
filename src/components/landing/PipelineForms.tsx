"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STATUS_COLUMNS } from "@/lib/pipeline-types";
import { VERDICT_HEX, type VerdictLevel } from "@/lib/verdict";

/**
 * LE PIPELINE SE FORME — la scène épinglée de la vitrine.
 *
 * On entre dans la section sur un désordre : quarante biens éparpillés, flous,
 * de travers. C'est l'état réel d'une recherche immobilière — Trello d'un côté,
 * un tableur de l'autre, quinze onglets ouverts.
 *
 * À mesure qu'on défile, chaque carte se redresse, se cale nette et rejoint sa
 * colonne. Le board apparaît par soustraction du chaos, et sa température monte
 * de gauche à droite. On n'explique pas le produit : on le fait advenir.
 *
 * Mécanique : la section fait 420 vh, la scène est collante, et une timeline
 * GSAP scrubbée joue un `from` — le DOM est déjà dans son état final, on ne fait
 * que remonter le temps. Robuste au redimensionnement, et le repli en mouvement
 * réduit est simplement le board, immobile et lisible.
 */

/** Dispersion déterministe : même désordre à chaque visite, donc même image. */
function hash(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Combien de biens dans chaque colonne, dans l'ordre du pipeline. */
const COLUMN_SIZES = [7, 5, 4, 3, 4, 2];

const BEATS = [
  {
    kicker: "Aujourd'hui",
    title: "Quinze onglets, un tableur, un Trello.",
    body: "Deux cents annonces en quatre mois, une vingtaine retenues, et aucune mémoire de ce qu'on a écarté ni pourquoi.",
  },
  {
    kicker: "Avec Estio",
    title: "Chaque bien trouve sa place.",
    body: "À analyser, analysé, visite, négo, offre. Les étapes réelles d'un achat, pas des colonnes à nommer soi-même.",
  },
  {
    kicker: "Et rien ne se perd",
    title: "Le pipeline se souvient.",
    body: "Vos notes, votre prix maximum, la raison de chaque abandon. Un bien écarté ne se réanalyse jamais deux fois.",
  },
];

export function PipelineForms() {
  const sectionRef = useRef<HTMLElement>(null);
  const [beat, setBeat] = useState(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    let last = 0;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".pf-card");
      const heads = gsap.utils.toArray<HTMLElement>(".pf-head");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.75,
          onUpdate: (self) => {
            const idx = Math.min(BEATS.length - 1, Math.floor(self.progress * BEATS.length));
            if (idx !== last) {
              last = idx;
              setBeat(idx);
            }
          },
        },
      });

      // Le désordre initial : on remonte le temps depuis le board final.
      tl.from(
        cards,
        {
          x: (i) => (hash(i, 1) - 0.5) * 520,
          y: (i) => (hash(i, 2) - 0.5) * 460,
          rotate: (i) => (hash(i, 3) - 0.5) * 34,
          scale: (i) => 0.86 + hash(i, 4) * 0.3,
          filter: "blur(11px)",
          opacity: 0.22,
          ease: "power2.inOut",
          duration: 1,
          stagger: { amount: 0.55, from: "random" },
        },
        0,
      );

      // Les en-têtes de colonne ne se posent qu'une fois le tri accompli.
      tl.from(
        heads,
        {
          opacity: 0,
          y: -10,
          filter: "blur(6px)",
          ease: "power2.out",
          duration: 0.35,
          stagger: 0.05,
        },
        0.55,
      );
    }, section);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={sectionRef}
      id="pipeline"
      data-header-theme="dark"
      className={reduce ? "relative" : "relative h-[420vh]"}
    >
      <div className="sticky top-0 flex h-[100svh] w-full items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[104rem] items-center gap-12 px-[var(--gutter)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Le propos */}
          <div className="relative min-h-[16rem]">
            {BEATS.map((b, i) => (
              <div
                key={b.title}
                className="transition-[opacity,filter,transform] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center"
                style={
                  reduce
                    ? { marginBottom: "3rem" }
                    : {
                        opacity: beat === i ? 1 : 0,
                        filter: beat === i ? "blur(0px)" : "blur(8px)",
                        transform: beat === i ? "none" : "translateY(14px)",
                        pointerEvents: beat === i ? "auto" : "none",
                      }
                }
              >
                <span className="t-label text-brand">{b.kicker}</span>
                <h2 className="t-title mt-4 max-w-lg text-text">{b.title}</h2>
                <p className="t-lead mt-5 max-w-md">{b.body}</p>
              </div>
            ))}
          </div>

          {/* Le board */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-2.5">
            {STATUS_COLUMNS.map((col, ci) => (
              <div key={col.key} className="flex flex-col">
                <div className="pf-head mb-2.5">
                  <span className="block truncate text-[11px] text-text-3">
                    {col.label}
                  </span>
                  <span className="mt-1.5 block h-px w-full bg-hairline-2" />
                </div>

                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: COLUMN_SIZES[ci] }, (_, ri) => (
                    <MiniCard key={ri} column={ci} row={ri} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Carte abstraite : assez détaillée pour qu'on reconnaisse une carte de bien,
 * assez muette pour qu'on ne cherche pas à la lire.
 *
 * Elle porte son verdict, exactement comme la vraie. Et comme dans une vraie
 * recherche, les biens qui avancent dans le pipeline sont majoritairement les
 * bons : la proportion de vert augmente vers la droite. Ce n'est pas un effet,
 * c'est ce que raconte un board réel.
 */
function MiniCard({ column, row }: { column: number; row: number }) {
  const seed = hash(column * 17 + row, 9);
  // Toute largeur en pourcentage est arrondie : un flottant brut se sérialise
  // différemment côté serveur et côté client, et casse l'hydratation React.
  const pct = (v: number) => `${v.toFixed(2)}%`;

  const biais = column * 0.16;
  const niveau: VerdictLevel =
    seed + biais > 0.72 ? "good" : seed + biais > 0.34 ? "mid" : "risk";
  const teinte = VERDICT_HEX[niveau];

  return (
    <div className="pf-card rounded-sm border border-hairline bg-surface p-2">
      <span
        className="block h-[3px] rounded-full bg-bone-400/40"
        style={{ width: pct(58 + seed * 34) }}
      />
      <span
        className="mt-1.5 block h-[3px] rounded-full bg-bone-400/18"
        style={{ width: pct(34 + seed * 24) }}
      />
      <span className="mt-2 flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: teinte }}
        />
        <span
          className="block h-[3px] flex-1 rounded-full"
          style={{
            width: pct((0.3 + seed * 0.45) * 100),
            background: `color-mix(in srgb, ${teinte} 45%, transparent)`,
          }}
        />
      </span>
    </div>
  );
}
