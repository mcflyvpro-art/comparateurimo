"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import type { ReactNode, PointerEvent } from "react";
import { useRef } from "react";

/**
 * Bouton magnétique : se décale légèrement vers le curseur.
 * useMotionValue/useSpring hors du cycle de rendu React (pas de setState par
 * frame) — conforme aux garde-fous perf. Désactivé en reduced-motion.
 */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 150, damping: 15 });
  const y = useSpring(my, { stiffness: 150, damping: 15 });

  function onMove(e: PointerEvent<HTMLAnchorElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  const skin =
    variant === "primary"
      ? "bg-text text-bg hover:bg-white"
      : "border border-border-strong text-text hover:border-text";

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 font-medium transition-colors ${skin} ${className}`}
    >
      {children}
    </motion.a>
  );
}
