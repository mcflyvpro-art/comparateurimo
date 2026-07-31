"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GLOSSARY, type TermKey } from "@/lib/glossary";
import { InfoTip } from "@/components/ui/Feedback";
import { IconPencil } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/lib/cx";

/**
 * CHAMP ÉDITABLE EN PLACE.
 *
 * La fiche était entièrement en lecture seule : une faute de frappe à la
 * création restait pour toujours. Plutôt qu'un mode « édition » global — qui
 * oblige à basculer, à valider, et à se demander ce qui a changé — chaque
 * valeur devient modifiable là où elle se lit.
 *
 * Les décisions qui comptent :
 *
 *   — Au repos, le champ ressemble à un `Stat`. Rien ne clignote, rien ne
 *     réclame l'attention. L'affordance apparaît au survol et au focus.
 *   — `Entrée` valide, `Échap` annule et restaure la valeur d'origine.
 *   — La sortie du champ (blur) valide aussi : personne ne devrait perdre une
 *     saisie parce qu'il a cliqué ailleurs.
 *   — On n'écrit QUE si la valeur a changé. Ouvrir et refermer sans rien
 *     toucher ne doit produire ni requête, ni bannière, ni ligne d'historique.
 *   — Chaque enregistrement propose une annulation portant l'ancienne valeur.
 *
 * Le champ est un vrai `<button>` au repos : focusable au clavier, activable
 * par Entrée, annoncé comme modifiable par un lecteur d'écran.
 */

type Kind = "texte" | "nombre" | "choix";

