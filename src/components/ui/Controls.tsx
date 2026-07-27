"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { spring } from "@/design/tokens";
import { cx } from "@/lib/cx";

/**
 * Contrôles de sélection — puces, onglets, bascules.
 *
 * Aucun onglet en forme de gélule : l'actif se signale par un filet incandescent
 * qui glisse sous le libellé, comme le repère d'une règle qu'on aligne.
 */

/** Puce de filtre ou d'étiquette. Le point coloré porte le statut. */
export function Chip({
  children,
  active = false,
  dot,
  onClick,
  className,
  title,
}: {
  children: ReactNode;
  active?: boolean;
  /** Couleur du témoin, typiquement une couleur d'étape du pipeline. */
  dot?: string;
  onClick?: () => void;
  className?: string;
  title?: string;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      aria-pressed={onClick ? active : undefined}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium",
        "transition-[background-color,border-color,color] duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)]",
        onClick && "cursor-pointer",
        active
          ? "border-hairline-ember bg-[var(--brand-wash)] text-brand-hot"
          : "border-hairline-2 text-text-2",
        onClick && !active && "hover:border-hairline-3 hover:text-text",
        className,
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: dot }}
          aria-hidden
        />
      )}
      {children}
    </Tag>
  );
}

type SegmentItem = {
  key: string;
  label: string;
  href?: string;
  icon?: ReactNode;
};

/**
 * Onglets à repère glissant. `layoutId` fait courir le filet d'un onglet à
 * l'autre plutôt que de le faire clignoter — c'est le geste qui rend la
 * navigation lisible.
 */
export function Segmented({
  items,
  active,
  onSelect,
  className,
  layoutKey = "segmented",
}: {
  items: SegmentItem[];
  active: string;
  onSelect?: (key: string) => void;
  className?: string;
  layoutKey?: string;
}) {
  return (
    <div className={cx("flex items-stretch gap-0.5", className)} role="tablist">
      {items.map((item) => {
        const isActive = item.key === active;
        const inner = (
          <>
            {item.icon}
            <span>{item.label}</span>
            {isActive && (
              <motion.span
                layoutId={layoutKey}
                transition={spring.ui}
                className="absolute inset-x-2 -bottom-px h-px bg-brand"
              />
            )}
          </>
        );
        const cls = cx(
          "relative flex items-center gap-2 px-3 py-2.5 text-[13px]",
          "transition-colors duration-[140ms]",
          isActive ? "font-medium text-text" : "text-text-3 hover:text-text-2",
        );

        return item.href ? (
          <Link
            key={item.key}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            className={cls}
          >
            {inner}
          </Link>
        ) : (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect?.(item.key)}
            className={cls}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Bascule binaire encadrée — granularité annuel/mensuel, mensuel/annuel.
 * Le fond actif glisse, il n'apparaît pas.
 */
export function Toggle({
  items,
  active,
  onSelect,
  className,
  layoutKey = "toggle",
}: {
  items: { key: string; label: string }[];
  active: string;
  onSelect: (key: string) => void;
  className?: string;
  layoutKey?: string;
}) {
  return (
    <div
      className={cx(
        "inline-flex rounded-sm border border-hairline-2 bg-sunken p-0.5",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            aria-pressed={isActive}
            className={cx(
              "relative rounded-[3px] px-3 py-1 text-xs font-medium transition-colors duration-[140ms]",
              isActive ? "text-inverse" : "text-text-3 hover:text-text",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutKey}
                transition={spring.ui}
                className="absolute inset-0 rounded-[3px] bg-brand"
              />
            )}
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
