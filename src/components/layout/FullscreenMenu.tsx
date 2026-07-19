"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type Lenis from "lenis";

const EASE = [0.19, 1, 0.22, 1] as const;

// Liens « géants » (équivalent Speedy / Enterprise / Eden Project)
const discover = [
  { href: "/comment-ca-marche", label: "Comparateur", sub: "Le produit" },
  { href: "/tarifs", label: "Tarifs", sub: "Crédits" },
  { href: "/faq", label: "FAQ", sub: "Questions" },
];
const legal = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
];
const support = [
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/connexion", label: "Se connecter" },
];

/**
 * Menu plein écran (toutes tailles), calqué sur speedy.io :
 * fond noir flouté, contenu aligné en bas, colonne « Découvrir » en liens
 * géants + colonnes Légal / Support. Fige le scroll Lenis à l'ouverture.
 */
export function FullscreenMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const reduce = useReducedMotion();

  // Fige/relance le smooth-scroll + Échap pour fermer
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (open) lenis?.stop();
    else lenis?.start();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-0 z-40 flex flex-col justify-end bg-black/95 backdrop-blur-2xl"
        >
          <div className="mx-auto flex w-full max-w-[106rem] flex-col gap-14 px-[6vw] pb-[8vh] pt-28 lg:flex-row lg:items-end lg:justify-between">
            {/* Découvrir — liens géants */}
            <div>
              <span className="mb-6 block text-sm font-medium uppercase tracking-[0.14em] text-faint">
                Découvrir
              </span>
              <ul className="flex flex-col gap-2">
                {discover.map((l, i) => (
                  <li key={l.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: reduce ? 0 : "110%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 }}
                    >
                      <Link
                        href={l.href}
                        onClick={onClose}
                        className="group inline-flex items-baseline gap-3 text-text lg:gap-5"
                      >
                        <span className="h-giant text-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          →
                        </span>
                        <span className="h-giant">{l.label}</span>
                        <span className="text-base text-muted lg:text-xl">{l.sub}</span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonnes Légal / Support */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
              className="grid grid-cols-2 gap-12 lg:gap-20"
            >
              <div>
                <span className="mb-4 block text-sm font-medium uppercase tracking-[0.14em] text-faint">
                  Légal
                </span>
                <ul className="flex flex-col gap-2.5">
                  {legal.map((l) => (
                    <li key={l.href}>
                      <MenuLink {...l} pathname={pathname} onClose={onClose} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="mb-4 block text-sm font-medium uppercase tracking-[0.14em] text-faint">
                  Support
                </span>
                <ul className="flex flex-col gap-2.5">
                  {support.map((l) => (
                    <li key={l.href}>
                      <MenuLink {...l} pathname={pathname} onClose={onClose} />
                    </li>
                  ))}
                </ul>
                <p className="mt-10 text-sm text-faint">Fait avec soin — Estio</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MenuLink({
  href,
  label,
  pathname,
  onClose,
}: {
  href: string;
  label: string;
  pathname: string;
  onClose: () => void;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={`relative inline-block text-lg transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100 ${
        active ? "text-faint" : "text-text"
      }`}
    >
      {label}
    </Link>
  );
}
