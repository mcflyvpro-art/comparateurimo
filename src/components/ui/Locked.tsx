"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { IconLock } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * VERROU FREEMIUM — hors focale.
 *
 * La donnée verrouillée n'est pas cachée : elle est physiquement présente, mais
 * hors du plan de netteté. Au survol elle se rapproche légèrement de la mise au
 * point sans jamais y arriver ; au déverrouillage elle se cale d'un coup.
 *
 * Le paywall cesse d'être une porte fermée pour devenir une démonstration de la
 * promesse du produit : Estio, c'est ce qui fait la mise au point.
 *
 * Ne verrouille jamais une donnée publique brute (DVF, INSEE sont open data) —
 * uniquement l'insight : loyer estimé précis, détail du score, net-net, TRI,
 * projection, scénario en direct.
 */
export function Locked({
  children,
  label = "Réservé aux offres Pro",
  href = "/tarifs",
  className,
  compact = false,
}: {
  children: ReactNode;
  label?: string;
  href?: string;
  className?: string;
  /** Version dense : pas de libellé, juste le cadenas. */
  compact?: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={cx("relative isolate", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        aria-hidden
        className="defocused"
        style={hover ? { filter: "blur(5px) saturate(0.55)", opacity: 0.68 } : undefined}
      >
        {children}
      </div>

      <Link
        href={href}
        className={cx(
          "absolute inset-0 z-10 flex items-center justify-center gap-2",
          "rounded-sm transition-colors duration-[220ms]",
          hover && "bg-[rgb(11_10_9/0.25)]",
        )}
      >
        <span
          className={cx(
            "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1",
            "backdrop-blur-sm transition-[border-color,color,background-color] duration-[220ms]",
            hover
              ? "border-accent-line bg-[var(--accent-line)] text-accent-hot"
              : "border-line bg-[rgb(11_10_9/0.6)] text-text-3",
          )}
        >
          <IconLock size={12} />
          {!compact && <span className="text-[11px] font-medium">{label}</span>}
        </span>
      </Link>
    </div>
  );
}

/**
 * Valeur floutée en ligne — pour une cellule de tableau ou une statistique
 * isolée, là où un calque complet serait trop lourd.
 */
export function LockedValue({
  placeholder = "0 000 €",
  href = "/tarifs",
}: {
  placeholder?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 align-middle"
      title="Réservé aux offres Pro"
    >
      <span className="num defocused-soft text-[13px] text-text-2 transition-[filter] duration-[220ms] group-hover:[filter:blur(2.5px)]">
        {placeholder}
      </span>
      <IconLock
        size={11}
        className="shrink-0 text-text-4 transition-colors group-hover:text-accent"
      />
    </Link>
  );
}
