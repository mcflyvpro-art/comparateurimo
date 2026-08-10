"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type Lenis from "lenis";
import { EASE_FOCAL } from "@/design/tokens";
import { primaryNav, secondaryNav } from "./nav-links";

/**
 * Menu plein écran.
 *
 * Les trois destinations principales sont composées en très grand, indexées en
 * chasses fixes, et alignées en bas comme un générique de fin. Chacune arrive
 * hors focale et se cale — le geste signature du système, joué au tempo vitrine.
 *
 * Le survol pousse le mot vers la droite et trace un filet incandescent sous
 * lui : on sait ce qu'on vise avant de cliquer.
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
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: EASE_FOCAL }}
          className="fixed inset-0 z-40 flex flex-col justify-end bg-[rgb(8_7_6/0.96)] backdrop-blur-2xl"
        >
          <div className="mx-auto flex w-full max-w-[104rem] flex-col gap-14 px-[var(--gutter)] pb-[8vh] pt-32 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="t-label mb-8 block !text-[10px]">Explorer</span>
              <ul className="flex flex-col gap-1">
                {primaryNav.map((l, i) => {
                  const active = pathname === l.href;
                  return (
                    <li key={l.href} className="overflow-hidden">
                      <motion.div
                        initial={
                          reduce
                            ? { opacity: 0 }
                            : { y: "108%", opacity: 0, filter: "blur(10px)" }
                        }
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{
                          duration: reduce ? 0.25 : 0.95,
                          ease: EASE_FOCAL,
                          delay: reduce ? 0 : 0.1 + i * 0.08,
                        }}
                      >
                        <Link
                          href={l.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className="group flex items-baseline gap-4"
                        >
                          <span className="num shrink-0 text-[11px] text-text-4 transition-colors group-hover:text-accent">
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          <span className="relative inline-block pb-[0.08em]">
                            <span
                              className={`block font-medium leading-[0.98] tracking-[-0.045em] text-[clamp(2.6rem,8.5vw,7.5rem)] transition-[transform,color] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[0.06em] ${
                                active ? "text-text-4" : "text-text"
                              }`}
                            >
                              {l.label}
                            </span>
                            <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                          </span>

                          <span className="hidden self-start pt-3 text-[12px] text-text-4 lg:block">
                            {l.sub}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: EASE_FOCAL, delay: 0.3 }}
              className="grid shrink-0 grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3 lg:gap-x-16"
            >
              <MenuColumn
                title="Compte"
                links={secondaryNav.compte}
                pathname={pathname}
                onClose={onClose}
              />
              <MenuColumn
                title="Entreprise"
                links={secondaryNav.entreprise}
                pathname={pathname}
                onClose={onClose}
              />
              <MenuColumn
                title="Légal"
                links={secondaryNav.legal}
                pathname={pathname}
                onClose={onClose}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuColumn({
  title,
  links,
  pathname,
  onClose,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div>
      <span className="t-label mb-4 block !text-[10px]">{title}</span>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`relative inline-block whitespace-nowrap text-[15px] transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-[420ms] hover:after:origin-left hover:after:scale-x-100 ${
                  active ? "text-text-4" : "text-text-2 hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
