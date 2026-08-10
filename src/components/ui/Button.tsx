import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Bouton — l'organe d'action de l'instrument.
 *
 * Arêtes tendues (4 px), pas de rondeur bonbon, pas d'ombre portée. La braise
 * est réservée à l'action qui engage : un seul bouton `solid` par écran. Tout
 * le reste est filaire ou muet, pour que l'œil sache immédiatement où est la
 * décision.
 */

type Variant = "solid" | "outline" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-sm font-medium " +
  "tracking-[-0.01em] whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] " +
  "duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)] " +
  "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40";

const VARIANTS: Record<Variant, string> = {
  solid:
    "bg-accent text-ink-fg hover:bg-accent-hot " +
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] " +
    "hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.24),0_6px_28px_-8px_var(--accent-glow)]",
  outline:
    "border border-line text-text hover:border-line-strong hover:bg-surface-hover",
  quiet: "text-text-2 hover:text-text hover:bg-surface-hover",
  danger:
    "border border-[color-mix(in_srgb,var(--danger)_45%,transparent)] text-danger " +
    "hover:bg-[var(--danger-soft)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9.5 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  /** Icône rendue à gauche du libellé. */
  icon?: ReactNode;
  /** Icône rendue à droite, typiquement une flèche. */
  trailing?: ReactNode;
};

export function Button({
  variant = "outline",
  size = "md",
  icon,
  trailing,
  children,
  className,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {icon}
      {children}
      {trailing}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "outline",
  size = "md",
  icon,
  trailing,
  children,
  className,
  ...rest
}: CommonProps & { href: string } & Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >) {
  return (
    <Link
      href={href}
      className={cx(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {icon}
      {children}
      {trailing}
    </Link>
  );
}

/**
 * Bouton carré à icône seule. Exige toujours un `aria-label` — l'icône ne
 * suffit jamais à un lecteur d'écran.
 */
export function IconButton({
  variant = "quiet",
  size = "md",
  children,
  className,
  ...rest
}: Omit<CommonProps, "icon" | "trailing"> &
  ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  const square = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9.5 w-9.5";
  return (
    <button
      className={cx(BASE, VARIANTS[variant], square, "px-0", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
