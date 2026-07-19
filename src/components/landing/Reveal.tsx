"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Révèle son contenu au scroll : fondu + montée, ressort critiquement amorti
 * (apple-design : damping 1.0 / bounce 0). En reduced-motion, simple fondu.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduce
          ? { duration: 0.3 }
          : { type: "spring", bounce: 0, duration: 0.6, delay }
      }
    >
      {children}
    </motion.div>
  );
}
