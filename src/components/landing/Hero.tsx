"use client";

import { motion, useReducedMotion } from "motion/react";
import { MagneticButton } from "./MagneticButton";

/**
 * Hero plein écran, style « speedy.io / Büro » :
 * fond noir, masse glossy animée, titre géant aligné en bas, reveal staggeré,
 * invite de scroll. Contenu Estio (comparateur immobilier).
 */
export function Hero() {
  const reduce = useReducedMotion();

  // Reveal « anime-in » : montée + fondu, décalé ligne par ligne.
  const rise = {
    hidden: { y: reduce ? 0 : "110%" },
    show: (i: number) => ({
      y: 0,
      transition: {
        duration: 1,
        ease: [0.19, 1, 0.22, 1] as const,
        delay: 0.15 + i * 0.09,
      },
    }),
  };

  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1] as const,
        delay: 0.55 + i * 0.08,
      },
    }),
  };

  const titre = ["Compare.", "Décide.", "Investis."];

  return (
    <header className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-bg">
      {/* Masse glossy en fond */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      >
        <div
          className="animate-blob h-[70vw] w-[70vw] max-w-[900px] max-h-[900px] translate-x-[15%] rounded-full opacity-90 blur-[2px]"
          style={{
            background:
              "radial-gradient(38% 38% at 60% 35%, #3a3550 0%, #221f30 40%, #101017 68%, #0a0a0b 100%)",
            boxShadow: "inset -60px -80px 140px rgba(0,0,0,0.85)",
          }}
        />
      </div>

      {/* Contenu, aligné en bas comme le modèle */}
      <div className="relative z-10 mx-auto flex w-full max-w-[106rem] flex-1 flex-col justify-end px-[6vw] pb-[8vh] pt-32">
        <motion.span
          variants={fade}
          custom={0}
          initial="hidden"
          animate="show"
          className="mb-6 block text-sm font-medium uppercase tracking-[0.14em] text-brand"
        >
          Comparateur immobilier d’investissement
        </motion.span>

        <h1 className="h-display text-text">
          {titre.map((mot, i) => (
            <span key={mot} className="block overflow-hidden">
              <motion.span
                variants={rise}
                custom={i}
                initial="hidden"
                animate="show"
                className="block"
              >
                {mot}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
          className="p-lead mt-8 max-w-[46ch] text-muted"
        >
          Estio met tes annonces côte à côte, du point de vue de l’investissement.
          Une adresse suffit&nbsp;: elle déverrouille les données de marché, et le
          score reflète <em className="not-italic text-text">tes</em> priorités.
        </motion.p>

        <motion.div
          variants={fade}
          custom={2}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <MagneticButton href="/connexion" className="px-7 py-3.5">
            Ajouter un bien
          </MagneticButton>
          <MagneticButton href="/comment-ca-marche" variant="ghost" className="px-7 py-3.5">
            Comment ça marche
          </MagneticButton>
        </motion.div>
      </div>

      {/* Invite de scroll, bas-gauche */}
      <motion.div
        variants={fade}
        custom={4}
        initial="hidden"
        animate="show"
        className="absolute bottom-7 left-[6vw] z-10 hidden items-center gap-3 text-faint sm:flex"
      >
        <svg width="18" height="27" viewBox="0 0 18 27" fill="none" aria-hidden>
          <rect
            x="1"
            y="1"
            width="16"
            height="25"
            rx="8"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <line
            x1="9"
            y1="6"
            x2="9"
            y2="11"
            stroke="currentColor"
            strokeWidth="1.6"
            className="animate-scroll-dot"
          />
        </svg>
        <span className="text-sm font-medium uppercase tracking-wider">Scroll</span>
      </motion.div>
    </header>
  );
}
