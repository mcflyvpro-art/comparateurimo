"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Section « pin 600vh » — effet signature speedy.io (n°6).
 *
 * On épingle (`pin`) une scène plein écran pendant que l'utilisateur scrolle
 * sur 600vh : les trois niveaux de donnée (N1 le bien / N2 le marché /
 * N3 les scénarios) se remplacent en titres géants, façon slides fixes.
 *
 * Techniquement : ScrollTrigger épingle `.pin-stage` du haut au bas de la
 * section ; une timeline scrubbée enchaîne le fondu/translation des panneaux.
 * Guardé reduced-motion : fallback empilé statique, sans pin ni scroll-jack.
 */

const niveaux = [
  {
    n: "01",
    tag: "N1 · Le bien",
    titre: "L’adresse",
    texte:
      "Tu saisis l’essentiel — adresse, prix, surface, DPE. Huit champs, pas une page entière à recopier.",
  },
  {
    n: "02",
    tag: "N2 · Le marché",
    titre: "Le marché",
    texte:
      "Déduit de l’adresse : prix/m² notarié, loyer estimé, tension locative, risques naturels et technologiques.",
  },
  {
    n: "03",
    tag: "N3 · Les scénarios",
    titre: "Les scénarios",
    texte:
      "Tu règles l’apport, l’emprunt, la stratégie et l’horizon. Le moteur calcule rendement, cash-flow et TRI.",
  },
];

export function PinnedNiveaux() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const idxRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (reduce || !section || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".pin-panel");

      // État initial : seul le premier panneau est visible.
      gsap.set(panels[0], { autoAlpha: 1, yPercent: 0 });
      gsap.set(panels.slice(1), { autoAlpha: 0, yPercent: 10 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          pin: stage,
          pinSpacing: true,
          onUpdate: (self) => {
            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${self.progress})`;
            }
            if (idxRef.current) {
              const i = Math.min(
                niveaux.length - 1,
                Math.floor(self.progress * niveaux.length),
              );
              idxRef.current.textContent = niveaux[i].n;
            }
          },
        },
        defaults: { ease: "power2.inOut" },
      });

      // Enchaînement : le panneau sortant monte et s'efface, l'entrant arrive.
      for (let i = 1; i < panels.length; i++) {
        tl.to(panels[i - 1], { autoAlpha: 0, yPercent: -10, duration: 1 }, i)
          .to(panels[i], { autoAlpha: 1, yPercent: 0, duration: 1 }, i);
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="principe"
      data-header-theme="dark"
      className="relative h-[600vh] bg-bg"
    >
      {/* Scène épinglée plein écran */}
      <div
        ref={stageRef}
        className="pin-stage flex h-[100svh] w-full flex-col overflow-hidden"
      >
        <div className="mx-auto flex w-full max-w-[106rem] flex-1 flex-col justify-center px-[6vw] py-24">
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
            Le principe · trois niveaux de donnée
          </span>

          {/* Pile de panneaux — superposés, un seul visible à la fois */}
          <div className="relative mt-8 min-h-[46svh] md:min-h-[52svh]">
            {niveaux.map((niv) => (
              <div
                key={niv.n}
                className="pin-panel absolute inset-0 flex flex-col justify-center"
              >
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-faint">
                  {niv.tag}
                </span>
                <h2 className="h-display mt-3 text-text">{niv.titre}</h2>
                <p className="p-lead mt-6 max-w-xl text-muted">{niv.texte}</p>
              </div>
            ))}
          </div>

          {/* Compteur + barre de progression */}
          <div className="mt-auto flex items-center gap-5 pt-10">
            <span className="font-sans text-lg tabular-nums text-text">
              <span ref={idxRef}>01</span>
              <span className="text-faint"> / {niveaux.length.toString().padStart(2, "0")}</span>
            </span>
            <span className="relative h-px flex-1 overflow-hidden bg-white/15">
              <span
                ref={barRef}
                className="absolute inset-0 origin-left bg-text"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
