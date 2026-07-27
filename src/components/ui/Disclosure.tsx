"use client";

import { useId, useState, type ReactNode } from "react";
import { IconChevronDown } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * REPLI — l'ossature de la divulgation progressive.
 *
 * Principe directeur de la v2 : rien n'est supprimé, tout est rangé. Un
 * primo-investisseur n'a pas besoin de voir deux cent quarante lignes
 * d'amortissement pour décider s'il visite un appartement — mais il doit
 * pouvoir les ouvrir en un clic, et savoir qu'elles existent.
 *
 * Le résumé à droite du titre est essentiel : il donne la substance du bloc
 * replié, pour qu'on n'ait pas à l'ouvrir « au cas où ». Un repli sans résumé
 * est une information cachée ; avec résumé, c'est une information rangée.
 *
 * L'animation passe par `grid-template-rows: 0fr → 1fr` (voir `globals.css`),
 * ce qui anime une hauteur automatique sans mesure JavaScript.
 */
export function Disclosure({
  title,
  summary,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  /** La substance du bloc, visible sans l'ouvrir. */
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className={cx("border-t border-hairline", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-center gap-3 py-3.5 text-left"
      >
        <IconChevronDown
          size={14}
          className={cx(
            "shrink-0 text-text-4 transition-transform duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            open ? "rotate-0" : "-rotate-90",
            "group-hover:text-text-2",
          )}
        />
        <span
          className={cx(
            "text-[13.5px] font-medium transition-colors",
            open ? "text-text" : "text-text-2 group-hover:text-text",
          )}
        >
          {title}
        </span>
        <span className="h-px flex-1 bg-hairline" aria-hidden />
        {summary && !open && (
          <span className="num shrink-0 text-[12px] text-text-3">{summary}</span>
        )}
      </button>

      <div id={id} className="disclosure-body" data-open={open}>
        <div>
          <div className="pb-6 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
