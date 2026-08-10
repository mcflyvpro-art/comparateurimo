"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_FOCAL } from "@/design/tokens";
import { cx } from "@/lib/cx";

/**
 * États de l'interface — vide, chargement, erreur, explication.
 *
 * Un écran vide n'est pas un écran raté : c'est le premier écran que voit un
 * nouvel utilisateur. Il est donc traité avec le même soin qu'un écran plein.
 */

/* -------------------------------------------------------------------------- */

/** Calage focal au défilement — le geste signature, version vitrine. */
export function Reveal({
  children,
  delay = 0,
  className,
  cine = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Tempo vitrine (1,2 s) plutôt que tempo outil (0,42 s). */
  cine?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, y: cine ? 28 : 14, filter: "blur(10px)" }
      }
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={
        reduce
          ? { duration: 0.3 }
          : { duration: cine ? 1.2 : 0.5, ease: EASE_FOCAL, delay }
      }
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

/** Écran vide. Toujours : ce qui manque, pourquoi, et le geste suivant. */
export function Empty({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-line text-text-3">
          {icon}
        </span>
      )}
      <p className="text-[15px] font-medium text-text">{title}</p>
      {body && (
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-text-3">{body}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Bandeau d'alerte discret. Jamais de rouge vif : le système est chaud. */
export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "warn" | "danger";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-line bg-surface-hover text-text-2",
    warn: "border-[color-mix(in_srgb,var(--mid)_35%,transparent)] bg-mid-soft text-mid",
    danger:
      "border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[var(--danger-soft)] text-danger",
  } as const;

  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={cx(
        "rounded-sm border px-3.5 py-2.5 text-[13px] leading-relaxed",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Ossature de chargement — un bloc qui respire, jamais un spinner. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("block animate-breathe rounded-sm bg-surface-hover", className)}
    />
  );
}

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */

/**
 * Réexport de commodité : l'infobulle vit dans son propre fichier parce qu'elle
 * doit passer par un portail (voir `ui/InfoTip.tsx`), mais tout le code appelant
 * l'importe historiquement depuis ici.
 */
export { InfoTip } from "@/components/ui/InfoTip";
