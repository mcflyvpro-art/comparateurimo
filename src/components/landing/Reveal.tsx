"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Révèle son contenu au scroll : fondu + montée sur ressort premium
 * (stiffness 100 / damping 20). En reduced-motion, simple fondu.
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
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduce
          ? { duration: 0.3 }
          : { type: "spring", stiffness: 100, damping: 20, delay }
      }
    >
      {children}
    </motion.div>
  );
}
