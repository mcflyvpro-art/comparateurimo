"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Socle du « scroll storytelling » façon speedy.io :
 * - Lenis = smooth scroll à inertie (remplace Locomotive Scroll).
 * - GSAP ScrollTrigger = pin + scrub (sections figées où l'on scrolle « dedans »).
 * Les deux sont synchronisés sur le même ticker pour éviter tout décalage.
 * Désactivé si l'utilisateur préfère réduire les animations.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // Exposé pour figer/relancer le scroll (ex. ouverture du menu plein écran)
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // Lenis pilote ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Un seul RAF (gsap.ticker) pour Lenis + GSAP
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
