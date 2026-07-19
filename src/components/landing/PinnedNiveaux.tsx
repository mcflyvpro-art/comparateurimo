"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Lit `prefers-reduced-motion` sans setState-in-effect (SSR-safe → false). */
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

/**
 * Section « pin 600vh » — reproduction fidèle du scroll signature speedy.io
 * (bloc `block-save-time`). Fond clair, une scène sticky plein écran, et
 * cinq étapes qui se fondent au scroll :
 *
 *   stepper vertical (gauche)  ·  gros titre + icône + texte (centre)
 *   ·  aperçu de l'outil (droite, placeholder → vrais screens plus tard)
 *
 * Mécanique : la section fait 600vh ; `.pin-stage` est `sticky` (100vh) donc
 * épinglée du haut au bas de la section. Une timeline GSAP scrubbée sur le
 * scroll de la section crossfade les panneaux et pilote le stepper.
 * Guardé reduced-motion : rendu empilé statique, sans sticky ni scroll-jack.
 */

type Etape = {
  label: string; // stepper (court)
  titre: string; // gros titre centre
  texte: string; // paragraphe
};

const etapes: Etape[] = [
  {
    label: "Le formulaire",
    titre: "Renseigne ton bien",
    texte:
      "Quelques champs — adresse, prix, surface, DPE. L’adresse suffit à déverrouiller l’essentiel.",
  },
  {
    label: "L’analyse",
    titre: "On analyse le bien",
    texte:
      "Prix/m² notarié, loyer estimé, tension locative, risques : le marché apparaît tout autour de ton bien.",
  },
  {
    label: "La comparaison",
    titre: "Compare côte à côte",
    texte:
      "Plusieurs biens alignés, critère par critère. Le meilleur ressort sur chaque ligne, sans effort.",
  },
  {
    label: "Ton score",
    titre: "C’est ta note",
    texte:
      "Le score se règle sur tes besoins. Pondérations transparentes, détaillées — jamais de boîte noire.",
  },
  {
    label: "La décision",
    titre: "Décide où investir",
    texte:
      "Rendement, cash-flow, TRI, fiscalité : tu tranches avec des chiffres exacts, pas au feeling.",
  },
];

