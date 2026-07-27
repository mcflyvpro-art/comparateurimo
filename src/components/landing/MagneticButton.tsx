"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useRef, type ReactNode, type PointerEvent } from "react";
import { spring } from "@/design/tokens";
import { cx } from "@/lib/cx";

/** Link Next animable — conserve le préchargement du routeur. */
const MotionLink = motion.create(Link);

/**
 * Bouton magnétique — réservé à la vitrine.
 *
 * L'attraction est volontairement discrète (0,18 du déplacement, pas 0,3) : on
 * doit la sentir sans la voir. Un bouton qui bondit vers le curseur est un
 * gadget ; un bouton qui se penche imperceptiblement est du soin.
 *
 * Désactivé en mouvement réduit, et le déplacement passe par un ressort hors du
 * cycle de rendu React — aucun setState par image.
 */
export function MagneticButton({
  href,
  children,
  variant = "solid",
  className = "",
  trailing,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
  trailing?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 190, damping: 17, mass: 0.6 });
  const y = useSpring(my, { stiffness: 190, damping: 17, mass: 0.6 });

  function onMove(e: PointerEvent<HTMLAnchorElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.18);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.18);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  const skin =
    variant === "solid"
      ? "bg-brand text-inverse shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] hover:bg-brand-hot"
      : "border border-hairline-2 text-text hover:border-hairline-3 hover:bg-raised";

  return (
    <MotionLink
      ref={ref}
      href={href}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.975 }}
      transition={spring.ui}
      className={cx(
        "group inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3",
        "text-[14px] font-medium tracking-[-0.01em] transition-colors duration-[180ms]",
        skin,
        className,
      )}
    >
      {children}
      {trailing && (
        <span className="transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
          {trailing}
        </span>
      )}
    </MotionLink>
  );
}
