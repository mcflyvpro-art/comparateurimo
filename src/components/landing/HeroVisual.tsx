"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import type { PointerEvent } from "react";

/**
 * Visuel du hero : carte de bien en "liquid glass" (bord réfractif + reflet
 * interne), flottement perpétuel + inclinaison 3D suivant le curseur.
 * Toutes les transformations passent par transform/opacity (GPU).
 */
export function HeroVisual() {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 100, damping: 20 });
  const sry = useSpring(ry, { stiffness: 100, damping: 20 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 10);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div
      style={{ perspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="w-full max-w-sm"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
          className="rounded-xl bg-gradient-to-b from-[#f7f3ec] to-[#efe7da] p-5 shadow-[0_24px_60px_-20px_rgba(70,50,30,0.28)]"
        >
          {/* Liquid glass : bord réfractif (border clair) + reflet interne (inset) */}
          <div className="rounded-lg border border-white/70 bg-white/65 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-faint">3 pièces &middot; Lyon 7e</div>
                <div className="font-sans text-2xl font-semibold tracking-tight text-text">
                  245 000
                  <span className="text-sm font-medium text-faint"> &euro;</span>
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#8fbf9e] to-[#5c9e72] font-sans text-lg font-bold text-white shadow-[0_4px_12px_rgba(60,120,80,0.3)]">
                82
              </div>
            </div>

            <div className="my-4 h-1.5 overflow-hidden rounded-full bg-[rgb(180_160_140/0.2)]">
              <motion.i
                className="block h-full origin-left rounded-full bg-gradient-to-r from-accent to-brand"
                initial={{ scaleX: reduce ? 0.72 : 0 }}
                whileInView={{ scaleX: 0.72 }}
                viewport={{ once: true }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 90, damping: 20, delay: 0.25 }
                }
                style={{ width: "100%" }}
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
      </motion.div>
    </div>
  );
}
