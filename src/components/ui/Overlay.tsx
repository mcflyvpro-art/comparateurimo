"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_FOCAL, spring } from "@/design/tokens";
import { IconButton } from "@/components/ui/Button";
import { IconClose } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * Calques flottants — panneau latéral et boîte de dialogue.
 *
 * Le voile ne se contente pas d'assombrir : il DÉFOCALISE la page derrière.
 * Ouvrir un calque, c'est tirer la mise au point vers soi — la métaphore
 * optique du produit appliquée à la navigation.
 */

function useDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

function Scrim({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: EASE_FOCAL }}
      onClick={onClose}
      className="absolute inset-0 bg-[var(--surface-scrim)] backdrop-blur-[5px]"
    />
  );
}

/** Panneau latéral droit — l'aperçu rapide d'un bien depuis le board. */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "26rem",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const reduce = useReducedMotion();
  useDismiss(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <Scrim onClose={onClose} />
          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={spring.sheet}
            style={{ width: `min(100vw, ${width})` }}
            className="relative flex h-full flex-col border-l border-hairline-2 bg-surface"
          >
            <header className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-medium leading-snug text-text">{title}</h2>
                {subtitle && <p className="mt-0.5 truncate text-xs text-text-3">{subtitle}</p>}
              </div>
              <IconButton aria-label="Fermer le panneau" size="sm" onClick={onClose}>
                <IconClose size={16} />
              </IconButton>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

            {footer && (
              <footer className="border-t border-hairline px-5 py-4">{footer}</footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Boîte de dialogue centrée — décision brève, bloquante, jamais décorative. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "24rem",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const reduce = useReducedMotion();
  useDismiss(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <Scrim onClose={onClose} />
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
            transition={{ duration: 0.26, ease: EASE_FOCAL }}
            style={{ width: `min(100%, ${width})` }}
            className="relative rounded-lg border border-hairline-2 bg-surface shadow-[var(--lift-3)]"
          >
            <div className="px-5 pb-4 pt-5">
              <h2 className="text-[15px] font-medium text-text">{title}</h2>
              {description && (
                <p className="mt-1.5 text-[13px] leading-relaxed text-text-2">{description}</p>
              )}
              {children && <div className="mt-4">{children}</div>}
            </div>
            {footer && (
              <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Aperçu plein cadre — photo d'un bien, sans chrome inutile. */
export function Lightbox({
  open,
  onClose,
  children,
  toolbar,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  useDismiss(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_FOCAL }}
          onClick={onClose}
          className={cx(
            "fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-6",
            "bg-[var(--surface-scrim)] backdrop-blur-[10px]",
          )}
        >
          {children}
          {toolbar && (
            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
              {toolbar}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
