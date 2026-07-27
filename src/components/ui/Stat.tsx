"use client";

import type { ReactNode } from "react";
import { GLOSSARY, type TermKey } from "@/lib/glossary";
import { InfoTip } from "@/components/ui/Feedback";
import { cx } from "@/lib/cx";

/**
 * STATISTIQUE — l'unité atomique de l'outil.
 *
 * Ce qui a changé en v2 :
 *
 *   — Les pastilles de provenance N1/N2/N3 ont disparu. Cinquante marques
 *     colorées sur une fiche, c'était un système à apprendre avant de pouvoir
 *     lire un chiffre. La provenance se dit maintenant une fois par section,
 *     en toutes lettres.
 *
 *   — L'étiquette n'est plus une capitale de 11 px. C'est du texte, en casse
 *     de phrase, à une taille lisible.
 *
 *   — Un `term` suffit désormais à produire le libellé ET sa définition, tirés
 *     du glossaire. Aucun texte d'explication n'est plus rédigé au cas par cas,
 *     donc aucun terme ne peut rester sans définition par oubli.
 */

export function Stat({
  term,
  label,
  value,
  hint,
  size = "md",
  tone,
  className,
}: {
  /** Clé de glossaire — fournit le libellé et la définition. */
  term?: TermKey;
  /** Libellé explicite, si le terme n'a pas besoin d'être défini. */
  label?: string;
  value: ReactNode;
  /** Précision courte sous la valeur. Une poignée de mots, pas une phrase. */
  hint?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Couleur de la valeur — réservée aux cas où le signe compte vraiment. */
  tone?: string;
  className?: string;
}) {
  const entry = term ? GLOSSARY[term] : null;
  const displayLabel = label ?? entry?.label ?? "";

  const valueClass = {
    sm: "text-[13px] leading-snug",
    md: "text-[15px] leading-snug",
    lg: "text-[1.5rem] leading-none tracking-[-0.03em]",
  }[size];

  return (
    <div className={cx("min-w-0", className)}>
      <dt className="flex items-center gap-1.5">
        <span className="truncate text-[12px] leading-tight text-text-3">
          {displayLabel}
        </span>
        {entry && <InfoTip text={entry.def} title={entry.label} />}
      </dt>
      <dd
        className={cx("num mt-1.5 text-text", valueClass)}
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </dd>
      {hint && <p className="mt-1 text-[11.5px] leading-snug text-text-4">{hint}</p>}
    </div>
  );
}

/** Grille de statistiques. Gouttières généreuses : c'est l'air qui fait lire. */
export function StatGrid({
  children,
  cols = 3,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const map = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  } as const;
  return (
    <dl className={cx("grid gap-x-8 gap-y-6", map[cols], className)}>{children}</dl>
  );
}

/**
 * Ligne de description — pour les champs textuels du bien, où une grille de
 * statistiques serait surdimensionnée.
 */
export function Field({
  term,
  label,
  value,
}: {
  term?: TermKey;
  label?: string;
  value: ReactNode;
}) {
  const entry = term ? GLOSSARY[term] : null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-0">
      <dt className="flex items-center gap-1.5 text-[13px] text-text-3">
        {label ?? entry?.label}
        {entry && <InfoTip text={entry.def} title={entry.label} />}
      </dt>
      <dd className="num shrink-0 text-[13px] text-text">{value}</dd>
    </div>
  );
}

/**
 * Marqueur de provenance — une seule fois par section, jamais par chiffre.
 */
export function SourceTag({
  kind,
  className,
}: {
  kind: "public" | "vous" | "calcule";
  className?: string;
}) {
  const map = {
    public: {
      label: "Données publiques",
      title:
        "Dérivé automatiquement de l'adresse, à partir de jeux de données officiels et ouverts. Recalculé à chaque ouverture.",
      color: "var(--info)",
    },
    vous: {
      label: "Vos informations",
      title: "Ce que vous avez saisi, ou ce que la capture a extrait puis que vous avez validé.",
      color: "var(--text-3)",
    },
    calcule: {
      label: "Selon vos hypothèses",
      title:
        "Calculé à partir des réglages du scénario. Modifiez un curseur et ces chiffres changent immédiatement.",
      color: "var(--text-3)",
    },
  }[kind];

  return (
    <span
      title={map.title}
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 text-[11.5px]",
        className,
      )}
      style={{ color: map.color }}
    >
      <span
        aria-hidden
        className="h-1 w-1 rounded-full"
        style={{ background: map.color }}
      />
      {map.label}
    </span>
  );
}