export function PinnedNiveaux() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    gsap.registerPlugin(ScrollTrigger);
    let lastIdx = 0;

    const ctx = gsap.context(() => {
      const texts = gsap.utils.toArray<HTMLElement>(".pin-text");
      const visuals = gsap.utils.toArray<HTMLElement>(".pin-visual");
      const n = etapes.length;

      // État initial : seule la 1re étape est visible.
      gsap.set(texts.slice(1), { autoAlpha: 0, yPercent: 8 });
      gsap.set(visuals.slice(1), { autoAlpha: 0, scale: 0.97 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleY(${self.progress})`;
            }
            const idx = Math.min(n - 1, Math.floor(self.progress * n));
            if (idx !== lastIdx) {
              lastIdx = idx;
              setActive(idx);
            }
          },
        },
      });

      // Enchaînement crossfade + petit temps de pause sur chaque étape.
      for (let i = 1; i < n; i++) {
        tl.to(texts[i - 1], { autoAlpha: 0, yPercent: -8, duration: 0.5 })
          .to(visuals[i - 1], { autoAlpha: 0, scale: 1.02, duration: 0.5 }, "<")
          .to(texts[i], { autoAlpha: 1, yPercent: 0, duration: 0.5 }, "<0.15")
          .to(visuals[i], { autoAlpha: 1, scale: 1, duration: 0.5 }, "<")
          .to({}, { duration: 0.6 }); // dwell
      }
    }, section);

    return () => ctx.revert();
  }, [reduce]);

  // ---- Fallback reduced-motion : liste statique empilée ----
  if (reduce) {
    return (
      <section
        className="section-light"
        data-header-theme="light"
        id="principe"
      >
        <div className="mx-auto max-w-4xl px-6 py-24">
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
            De l’annonce à la décision
          </span>
          <div className="mt-10 flex flex-col gap-14">
            {etapes.map((e, i) => (
              <div key={e.label}>
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-faint">
                  {String(i + 1).padStart(2, "0")} · {e.label}
                </span>
                <h2 className="h-md mt-2 text-text">{e.titre}</h2>
                <p className="p-lead mt-4 max-w-xl text-muted">{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="principe"
      data-header-theme="light"
      className="section-light relative h-[600vh]"
    >
      {/* Scène épinglée plein écran (sticky) */}
      <div
        ref={stageRef}
        className="pin-stage sticky top-0 flex h-[100svh] w-full items-center overflow-hidden"
      >
        <div className="mx-auto grid w-full max-w-[106rem] grid-cols-1 items-center gap-10 px-[6vw] lg:grid-cols-[auto_1.1fr_0.9fr] lg:gap-14">
          {/* Colonne 1 — stepper vertical */}
          <nav aria-hidden className="relative hidden lg:block">
            {/* rail + remplissage progressif */}
            <span className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
            <span
              ref={fillRef}
              className="absolute left-[5px] top-2 bottom-2 w-px origin-top bg-text"
              style={{ transform: "scaleY(0)" }}
            />
            <ul className="flex flex-col gap-7 pl-6">
              {etapes.map((e, i) => (
                <li
                  key={e.label}
                  className={`relative text-sm leading-tight transition-colors duration-300 ${
                    i === active ? "font-medium text-text" : "text-faint"
                  }`}
                >
                  <span
                    className={`absolute -left-6 top-1 h-[11px] w-[11px] rounded-full border transition-colors duration-300 ${
                      i === active
                        ? "border-text bg-text"
                        : "border-border-strong bg-transparent"
                    }`}
                  />
                  {e.label}
                </li>
              ))}
            </ul>
          </nav>

          {/* Colonne 2 — titres empilés (crossfade) */}
          <div className="relative min-h-[42svh]">
            {etapes.map((e, i) => (
              <div
                key={e.label}
                className="pin-text absolute inset-0 flex flex-col justify-center"
              >
                <span className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-brand lg:hidden">
                  {String(i + 1).padStart(2, "0")} · {e.label}
                </span>
                <h2 className="h-lg flex items-start gap-4 text-text">
                  {e.titre}
                  {/* petite icône animée inline (façon anime-container speedy) */}
                  <span className="mt-2 inline-block h-[0.5em] w-[0.5em] shrink-0 animate-blob rounded-full bg-brand/70" />
                </h2>
                <p className="p-lead mt-6 max-w-lg text-muted">{e.texte}</p>
              </div>
            ))}
          </div>

          {/* Colonne 3 — aperçu de l'outil (PLACEHOLDER → vrais screens) */}
          <div className="relative hidden aspect-[4/5] w-full max-w-[420px] justify-self-end lg:block">
            {etapes.map((e, i) => (
              <div
                key={e.label}
                className="pin-visual absolute inset-0 flex flex-col overflow-hidden rounded-[24px] border border-border bg-bg-elevated"
              >
                {/* barre de fenêtre factice */}
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                </div>
                {/* zone d'aperçu — placeholder */}
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="text-6xl font-medium tabular-nums text-border-strong">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-muted">
                    Aperçu — {e.label}
                  </span>
                  <span className="text-xs text-faint">
                    (capture de l’outil à venir)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicateur de scroll, bas-gauche */}
        <div className="absolute bottom-10 left-[6vw] hidden items-center gap-3 text-faint lg:flex">
          <svg width="16" height="24" viewBox="0 0 18 27" fill="none" aria-hidden>
            <rect x="1" y="1" width="16" height="25" rx="8" stroke="currentColor" strokeWidth="1.6" />
            <line x1="9" y1="6" x2="9" y2="11" stroke="currentColor" strokeWidth="1.6" className="animate-scroll-dot" />
          </svg>
          <span className="text-xs font-medium uppercase tracking-[0.2em]">Scroll</span>
        </div>
      </div>
    </section>
  );
}
