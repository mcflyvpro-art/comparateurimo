"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type Lenis from "lenis";

const EASE = [0.19, 1, 0.22, 1] as const;

// Liens « géants » — du haut vers le bas, taille croissante (FAQ → Comparateur)
// Mots à bord gauche « plein » (F, F, L) pour un alignement net, tailles croissantes
const discover = [
  { href: "/faq", label: "FAQ", sub: "Questions", size: "text-[clamp(2.6rem,6vw,6rem)]" },
  { href: "/tarifs", label: "Formules", sub: "Crédits", size: "text-[clamp(3.3rem,8vw,8rem)]" },
  { href: "/comment-ca-marche", label: "Le produit", sub: "Découvrir", size: "text-[clamp(3.6rem,10vw,10rem)]" },
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
          <div className="mx-auto flex w-full max-w-[106rem] flex-col gap-16 px-[6vw] pb-[7vh] pt-28 lg:flex-row lg:items-end lg:justify-between">
            {/* Découvrir — liens géants */}
            <div>
              <span className="mb-6 block text-sm font-medium uppercase tracking-[0.14em] text-faint">
                Découvrir
              </span>
              <ul className="flex flex-col gap-2 lg:gap-3">
                {discover.map((l, i) => {
                  const active = pathname === l.href;
                  return (
                    <li key={l.href} className="overflow-hidden">
                      <motion.div
                        initial={{ y: reduce ? 0 : "110%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 }}
                      >
                        <Link
                          href={l.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`group inline-flex items-start ${
                            active ? "pointer-events-none text-faint" : "text-text"
                          }`}
                        >
                          {/* Mot qui avance + soulignement (façon speedy.io) */}
                          <span className="relative inline-block pb-[0.12em] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-[0.32em]">
                            <span className={`block font-medium leading-[1.02] tracking-[-0.03em] ${l.size}`}>
                              {l.label}
                            </span>
                            <span className="absolute bottom-0 left-0 right-0 h-[6px] origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-x-100" />
                          </span>
                          {/* Sous-titre en exposant (haut-droite), une seule ligne */}
                          <span className="ml-2 mt-[0.25em] self-start whitespace-nowrap text-sm text-muted lg:ml-3 lg:text-base">
                            {l.sub}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Colonnes Légal / Support */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
              className="grid shrink-0 grid-cols-2 gap-12 lg:gap-20"
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
      className={`relative inline-block whitespace-nowrap text-lg transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100 ${
        active ? "text-faint" : "text-text"
      }`}
    >
      {label}
    </Link>
  );
}
