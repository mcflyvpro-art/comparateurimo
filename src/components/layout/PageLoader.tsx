"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type Lenis from "lenis";
import { EstioLoaderMark } from "./EstioLoaderMark";

const EASE = [0.19, 1, 0.22, 1] as const;
const getLenis = () => (window as unknown as { __lenis?: Lenis }).__lenis;

/**
 * Loader d'intro : fond noir, wordmark en grand. Les 2 immeubles alternent
 * plein ↔ contour (lent, fluide). Quand l'alternation se TERMINE (animationend),
 * le logo « tombe pile » à sa place dans le header, puis l'overlay se dissout et
 * on émet « estio:loaded » pour lancer l'entrée du hero.
 */
export function PageLoader() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "dock" | "done">("intro");
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  // Setup : fige le scroll, mémorise les dimensions
  useEffect(() => {
    setDims({ w: window.innerWidth, h: window.innerHeight });
    if (reduce) {
      setPhase("done");
      return;
    }
    getLenis()?.stop();
    // L'alternation CSS (2 tours × 1.8s) et ce timer démarrent au même rendu :
    // le dock « tombe pile » à la fin de l'animation.
    const t = setTimeout(() => setPhase((p) => (p === "intro" ? "dock" : p)), 3650);
    return () => clearTimeout(t);
  }, [reduce]);

  // dock → done (après le vol du logo)
  useEffect(() => {
    if (phase !== "dock") return;
    const t = setTimeout(() => setPhase("done"), 950);
    return () => clearTimeout(t);
  }, [phase]);

  // done → relance le scroll + signale au hero d'entrer
  useEffect(() => {
    if (phase === "done") {
      getLenis()?.start();
      window.dispatchEvent(new Event("estio:loaded"));
    }
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {dims && (
            <motion.div
              className="absolute inline-block"
              initial={{ opacity: 0, top: dims.h / 2, left: dims.w / 2, x: "-50%", y: "-50%", height: 150 }}
              animate={
                phase === "intro"
                  ? { opacity: 1, top: dims.h / 2, left: dims.w / 2, x: "-50%", y: "-50%", height: 150 }
                  : { opacity: 1, top: 20, left: Math.round(dims.w * 0.06), x: "0%", y: "0%", height: 36 }
              }
              transition={{ duration: phase === "intro" ? 0.5 : 0.9, ease: EASE }}
            >
              <EstioLoaderMark className="loader-mark" style={{ height: "100%", width: "auto", display: "block" }} />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
