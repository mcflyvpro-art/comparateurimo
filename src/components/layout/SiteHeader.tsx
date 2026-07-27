"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { FullscreenMenu } from "./FullscreenMenu";
import { EASE_FOCAL } from "@/design/tokens";
import { cx } from "@/lib/cx";

/**
 * En-tête public.
 *
 * Un seul univers, donc plus de bascule de thème : le site vit dans la nuit du
 * premier au dernier pixel. L'en-tête est transparent sur le hero, puis se pose
 * sur un voile flouté dès qu'on défile — il ne « change » pas, il se matérialise.
 *
 * Il s'efface vers le haut quand on descend et revient quand on remonte : sur
 * une page de récit, la navigation ne doit pas rester dans le champ.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [settled, setSettled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      setSettled(y > 40);
      if (y > lastY.current + 6 && y > 200) setHidden(true);
      else if (y < lastY.current - 6) setHidden(false);
      lastY.current = y;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isHidden = !open && hidden;

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: isHidden ? "-105%" : "0%" }}
        transition={{ duration: 0.55, ease: EASE_FOCAL }}
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-[420ms]",
          settled && !open
            ? "border-b border-hairline bg-[rgb(11_10_9/0.72)] backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <nav className="mx-auto grid max-w-[104rem] grid-cols-[1fr_auto_1fr] items-center px-[var(--gutter)] py-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label="Estio — accueil"
            className="justify-self-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/estio-wordmark.svg" alt="Estio" className="h-6 w-auto" />
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="group flex h-10 w-14 items-center justify-center justify-self-center"
          >
            {/* Deux filets de longueurs inégales — un repère, pas un hamburger */}
            <span className="relative block h-2.5 w-9">
              <motion.span
                className="absolute right-0 block h-px bg-current"
                initial={false}
                animate={
                  open
                    ? { top: "50%", width: "100%", rotate: 45, y: "-50%" }
                    : { top: 0, width: "100%", rotate: 0, y: 0 }
                }
                transition={{ duration: 0.45, ease: EASE_FOCAL }}
              />
              <motion.span
                className="absolute right-0 block h-px bg-current"
                initial={false}
                animate={
                  open
                    ? { bottom: "50%", width: "100%", rotate: -45, y: "50%" }
                    : { bottom: 0, width: "58%", rotate: 0, y: 0 }
                }
                transition={{ duration: 0.45, ease: EASE_FOCAL }}
                whileHover={open ? undefined : { width: "100%" }}
              />
            </span>
          </button>

          <div className="flex items-center gap-4 justify-self-end">
            <Link
              href="/connexion"
              className="hidden text-[13px] text-text-3 transition-colors hover:text-text sm:inline"
            >
              Se connecter
            </Link>
            <Link
              href="/connexion"
              className="rounded-sm bg-brand px-4 py-2 text-[13px] font-medium text-inverse shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] transition-colors duration-[180ms] hover:bg-brand-hot"
            >
              Ouvrir un pipeline
            </Link>
          </div>
        </nav>
      </motion.header>

      <FullscreenMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}
