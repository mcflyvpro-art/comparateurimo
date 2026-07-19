"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { FullscreenMenu } from "./FullscreenMenu";

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Header calqué sur speedy.io : transparent, superposé, 3 zones
 * (logo · burger centré · pill). Deux comportements « Speedy » :
 *  - se cache au scroll vers le bas, réapparaît vers le haut ;
 *  - s'adapte au fond de la section derrière lui (data-header-theme) :
 *    fond sombre → logo/texte clairs ; fond clair → logo/texte sombres,
 *    avec un fondu fluide (le wordmark passe d'une version à l'autre).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const SAMPLE = 44; // ligne d'échantillonnage sous le haut de l'écran

    const update = () => {
      // Thème = section dont la bande traverse le haut de l'écran
      let t: "dark" | "light" = "dark";
      document.querySelectorAll<HTMLElement>("[data-header-theme]").forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= SAMPLE && r.bottom > SAMPLE) {
          t = (s.dataset.headerTheme as "dark" | "light") ?? "dark";
        }
      });
      setTheme(t);

      // Cache/révèle selon le sens du scroll, avec un seuil pour éviter les
      // à-coups → la transition CSS (600ms) reste fluide dans les deux sens.
      const y = window.scrollY;
      if (y > lastY.current + 6 && y > 160) setHidden(true);
      else if (y < lastY.current - 6) setHidden(false);
      lastY.current = y;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Thème effectif : le menu ouvert force le sombre
  const t = open ? "dark" : theme;
  const isHidden = !open && hidden;
  // Seuls le burger + les actions se cachent (le logo, lui, reste toujours)
  const hideCls = `transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
    isHidden ? "-translate-y-[240%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
  }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
          t === "light" ? "text-neutral-950" : "text-white"
        }`}
      >
        <nav className="mx-auto grid max-w-[106rem] grid-cols-3 items-center px-[6vw] py-5">
          {/* Logo — deux versions en fondu croisé selon le thème */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="Estio — accueil"
            className="justify-self-start"
          >
            <span className="relative inline-block h-9">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/estio-wordmark.svg"
                alt="Estio"
                className="h-9 w-auto transition-opacity duration-500"
                style={{ opacity: t === "light" ? 0 : 1 }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/estio-wordmark-dark.svg"
                alt=""
                aria-hidden
                className="absolute inset-0 h-9 w-auto transition-opacity duration-500"
                style={{ opacity: t === "light" ? 1 : 0 }}
              />
            </span>
          </Link>

          {/* Burger (centre) */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className={`group flex h-10 w-16 items-center justify-center justify-self-center ${hideCls}`}
          >
            <span className="relative block h-3 w-[52px] transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-y-75">
              <motion.span
                className="absolute left-0 block h-0.5 w-full bg-current"
                initial={false}
                animate={open ? { top: "50%", y: "-50%", rotate: 45 } : { top: 0, y: 0, rotate: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              />
              <motion.span
                className="absolute left-0 block h-0.5 w-full bg-current"
                initial={false}
                animate={open ? { bottom: "50%", y: "50%", rotate: -45 } : { bottom: 0, y: 0, rotate: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </span>
          </button>

          {/* Actions (droite) — se cachent au scroll comme le burger */}
          <div className={`flex items-center gap-5 justify-self-end ${hideCls}`}>
            <Link
              href="/connexion"
              className="hidden text-sm opacity-70 transition-opacity hover:opacity-100 sm:inline"
            >
              Se connecter
            </Link>
            <Link
              href="/connexion"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-500 ${
                t === "light"
                  ? "bg-neutral-950 text-white hover:bg-neutral-800"
                  : "bg-white text-neutral-950 hover:bg-white/90"
              }`}
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
