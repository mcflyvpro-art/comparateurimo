"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/ui/Feedback";

/**
 * L'ENTONNOIR — quatre chiffres qui racontent une recherche d'achat.
 *
 * C'est le seul endroit du site où un chiffre est là pour frapper plutôt que
 * pour informer. Il raconte pourtant une vérité vérifiable : deux cents annonces
 * vues, une vingtaine retenues, deux ou trois finalistes, une offre. C'est
 * exactement le trou que le produit comble — personne n'outille le milieu.
 *
 * Les barres sous les nombres donnent la proportion réelle : la dernière fait
 * un demi pour cent de la première. On comprend l'entonnoir sans le mot.
 */

const FIGURES = [
  {
    to: 200,
    suffix: "",
    label: "annonces vues",
    sub: "sur quatre mois de recherche",
    width: 100,
    color: "var(--text-3)",
  },
  {
    to: 20,
    suffix: "",
    label: "retenues",
    sub: "celles qui méritent un calcul",
    width: 34,
    color: "var(--mid)",
  },
  {
    to: 3,
    suffix: "",
    label: "finalistes",
    sub: "entre lesquels on hésite vraiment",
    width: 11,
    color: "var(--good)",
  },
  {
    to: 1,
    suffix: "",
    label: "offre",
    sub: "et tout se joue là",
    width: 4,
    color: "var(--accent)",
  },
];

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();

  const value = useSpring(0, { duration: 1.4, bounce: 0 });
  const text = useTransform(value, (v) => Math.round(v).toLocaleString("fr-FR"));

  useEffect(() => {
    if (inView) value.set(reduce ? to : to);
  }, [inView, to, value, reduce]);

  return (
    <span ref={ref} className="num-hero block text-text">
      <motion.span>{text}</motion.span>
    </span>
  );
}

export function KeyFigures() {
  return (
    <section data-header-theme="dark" className="border-t border-line-soft py-24 lg:py-32">
      <div className="mx-auto max-w-[104rem] px-[var(--gutter)]">
        <Reveal cine>
          <h2 className="t-title max-w-2xl text-text">
            Une recherche, c&apos;est un entonnoir.
          </h2>
          <p className="t-lead mt-6 max-w-lg">
            Et jusqu&apos;ici, personne n&apos;outillait le milieu.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map((f, i) => (
            <Reveal key={f.label} cine delay={i * 0.08}>
              <div>
                <Counter to={f.to} />
                <p className="mt-3 text-[15px] font-medium text-text">{f.label}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-3">{f.sub}</p>

                <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-surface-active">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: f.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${f.width}%` }}
                    viewport={{ once: true, margin: "-15%" }}
                    transition={{
                      duration: 1.1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.15 + i * 0.08,
                    }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
