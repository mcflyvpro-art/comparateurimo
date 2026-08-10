"use client";

import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { computeRendementBrutPct } from "@/lib/calc/score";
import { scoreFromRendement, isStale } from "@/lib/verdict";
import { formatEUR, formatM2 } from "@/lib/format";
import { VerdictPill } from "@/components/ui/Verdict";
import { IconDrag, IconMore, IconNote } from "@/components/ui/Icon";
import { STATUS_COLUMNS, type PipelineProperty, type PropertyStatus } from "@/lib/pipeline-types";
import { cx } from "@/lib/cx";

/**
 * Carte de bien.
 *
 * Quatre informations suffisent à décider si l'on ouvre : OÙ, COMBIEN, QUELLE
 * TAILLE, ÇA VAUT LE COUP OU PAS. Tout le reste est dans le panneau, à un clic.
 *
 * Deux exceptions tolérées, parce qu'elles portent une action :
 *   — le compteur de jours, affiché uniquement quand le bien stagne ;
 *   — le témoin de notes, qui signale qu'il y a du contexte à relire.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QUI A CHANGÉ
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Le clic et le glisser se disputaient TOUTE la surface : seul un seuil de
 * 6 px les séparait, et un clic un peu traînant déplaçait un bien sans qu'on
 * l'ait voulu. Le glisser vit désormais dans une POIGNÉE dédiée, et le reste
 * de la carte redevient un bouton franc.
 *
 * Un menu apparaît au survol : changer d'étape sans ouvrir le panneau était
 * impossible, il fallait ouvrir, viser le rail, refermer.
 */
export function PropertyCard({
  property,
  onOpen,
  onChangeStatus,
}: {
  property: PipelineProperty;
  onOpen: (id: string) => void;
  onChangeStatus?: (id: string, status: PropertyStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: property.id });

  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const score = scoreFromRendement(computeRendementBrutPct(property));
  const stale = isStale(property.daysInStatus);

  useEffect(() => {
    if (!menuOuvert) return;
    const clic = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOuvert(false);
    };
    const touche = (e: KeyboardEvent) => e.key === "Escape" && setMenuOuvert(false);
    document.addEventListener("mousedown", clic);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", clic);
      document.removeEventListener("keydown", touche);
    };
  }, [menuOuvert]);

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      className={cx(
        "group relative rounded-md border border-line-soft bg-surface",
        "transition-[border-color,background-color] duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:border-line-strong hover:bg-surface-hover",
        "focus-within:border-line-strong",
        isDragging && "shadow-[var(--shadow-3)]",
      )}
    >
      {/* La poignée : la SEULE zone qui déclenche un glisser. Elle porte les
          attributs dnd-kit, donc reste atteignable au clavier. */}
      <button
        {...attributes}
        {...listeners}
        aria-label={`Déplacer ${property.address ?? "ce bien"}`}
        className={cx(
          "absolute left-0 top-0 flex h-full w-6 cursor-grab items-center justify-center",
          "rounded-l-md text-text-4 opacity-0 transition-opacity duration-[140ms]",
          "hover:bg-sunken hover:text-text-3 focus-visible:opacity-100 group-hover:opacity-100",
          "active:cursor-grabbing",
        )}
      >
        <IconDrag size={13} />
      </button>

      {/* Le corps : un bouton franc. Plus de conflit avec le glisser. */}
      <button
        type="button"
        onClick={() => onOpen(property.id)}
        className={cx(
          "block w-full select-none rounded-md p-3.5 pl-7 text-left",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        )}
      >
        <h3 className="truncate pr-6 text-[13.5px] font-medium leading-snug text-text">
          {property.address ?? "Adresse non renseignée"}
        </h3>
        <p className="mt-0.5 truncate text-[12px] leading-snug text-text-3">
          {property.city ?? "—"}
        </p>

        <div className="mt-3.5 flex items-baseline justify-between gap-2">
          <span className="num text-[17px] leading-none text-text">
            {formatEUR(property.asking_price)}
          </span>
          <span className="num text-[12px] leading-none text-text-3">
            {formatM2(property.surface_carrez)}
          </span>
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2">
          <VerdictPill score={score} />

          <span className="flex shrink-0 items-center gap-2.5">
            {stale && (
              <span
                className="num text-[11px] text-mid"
                title="Ce bien n'a pas bougé depuis trois semaines"
              >
                {property.daysInStatus} j
              </span>
            )}
            {property.notes.length > 0 && (
              <span
                className="flex items-center gap-1 text-text-4"
                title={`${property.notes.length} note${property.notes.length > 1 ? "s" : ""}`}
              >
                <IconNote size={12} />
                <span className="num text-[11px]">{property.notes.length}</span>
              </span>
            )}
          </span>
        </div>
      </button>

      {/* Changer d'étape sans ouvrir le panneau. */}
      {onChangeStatus && (
        <div ref={menuRef} className="absolute right-1.5 top-1.5">
          <button
            type="button"
            aria-label={`Changer l'étape de ${property.address ?? "ce bien"}`}
            aria-expanded={menuOuvert}
            aria-haspopup="menu"
            onClick={() => setMenuOuvert((v) => !v)}
            className={cx(
              "flex h-6 w-6 items-center justify-center rounded-sm text-text-4",
              "opacity-0 transition-opacity duration-[140ms]",
              "hover:bg-sunken hover:text-text focus-visible:opacity-100 group-hover:opacity-100",
              menuOuvert && "bg-sunken text-text opacity-100",
            )}
          >
            <IconMore size={14} />
          </button>

          {menuOuvert && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-md border border-line bg-surface-active shadow-[var(--shadow-3)]"
            >
              <p className="px-3 pb-1 pt-2 text-[11px] text-text-4">Déplacer vers</p>
              {STATUS_COLUMNS.filter((c) => c.key !== property.status).map((col) => (
                <button
                  key={col.key}
                  role="menuitem"
                  onClick={() => {
                    setMenuOuvert(false);
                    onChangeStatus(property.id, col.key);
                  }}
                  className={cx(
                    "block w-full px-3 py-2 text-left text-[13px] transition-colors",
                    col.key === "ecarte"
                      ? "text-risk hover:bg-[var(--risk-soft)]"
                      : "text-text-2 hover:bg-surface-hover hover:text-text",
                  )}
                >
                  {col.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
