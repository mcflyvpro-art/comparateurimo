"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_FOCAL } from "@/design/tokens";
import { cx } from "@/lib/cx";

/**
 * Questions fréquentes.
 *
 * Les réponses sont volontairement franches, y compris quand elles désavantagent
 * le produit — granularité imparfaite, extraction faillible, absence de garantie.
 * Le public visé est numérique et sceptique : la seule façon de gagner sa
 * confiance est de ne jamais avoir l'air de vendre.
 */

const FAQ = [
  {
    q: "D'où viennent les chiffres ?",
    r: "De sources publiques et officielles : transactions notariées (DVF), carte des loyers, données INSEE de tension et de vacance, risques Géorisques, diagnostics ADEME, adresses BAN. Estio les agrège, les normalise et les met en perspective — il ne les invente ni ne les revend.",
  },
  {
    q: "Les calculs sont-ils fiables ?",
    r: "Le moteur est déterministe : rendement, cash-flow, fiscalité, TRI et plus-value sont des mathématiques exactes et auditables, écrites dans un module testé, sans appel réseau. Aucun chiffre financier n'est produit par une intelligence artificielle — c'est une frontière d'architecture, pas une préférence.",
  },
  {
    q: "Est-ce que vous extrayez les annonces des portails ?",
    r: "Non, jamais. Les conditions d'utilisation de LeBonCoin et SeLoger l'interdisent, et la jurisprudence française est sans ambiguïté. La rampe d'entrée d'Estio, c'est votre propre capture d'écran : vous photographiez ce que vous regardez déjà, ce qui est parfaitement légal.",
  },
  {
    q: "Comment un bien hors-portail entre-t-il dans Estio ?",
    r: "Exactement comme les autres : par capture. PDF d'agence, message de mandataire, photo d'une fiche papier, bien de bouche-à-oreille. C'est justement là que se trouve l'avantage — un agrégateur ne peut pas indexer ce qui n'est publié nulle part, alors qu'on peut photographier n'importe quel document.",
  },
  {
    q: "L'extraction peut-elle se tromper ?",
    r: "Oui, et c'est pour ça que vous validez toujours avant d'enregistrer. Le modèle multimodal lit le document et pré-remplit les champs du bien ; l'écran de confirmation vous montre ce qu'il a compris, et vous corrigez ce qui cloche. Les cas les plus durs — fiches manuscrites, photos de travers — sont aussi les plus stratégiques.",
  },
  {
    q: "Qu'est-ce qui est gratuit, exactement ?",
    r: "Le pré-verdict : le score d'un bien et ses drapeaux, en illimité, quel que soit votre plan. Il n'y a pas de crédit à dépenser pour savoir si une annonce vaut le coup d'œil. Ce qui se débloque avec un abonnement, c'est la précision : loyer estimé exact, détail du score, net-net, TRI, scénario en direct.",
  },
  {
    q: "Quelle est la couverture géographique ?",
    r: "La France entière, dans la limite des données publiques disponibles commune par commune. La qualité est inégale : DVF est plus riche en zone urbaine dense qu'en rural diffus. Nous affichons un indice de fiabilité plutôt que de masquer l'incertitude.",
  },
  {
    q: "Vos données de marché sont-elles précises à l'immeuble ?",
    r: "Non. Tension locative, vacance et prix médians sont établis à la maille communale ou IRIS. Deux appartements de la même rue partagent donc les mêmes valeurs de marché — l'écart entre eux se joue sur leurs caractéristiques propres et sur votre scénario. Nous préférons le dire que de laisser croire à une précision qui n'existe pas.",
  },
  {
    q: "Les projections de revente sont-elles garanties ?",
    r: "Non. Ce sont des scénarios explicitement extrapolés à partir d'hypothèses que vous choisissez — prudent, central ou dynamique. Aucun outil ne peut prédire un marché immobilier ; Estio vous montre l'écart entre les hypothèses plutôt que de vous vendre une certitude.",
  },
  {
    q: "Mes données sont-elles privées ?",
    r: "Vos projets, vos biens, vos notes et vos raisons d'écarter vous appartiennent et ne sont visibles que de vous. Nous ne revendons aucune donnée personnelle. Le détail figure dans la politique de confidentialité.",
  },
  {
    q: "Estio remplace-t-il un conseiller ?",
    r: "Non. C'est un outil d'aide à la décision, pas un conseil en investissement réglementé. Il rassemble et calcule ce qui était éparpillé ; l'engagement reste le vôtre, et les chiffres déterminants méritent d'être confrontés à un professionnel avant signature.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="border-t border-hairline">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-hairline">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-start gap-5 py-5 text-left"
            >
              <span
                className={cx(
                  "num mt-1 shrink-0 text-[11px] transition-colors duration-[220ms]",
                  isOpen ? "text-brand" : "text-text-4 group-hover:text-text-3",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span
                className={cx(
                  "flex-1 text-[15px] font-medium leading-snug transition-colors duration-[220ms]",
                  isOpen ? "text-text" : "text-text-2 group-hover:text-text",
                )}
              >
                {item.q}
              </span>

              {/* Croix qui devient trait — pas de chevron qui pivote */}
              <span className="relative mt-2 block h-3 w-3 shrink-0" aria-hidden>
                <span
                  className={cx(
                    "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 transition-colors duration-[220ms]",
                    isOpen ? "bg-brand" : "bg-text-3",
                  )}
                />
                <span
                  className={cx(
                    "absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-[transform,background-color] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isOpen ? "scale-y-0 bg-brand" : "scale-y-100 bg-text-3",
                  )}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    reduce
                      ? { duration: 0.12 }
                      : { duration: 0.42, ease: EASE_FOCAL }
                  }
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-6 pl-10 pr-8 text-[14px] leading-relaxed text-text-3">
                    {item.r}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