export function Editable({
  term,
  label,
  /** La valeur brute, telle qu'elle part en base. */
  value,
  /** La valeur telle qu'elle se lit — formatée (€, m², %…). */
  display,
  kind = "texte",
  options,
  unit,
  placeholder,
  hint,
  size = "md",
  tone,
  onSave,
  className,
  layout = "stat",
}: {
  term?: TermKey;
  label?: string;
  value: string | number | null;
  display?: ReactNode;
  kind?: Kind;
  options?: { valeur: string; libelle: string }[];
  unit?: string;
  placeholder?: string;
  hint?: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: string;
  /** Doit renvoyer l'ancienne valeur, pour rendre l'annulation possible. */
  onSave: (nouvelle: string | number | null) => Promise<{ ancienne: unknown } | void>;
  className?: string;
  /** `stat` : libellé au-dessus, pour les grilles. `row` : libellé à gauche,
   *  pour les listes longues où une grille serait surdimensionnée. */
  layout?: "stat" | "row";
}) {
  const entry = term ? GLOSSARY[term] : null;
  const libelle = label ?? entry?.label ?? "";

  const [edite, setEdite] = useState(false);
  const [brouillon, setBrouillon] = useState(String(value ?? ""));
  const [enCours, setEnCours] = useState(false);
  const champRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const { pousser } = useToast();

  useEffect(() => {
    if (edite) champRef.current?.focus();
  }, [edite]);

  /** Le brouillon se dérive de la valeur au MOMENT de l'ouverture, pas par un
   *  effet de synchronisation : la valeur affichée au repos vient déjà de
   *  `value`, et resynchroniser en continu provoquerait des rendus en cascade. */
  function ouvrir() {
    setBrouillon(String(value ?? ""));
    setEdite(true);
  }

  const valueClass = {
    sm: "text-[13px] leading-snug",
    md: "text-[15px] leading-snug",
    lg: "text-[1.5rem] leading-none tracking-[-0.03em]",
  }[size];

  async function valider() {
    const brut = brouillon.trim();
    const nouvelle: string | number | null =
      brut === "" ? null : kind === "nombre" ? Number(brut.replace(/[^\d.,-]/g, "").replace(",", ".")) : brut;

    if (kind === "nombre" && nouvelle !== null && !Number.isFinite(nouvelle as number)) {
      pousser({ tone: "erreur", message: `« ${brouillon} » n'est pas un nombre.` });
      setBrouillon(String(value ?? ""));
      setEdite(false);
      return;
    }

    // Rien n'a bougé : on sort sans rien écrire ni annoncer.
    if (String(nouvelle ?? "") === String(value ?? "")) {
      setEdite(false);
      return;
    }

    setEdite(false);
    setEnCours(true);
    try {
      const res = await onSave(nouvelle);
      const ancienne = res && "ancienne" in res ? res.ancienne : value;
      pousser({
        tone: "succes",
        message: `${libelle} enregistré.`,
        actionLabel: "Annuler",
        onAction: async () => {
          await onSave((ancienne as string | number | null) ?? null);
          pousser({ tone: "neutre", message: `${libelle} rétabli.` });
        },
      });
    } catch (e) {
      setBrouillon(String(value ?? ""));
      pousser({
        tone: "erreur",
        message: e instanceof Error ? e.message : `Impossible d'enregistrer ${libelle}.`,
      });
    } finally {
      setEnCours(false);
    }
  }

  function annuler() {
    setBrouillon(String(value ?? ""));
    setEdite(false);
  }

  const enLigne = layout === "row";

  return (
    <div
      className={cx(
        "group min-w-0",
        enLigne && "flex items-baseline justify-between gap-4 border-b border-hairline py-1.5 last:border-0",
        className,
      )}
    >
      <dt className={cx("flex items-center gap-1.5", enLigne && "shrink-0")}>
        <span
          className={cx(
            "truncate leading-tight text-text-3",
            enLigne ? "text-[13px]" : "text-[12px]",
          )}
        >
          {libelle}
        </span>
        {entry && <InfoTip text={entry.def} title={entry.label} />}
      </dt>

      <dd className={cx(enLigne ? "min-w-0 flex-1 text-right" : "mt-1.5")}>
        {edite ? (
          kind === "choix" ? (
            <select
              ref={champRef as React.RefObject<HTMLSelectElement>}
              value={brouillon}
              onChange={(e) => setBrouillon(e.target.value)}
              onBlur={valider}
              onKeyDown={(e) => {
                if (e.key === "Escape") { e.preventDefault(); annuler(); }
              }}
              className={cx(
                "w-full rounded-sm border border-brand bg-surface px-2 py-1 text-text outline-none",
                valueClass,
              )}
            >
              <option value="">—</option>
              {options?.map((o) => (
                <option key={o.valeur} value={o.valeur}>{o.libelle}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                ref={champRef as React.RefObject<HTMLInputElement>}
                value={brouillon}
                inputMode={kind === "nombre" ? "decimal" : undefined}
                placeholder={placeholder}
                onChange={(e) => setBrouillon(e.target.value)}
                onBlur={valider}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); valider(); }
                  if (e.key === "Escape") { e.preventDefault(); annuler(); }
                }}
                className={cx(
                  "num min-w-0 flex-1 rounded-sm border border-brand bg-surface px-2 py-1 text-text outline-none",
                  valueClass,
                )}
              />
              {unit && <span className="shrink-0 text-[12px] text-text-4">{unit}</span>}
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={ouvrir}
            aria-label={`${libelle} — modifier`}
            className={cx(
              "-mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-sm px-2 py-1",
              "transition-colors duration-[140ms]",
              "hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
              enLigne ? "justify-end text-right" : "text-left",
              enCours && "opacity-50",
            )}
          >
            <span
              className={cx(
                "num min-w-0 truncate text-text",
                enLigne ? "text-[13px]" : cx("flex-1", valueClass),
              )}
              style={tone ? { color: tone } : undefined}
            >
              {display ?? (value === null || value === "" ? <span className="text-text-4">—</span> : value)}
            </span>
            <IconPencil
              size={12}
              className="shrink-0 text-text-4 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </button>
        )}
      </dd>

      {hint && <p className="mt-1 text-[11.5px] leading-snug text-text-4">{hint}</p>}
    </div>
  );
}
