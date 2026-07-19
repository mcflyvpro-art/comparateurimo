"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MagneticButton } from "./MagneticButton";

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Hero fidèle au modèle speedy.io :
 * fond noir, blob glossy, titre géant aligné en bas-gauche, cluster de cartes
 * flottantes à droite (ici : bien / score / marché — contenu Estio),
 * invite de scroll bas-gauche. Reveal staggeré « anime-in ».
 */
export function Hero() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  // Masque l'invite de scroll dès que l'utilisateur descend
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const rise = {
    hidden: { y: reduce ? 0 : "110%" },
    show: (i: number) => ({
      y: 0,
      transition: { duration: 1, ease: EASE, delay: 0.15 + i * 0.09 },
    }),
  };
  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE, delay: 0.5 + i * 0.08 },
    }),
  };
  const cardIn = {
    hidden: { opacity: 0, y: reduce ? 0 : 40, scale: 0.96 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1, ease: EASE, delay: 0.7 + i * 0.12 },
    }),
  };

  const titre = ["Compare.", "Décide.", "Investis."];

  return (
    <header className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-bg">
      {/* Blob glossy en fond */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex items-start justify-end"
      >
        <div
          className="animate-blob mt-[-8vh] h-[62vw] w-[62vw] max-h-[820px] max-w-[820px] translate-x-[18%] rounded-full opacity-90 blur-[2px]"
          style={{
            background:
              "radial-gradient(38% 38% at 62% 34%, #3a3550 0%, #221f30 42%, #101017 70%, #0a0a0b 100%)",
            boxShadow: "inset -60px -80px 150px rgba(0,0,0,0.85)",
          }}
        />
      </div>

      {/* Cluster de cartes flottantes (droite) */}
      <div
        aria-hidden={false}
        className="pointer-events-none absolute right-[4vw] top-1/2 z-10 hidden h-[600px] w-[440px] -translate-y-1/2 lg:block"
      >
        {/* Carte principale — le bien */}
        <motion.div
          variants={cardIn}
          custom={0}
          initial="hidden"
          animate="show"
          className="animate-float absolute right-0 top-[104px] w-[280px] rounded-[20px] bg-white p-6 text-[#0a0a0b] shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          style={{ animationDelay: "0s" }}
        >
          <div className="flex items-center gap-2 text-[13px] text-[#525252]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#7fa98c]" />
            Lyon 3ᵉ · Guillotière
          </div>
          <div className="mt-4 text-[34px] font-medium leading-none tracking-tight">
            245 000 €
          </div>
          <div className="mt-2 text-sm text-[#525252]">68 m² · 3 604 €/m²</div>
          <div
            className="mt-5 h-[120px] w-full rounded-2xl"
            style={{
              background:
                "radial-gradient(60% 60% at 40% 35%, #4a4560 0%, #262432 55%, #141317 100%)",
            }}
          />
          <div className="mt-4 inline-flex rounded-full bg-[#0a0a0b] px-3 py-1.5 text-xs text-white">
            Analyse en cours…
          </div>
        </motion.div>

        {/* Carte score (dark, en bas-gauche du cluster) */}
        <motion.div
          variants={cardIn}
          custom={1}
          initial="hidden"
          animate="show"
          className="animate-float absolute bottom-0 left-0 w-[230px] rounded-[18px] bg-bg-elevated p-5 shadow-[0_24px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
          style={{ animationDelay: "1.4s" }}
        >
          <div className="text-xs uppercase tracking-wider text-faint">
            Score · Rentabilité
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-[40px] font-medium leading-none text-text">8,4</span>
            <span className="text-sm text-muted">/ 10</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[84%] rounded-full bg-[#7fa98c]" />
          </div>
        </motion.div>

        {/* Puce marché (chip flottante) */}
        <motion.div
          variants={cardIn}
          custom={2}
          initial="hidden"
          animate="show"
          className="animate-float absolute left-0 top-0 w-[190px] rounded-[16px] bg-bg-alt p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
          style={{ animationDelay: "0.7s" }}
        >
          <div className="text-[11px] uppercase tracking-wider text-faint">
            Marché · DVF
          </div>
          <div className="mt-1.5 text-lg font-medium text-text">3 050 €/m²</div>
          <div className="mt-1 text-xs text-muted">Loyer estimé 780 €</div>
        </motion.div>
      </div>

      {/* Contenu, aligné en bas-gauche (remonté) */}
      <div className="relative z-20 mx-auto flex w-full max-w-[106rem] flex-1 flex-col justify-end px-[6vw] pb-[16vh] pt-32">
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

        <motion.div
          variants={fade}
          custom={0}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <MagneticButton href="/connexion" className="px-7 py-3.5">
            Ajouter un bien
          </MagneticButton>
          <MagneticButton href="/comment-ca-marche" variant="ghost" className="px-7 py-3.5">
            Comment ça marche
          </MagneticButton>
        </motion.div>
      </div>

      {/* Invite de scroll, bas-gauche (remontée, disparaît au scroll) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: scrolled ? 0 : 1 }}
        className="absolute bottom-12 left-[6vw] z-20 hidden items-center gap-3 text-faint sm:flex"
      >
        <svg width="18" height="27" viewBox="0 0 18 27" fill="none" aria-hidden>
          <rect x="1" y="1" width="16" height="25" rx="8" stroke="currentColor" strokeWidth="1.6" />
          <line x1="9" y1="6" x2="9" y2="11" stroke="currentColor" strokeWidth="1.6" className="animate-scroll-dot" />
        </svg>
        <span className="text-sm font-medium uppercase tracking-wider">Scroll</span>
      </motion.div>
    </header>
  );
}
