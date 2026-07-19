"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const FAQ = [
  {
    q: "D'où viennent les chiffres ?",
    r: "De sources publiques officielles : transactions notariées (DVF), loyers de référence, données INSEE, risques Géorisques, DPE ADEME. Estio les agrège et les met en perspective.",
  },
  {
    q: "Les calculs sont-ils fiables ?",
    r: "Le moteur de calcul est déterministe : rendement, cash-flow, fiscalité et TRI sont des maths exactes et auditables. Aucun chiffre financier n'est produit par une IA.",
  },
  {
    q: "Est-ce que mes données sont en sécurité ?",
    r: "Tes biens et comparaisons te sont privés. Nous ne revendons pas de données personnelles. Détails dans la politique de confidentialité.",
  },
  {
    q: "C'est quoi un crédit ?",
    r: "Un crédit analyse un bien neuf et l'ajoute à ton wallet. Ensuite, tu le recompares gratuitement. Tu ne paies que pour un bien encore jamais analysé.",
  },
  {
    q: "Quelle est la couverture géographique ?",
    r: "La France, dans la limite des données publiques disponibles pour chaque commune. La granularité varie selon les sources.",
  },
  {
    q: "Les projections de revente sont-elles garanties ?",
    r: "Non. Ce sont des scénarios explicites fondés sur des hypothèses, pas des prédictions. Estio le signale toujours clairement.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="divide-y divide-border border-y border-border">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-sans text-lg font-medium text-text">
                {item.q}
              </span>
              <svg
                className={`size-5 shrink-0 text-brand transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="10" y1="4" x2="10" y2="16" />
                <line x1="4" y1="10" x2="16" y2="10" />
              </svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    reduce ? { duration: 0.15 } : { type: "spring", stiffness: 120, damping: 22 }
                  }
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-10 leading-relaxed text-muted">{item.r}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
