import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Panneau — la surface de base de l'outil.
 *
 * Un cran au-dessus du fond, cerné d'un filet, sans ombre : dans le noir, la
 * profondeur se lit par le contraste de fond.
 *
 * L'en-tête a perdu son index sérigraphié « 01, 02, 03… » : numéroter des
 * sections suggère un ordre à suivre, alors que l'utilisateur lit celle qui
 * l'intéresse. C'était de l'ornement déguisé en système.
 */

export function Panel({
  children,
  className,
  flush = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Supprime le rembourrage interne (tableaux, médias pleine largeur). */
  flush?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cx(
        "rounded-lg border border-hairline bg-surface",
        !flush && "p-6 sm:p-7",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  aside,
  className,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-6 flex items-baseline justify-between gap-4", className)}>
      <h2 className="t-head text-text">{title}</h2>
      {aside}
    </div>
  );
}

/** Séparateur horizontal filaire. Un seul filet, jamais deux collés. */
export function Rule({ className }: { className?: string }) {
  return <div className={cx("h-px w-full bg-hairline", className)} aria-hidden />;
}
