"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { navLinks } from "./nav-links";

/** Panneau plein écran (mobile) : liens + actions. Spring + reduced-motion. */
export function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -8 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="fixed inset-0 z-50 bg-bg px-6 pt-4 sm:hidden"
        >
          <div className="flex items-center justify-between py-2">
            <Link
              href="/"
              onClick={onClose}
              className="font-sans text-xl font-semibold tracking-tight text-text"
            >
              estio<span className="text-brand">.</span>
            </Link>
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="cursor-pointer p-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className={`font-sans text-2xl tracking-tight ${
                  pathname === l.href ? "text-brand" : "text-text"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 flex flex-col gap-3">
            <Link
              href="/connexion"
              onClick={onClose}
              className="rounded-full border border-border px-6 py-3 text-center font-medium text-text"
            >
              Se connecter
            </Link>
            <Link
              href="/connexion"
              onClick={onClose}
              className="rounded-full bg-brand px-6 py-3 text-center font-medium text-white"
            >
              Ajouter un bien
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
