"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type Lenis from "lenis";

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Loader d'intro façon speedy.io : fond noir plein écran, wordmark en grand
 * au centre (apparition fluide floue → nette), puis il « vient se ranger »
 * en haut à gauche, exactement à la place du logo du header. L'overlay se
 * dissout ensuite pour révéler le site — le relais avec le logo du header
 * est invisible (même position, même taille).
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
    const t1 = setTimeout(() => setPhase("dock"), 1250);
    const t2 = setTimeout(() => {
      setPhase("done");
      lenis?.start();
    }, 2250);
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
            /* eslint-disable-next-line @next/next/no-img-element */
            <motion.img
              src="/estio-wordmark.svg"
              alt="Estio"
              className="absolute"
              initial={{
                opacity: 0,
                filter: "blur(10px)",
                height: 150,
                top: dims.h / 2,
                left: dims.w / 2,
                x: "-50%",
                y: "-50%",
              }}
              animate={
                phase === "intro"
                  ? {
                      opacity: 1,
                      filter: "blur(0px)",
                      height: 150,
                      top: dims.h / 2,
                      left: dims.w / 2,
                      x: "-50%",
                      y: "-50%",
                    }
                  : {
                      opacity: 1,
                      filter: "blur(0px)",
                      height: 32,
                      top: 24,
                      left: Math.round(dims.w * 0.06),
                      x: "0%",
                      y: "0%",
                    }
              }
              transition={{ duration: phase === "intro" ? 1 : 0.9, ease: EASE }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
