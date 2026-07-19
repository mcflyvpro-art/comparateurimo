"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll global (Lenis), branché sur le ticker GSAP et synchronisé
 * avec ScrollTrigger — indispensable pour que le pin 600vh reste calé.
 *
 * Le composant ne rend rien : il installe le scroll inertiel au montage et
 * nettoie au démontage. Guardé reduced-motion (scroll natif conservé).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      // easing « expo-out », cohérent avec --ease-expo de la charte
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // À chaque frame de scroll Lenis, on rafraîchit ScrollTrigger.
    lenis.on("scroll", ScrollTrigger.update);

    // Lenis avance via le ticker GSAP (une seule boucle RAF partagée).
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
