"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type Lenis from "lenis";
import { EASE_FOCAL } from "@/design/tokens";

const getLenis = () => (window as unknown as { __lenis?: Lenis }).__lenis;

/**
 * Ouverture — la première mise au point.
 *
 * Le logotype arrive franchement hors focale et se cale net pendant qu'un filet
 * incandescent parcourt sa base, comme un capteur qui verrouille. Puis le voile
 * se dissout et le hero prend le relais.
 *
 * Durée totale : environ 1,3 s. Un écran d'attente qui dépasse la seconde et
 * demie n'est plus une signature, c'est une taxe. Sauté intégralement en
 * mouvement réduit.
 */
export function PageLoader() {
  const reduce = useReducedMotion();
  const [settled, setSettled] = useState(false);

  // En mouvement réduit, le voile n'existe pas du tout : on le déduit du rendu
  // plutôt que de le faire disparaître par un état, ce qui éviterait un rendu
  // en cascade au montage.
  const visible = !reduce && !settled;

  useEffect(() => {
    if (reduce) return;
    getLenis()?.stop();
    const t = setTimeout(() => setSettled(true), 1300);
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    if (visible) return;
    getLenis()?.start();
    window.dispatchEvent(new Event("estio:loaded"));
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ink-950)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.5, ease: EASE_FOCAL }}
        >
          <div className="relative">
            <motion.img
              src="/estio-wordmark.svg"
              alt="Estio"
              className="h-9 w-auto"
              initial={{ opacity: 0, filter: "blur(16px)", scale: 1.06 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.9, ease: EASE_FOCAL }}
            />
            <motion.span
              className="absolute -bottom-3 left-0 block h-px bg-brand"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.05, ease: EASE_FOCAL, delay: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
