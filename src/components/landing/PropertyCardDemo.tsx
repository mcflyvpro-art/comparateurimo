"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Carte de bien de démonstration (visuel du hero).
 * Matériau translucide + profondeur douce (apple-design §12).
 * La barre de score se remplit au scroll : le mouvement intermédiaire
 * pointe vers l'issue (apple-design §8, hint in direction of the gesture).
 */
export function PropertyCardDemo() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="w-full max-w-sm rounded-xl bg-gradient-to-b from-[#f7f3ec] to-[#efe7da] p-5 shadow-md"
    >
      <div className="rounded-lg border border-white/85 bg-white/70 p-5 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-faint">3 pièces · Lyon 7e</div>
            <div className="font-sans text-2xl font-semibold tracking-tight text-text">
              245 000
              <span className="text-sm font-medium text-faint"> €</span>
            </div>
          </div>
          <div className="flex size-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#8fbf9e] to-[#5c9e72] font-sans text-lg font-bold text-white shadow-[0_4px_12px_rgba(60,120,80,0.3)]">
            82
          </div>
        </div>

        <div className="my-4 h-1.5 overflow-hidden rounded-full bg-[rgb(180_160_140/0.2)]">
          <motion.i
            className="block h-full rounded-full bg-gradient-to-r from-accent to-brand"
            initial={{ width: reduce ? "72%" : "0%" }}
            whileInView={{ width: "72%" }}
            viewport={{ once: true }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", bounce: 0, duration: 0.9, delay: 0.2 }
            }
          />
        </div>

        <div className="flex gap-1.5">
          <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] text-[#9b6a4a]">
            Rendement 5,2 %
          </span>
          <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] text-[#3b7a57]">
            Zone tendue
          </span>
        </div>
      </div>
    </motion.div>
  );
}
