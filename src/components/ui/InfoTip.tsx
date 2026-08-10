"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";

/**
 * INFOBULLE DE DÉFINITION — rendue dans un portail, jamais en flux.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI UN PORTAIL
 * ─────────────────────────────────────────────────────────────────────────
 *
 * La version précédente positionnait la bulle en `position: absolute` à
 * l'intérieur de son parent. Or presque tous les parents de l'application
 * découpent leur contenu :
 *
 *   — `.disclosure-body > *` est en `overflow: hidden` (c'est ce qui permet
 *     d'animer un dépliage à hauteur automatique) ;
 *   — les cellules de tableau sont en `max-w-0` dans un conteneur `overflow: auto` ;
 *   — le panneau latéral et la fiche sont des zones de défilement ;
 *   — le rail de scénario a son propre `overflow-y-auto`.
 *
 * Résultat : la quasi-totalité des définitions étaient invisibles, coupées par
 * un ancêtre. Aucun `z-index` ne corrige ça — le découpage précède l'empilement.
 *
 * La bulle est donc montée dans `document.body`, en `position: fixed`, à des
 * coordonnées calculées depuis le rectangle du déclencheur. Elle ne peut plus
 * être découpée par quoi que ce soit.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PLACEMENT
 * ─────────────────────────────────────────────────────────────────────────
 *
 * On ancre le BORD de la bulle plutôt que son coin, ce qui évite d'avoir à
 * mesurer sa hauteur avant de la positionner :
 *   — au-dessus  → on fixe `bottom` à partir du haut du déclencheur ;
 *   — en dessous → on fixe `top` à partir de son bas.
 * L'axe horizontal est centré puis borné à la fenêtre, pour qu'une définition
 * en bord d'écran reste entièrement lisible.
 */

const WIDTH = 288;
const GAP = 10;
const MARGIN = 12;

type Position = {
  left: number;
  arrowLeft: number;
  top?: number;
  bottom?: number;
  placement: "top" | "bottom";
};

function computePosition(el: HTMLElement): Position {
  const r = el.getBoundingClientRect();
  const centerX = r.left + r.width / 2;

  const left = Math.min(
    Math.max(MARGIN, centerX - WIDTH / 2),
    window.innerWidth - WIDTH - MARGIN,
  );

  // Assez de place au-dessus ? Sinon on bascule dessous.
  const placement: "top" | "bottom" = r.top > 240 ? "top" : "bottom";

  return {
    left,
    arrowLeft: centerX - left,
    placement,
    ...(placement === "top"
      ? { bottom: window.innerHeight - r.top + GAP }
      : { top: r.bottom + GAP }),
  };
}

export function InfoTip({
  text,
  title,
  className,
}: {
  text: string;
  /** Le terme défini — affiché en tête de bulle. */
  title?: string;
  className?: string;
}) {
  const [pos, setPos] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const open = pos !== null;

  const place = useCallback(() => {
    if (triggerRef.current) setPos(computePosition(triggerRef.current));
  }, []);

  const close = useCallback(() => setPos(null), []);

  // Tant que la bulle est ouverte, elle suit son déclencheur : sans ça, un
  // défilement la laisserait flotter à l'ancienne position.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, place, close]);

  return (
    <>
      {/* La zone cliquable déborde du glyphe : viser un rond de 16 px à la
          souris est pénible, et impossible au doigt. */}
      <span className={cx("relative -m-1.5 inline-flex p-1.5 align-middle", className)}>
        <button
          ref={triggerRef}
          type="button"
          aria-label={title ? `Définition : ${title}` : "Définition"}
          aria-expanded={open}
          aria-describedby={open ? id : undefined}
          onPointerEnter={place}
          onPointerLeave={close}
          onFocus={place}
          onBlur={close}
          onClick={() => (open ? close() : place())}
          className={cx(
            "flex h-4 w-4 items-center justify-center rounded-full border",
            "text-[10px] font-medium leading-none",
            "transition-[background-color,border-color,color] duration-[140ms]",
            open
              ? "border-brand bg-brand text-inverse"
              : "border-hairline-3 text-text-3 hover:border-brand hover:bg-brand hover:text-inverse",
          )}
        >
          ?
        </button>
      </span>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: WIDTH,
              zIndex: 9998,
            }}
            className="pointer-events-none block rounded-md border border-hairline-2 bg-high p-4 text-left font-normal normal-case tracking-normal shadow-[var(--lift-3)]"
          >
            {title && (
              <span className="mb-2 block text-[12.5px] font-medium text-text">
                {title}
              </span>
            )}
            <span className="block text-[12.5px] leading-relaxed text-text-2">{text}</span>

            {/* Pointe : un carré pivoté qui prolonge la bordure du bon côté. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: pos.arrowLeft - 5,
                ...(pos.placement === "top" ? { bottom: -5 } : { top: -5 }),
              }}
              className={cx(
                "h-2.5 w-2.5 rotate-45 bg-high",
                pos.placement === "top"
                  ? "border-b border-r border-hairline-2"
                  : "border-l border-t border-hairline-2",
              )}
            />
          </span>,
          document.body,
        )}
    </>
  );
}
