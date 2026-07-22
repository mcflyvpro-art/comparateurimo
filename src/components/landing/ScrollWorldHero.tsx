"use client";

import { useEffect, useRef } from "react";
import { mountScrollWorld, type ScrollWorldConfig } from "./scrollWorldEngine";

/**
 * Section immersive sous le Hero : vol de caméra scrubbé au scroll entre
 * 3 scènes (Analyse → Comparaison → Décision), médias auto-hébergés.
 * Aucun texte hormis l'indice "scroll pour entrer" — pas de nav, pas de logo.
 */

const CONFIG: ScrollWorldConfig = {
  hint: "scroll pour entrer",
  diveScroll: 1.6,
  connScroll: 0.9,
  crossfade: 0.14,
  blur: 4,
  sections: [
    { id: "analyse", still: "/hero-scroll/analyse.png", clip: "/hero-scroll/analyse.mp4", accent: "#C99B5F" },
    { id: "comparaison", still: "/hero-scroll/comparaison.png", clip: "/hero-scroll/comparaison.mp4", accent: "#8F8AAE" },
    {
      id: "decision",
      still: "/hero-scroll/decision.png",
      clip: "/hero-scroll/decision.mp4",
      accent: "#F4F4F4",
      scroll: 2.0,
      linger: 0.45,
    },
  ],
  connectors: [null, null],
};

export function ScrollWorldHero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const cleanup = mountScrollWorld(container, CONFIG);
    return cleanup;
  }, []);

  return (
    <section data-header-theme="dark" className="relative">
      <div ref={ref} />
    </section>
  );
}
