"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { FullscreenMenu } from "./FullscreenMenu";

/**
 * Header calqué sur speedy.io : transparent, superposé au contenu.
 * 3 zones — logo (gauche) · burger centré qui ouvre le menu plein écran ·
 * bouton pill (droite). Le burger morphe en croix à l'ouverture.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto grid max-w-[106rem] grid-cols-3 items-center px-[6vw] py-5">
          {/* Logo (gauche) */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="Estio — accueil"
            className="justify-self-start"
          >
            {/* Wordmark blanc (mark immeubles + « estio »), sur header sombre */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/estio-wordmark.svg" alt="Estio" className="h-8 w-auto" />
          </Link>

          {/* Burger (centre) */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="group flex h-10 w-16 items-center justify-center justify-self-center"
          >
            <span className="relative block h-3 w-[52px] transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-y-75">
              <motion.span
                className="absolute left-0 block h-0.5 w-full bg-text"
                initial={false}
                animate={open ? { top: "50%", y: "-50%", rotate: 45 } : { top: 0, y: 0, rotate: 0 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              />
              <motion.span
                className="absolute left-0 block h-0.5 w-full bg-text"
                initial={false}
                animate={open ? { bottom: "50%", y: "50%", rotate: -45 } : { bottom: 0, y: 0, rotate: 0 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              />
            </span>
          </button>

          {/* Actions (droite) */}
          <div className="flex items-center gap-5 justify-self-end">
            <Link
              href="/connexion"
              className="hidden text-sm text-muted transition-colors hover:text-text sm:inline"
            >
              Se connecter
            </Link>
            <Link
              href="/connexion"
              className="rounded-full bg-text px-5 py-2 text-sm font-medium text-bg transition-colors hover:bg-white"
            >
              Ajouter un bien
            </Link>
          </div>
        </nav>
      </header>

      <FullscreenMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}
