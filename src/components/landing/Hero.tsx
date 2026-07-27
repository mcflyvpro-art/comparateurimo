"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FocalField } from "@/components/landing/FocalField";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { EASE_FOCAL } from "@/design/tokens";
import { IconArrowRight } from "@/components/ui/Icon";

/**
 * Hero — la démonstration avant l'argument.
 *
 * Le titre lui-même exécute la promesse : les deux premières lignes arrivent
 * hors focale et se calent, puis « Une décision. » se pose en dernier, nette et
 * incandescente. En trois secondes on a vu ce que fait le produit sans avoir lu
 * une phrase.
 *
 * Le nombre est composé en chasses fixes, la phrase en grotesque : c'est la
 * règle typographique du système appliquée dès le premier mot.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // L'entrée attend la levée du voile d'ouverture, sinon elle se joue derrière
  // lui et l'on découvre un hero déjà posé. Filet de sécurité à 2,4 s au cas où
  // le loader ne serait pas monté (navigation client depuis une autre page).
  useEffect(() => {
    const arm = () => setArmed(true);
    window.addEventListener("estio:loaded", arm);
    const fallback = setTimeout(arm, 2400);
    return () => {
      window.removeEventListener("estio:loaded", arm);
      clearTimeout(fallback);
    };
  }, []);

  const settle = (i: number) => ({
    initial: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 26, filter: "blur(14px)" },
    animate: armed
      ? { opacity: 1, y: 0, filter: "blur(0px)" }
      : reduce
        ? { opacity: 0 }
        : { opacity: 0, y: 26, filter: "blur(14px)" },
    transition: {
      duration: reduce ? 0.3 : 1.35,
      ease: EASE_FOCAL,
      delay: reduce ? 0 : 0.05 + i * 0.16,
    },
  });

  return (
    <header
      data-header-theme="dark"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-bg"
    >
      {/* Le champ d'annonces, en profondeur */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <FocalField />
      </div>

      {/* Vignette : ramène l'œil vers le texte, referme le cadre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 30%, rgb(11 10 9 / 0.55) 72%, rgb(11 10 9 / 0.92) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[104rem] flex-1 flex-col justify-end px-[var(--gutter)] pb-[13vh] pt-32">
        <motion.span {...settle(0)} className="mb-7 block text-[14px] text-text-2">
          Le CRM de votre recherche immobilière
        </motion.span>

        <h1 className="t-hero text-text">
          <motion.span {...settle(1)} className="block">
            <span className="num" style={{ letterSpacing: "-0.06em" }}>
              200
            </span>{" "}
            annonces.
          </motion.span>
          <motion.span
            {...settle(3)}
            className="block"
            style={{ color: "var(--ember-700)" }}
          >
            Une décision.
          </motion.span>
        </h1>

        <motion.p
          {...settle(4)}
          className="t-lead mt-9 max-w-xl text-text-2"
        >
          Estio avale n&apos;importe quel bien — capture d&apos;écran, PDF d&apos;agence,
          message de mandataire — le confronte aux données publiques, et vous aide à
          trancher. Du repérage à l&apos;offre.
        </motion.p>

        <motion.div {...settle(5)} className="mt-10 flex flex-wrap gap-3">
          <MagneticButton href="/connexion" trailing={<IconArrowRight size={15} />}>
            Ouvrir un pipeline
          </MagneticButton>
          <MagneticButton href="/comment-ca-marche" variant="outline">
            Comment ça marche
          </MagneticButton>
        </motion.div>
      </div>

      {/* Invite de défilement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: armed && !scrolled ? 1 : 0 }}
        transition={{ duration: 0.6, ease: EASE_FOCAL, delay: scrolled ? 0 : 1.4 }}
        className="pointer-events-none absolute bottom-8 right-[var(--gutter)] z-10 hidden items-center gap-3 sm:flex"
      >
        <span className="t-caps">Défiler</span>
        <svg width="15" height="24" viewBox="0 0 18 27" fill="none" aria-hidden>
          <rect
            x="1"
            y="1"
            width="16"
            height="25"
            rx="8"
            stroke="var(--bone-500)"
            strokeWidth="1.2"
          />
          <line
            x1="9"
            y1="7"
            x2="9"
            y2="11"
            stroke="var(--ember-700)"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="animate-scan"
          />
        </svg>
      </motion.div>
    </header>
  );
}
