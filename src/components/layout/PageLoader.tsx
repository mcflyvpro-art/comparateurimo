"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type Lenis from "lenis";
import { EstioWordmarkInline } from "./EstioWordmarkInline";

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Loader d'intro (façon speedy.io) : fond noir, wordmark en grand au centre.
 * Les deux tours de l'icône clignotent en alternance (blanc ↔ estompé) sur
 * ~3 tours, puis le logo « vient se ranger » en haut à gauche, pile à la place
 * du logo du header (relais invisible), et l'overlay se dissout.
 */
export function PageLoader() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "dock" | "done">("intro");
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    setDims({ w: window.innerWidth, h: window.innerHeight });

    if (reduce) {
      setPhase("done");
      return;
    }

    lenis?.stop();
    const t1 = setTimeout(() => setPhase("dock"), 1550); // laisse finir le clignotement
    const t2 = setTimeout(() => {
      setPhase("done");
      lenis?.start();
    }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      lenis?.start();
    };
  }, [reduce]);

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
              initial={{
                opacity: 0,
                top: dims.h / 2,
                left: dims.w / 2,
                x: "-50%",
                y: "-50%",
                height: 150,
              }}
              animate={
                phase === "intro"
                  ? { opacity: 1, top: dims.h / 2, left: dims.w / 2, x: "-50%", y: "-50%", height: 150 }
                  : { opacity: 1, top: 20, left: Math.round(dims.w * 0.06), x: "0%", y: "0%", height: 36 }
              }
              transition={{ duration: phase === "intro" ? 0.5 : 0.9, ease: EASE }}
            >
              <EstioWordmarkInline
                className="loader-logo"
                style={{ height: "100%", width: "auto", display: "block" }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
