"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { IconMore, IconPencil, IconTrash } from "@/components/ui/Icon";
import {
  addQuickNote,
  deleteNote,
  setNoteKind,
  updateNote,
} from "@/app/(app)/app/p/[projectId]/actions";
import type { NoteKind, PipelineNote } from "@/lib/pipeline-types";
import { cx } from "@/lib/cx";

/**
 * Les notes d'un bien.
 *
 * Elles ne pouvaient qu'être ajoutées : ni corrigées, ni supprimées, ni typées.
 * Or une note se prend dans une cage d'escalier en sortant d'une visite — c'est
 * exactement le texte qu'on veut pouvoir reprendre.
 *
 * Le TYPE de note existait en base (`note_kind`) sans qu'aucun écran ne
 * l'expose. C'est pourtant lui qui distingue « le voisin est bruyant » de
 * « il descend à 240 000 » — la seconde vaut de l'argent au moment de négocier.
 */

const TYPES: { key: NoteKind; label: string; aide: string }[] = [
  { key: "note", label: "Note", aide: "Une observation libre" },
  { key: "visite", label: "Visite", aide: "Ce que vous avez vu sur place" },
  { key: "nego", label: "Négo", aide: "Un échange sur le prix" },
];

const LIBELLE = Object.fromEntries(TYPES.map((t) => [t.key, t.label])) as Record<NoteKind, string>;

export function NoteList({
  propertyId,
  notes,
  onOptimisticAdd,
}: {
  propertyId: string;
  notes: PipelineNote[];
  /** Ajout optimiste géré par l'appelant, quand il tient déjà l'état local. */
  onOptimisticAdd?: (body: string, kind: NoteKind) => Promise<void>;
}) {
  const router = useRouter();
  const { pousser } = useToast();
  const [saisie, setSaisie] = useState("");
  const [typeSaisie, setTypeSaisie] = useState<NoteKind>("note");
  const [enCours, startTransition] = useTransition();

  function ajouter() {
    const propre = saisie.trim();
    if (!propre) return;
    setSaisie("");

    startTransition(async () => {
      try {
        if (onOptimisticAdd) await onOptimisticAdd(propre, typeSaisie);
        else {
          await addQuickNote(propertyId, propre, typeSaisie);
          router.refresh();
        }
      } catch (e) {
        setSaisie(propre);
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "La note n'a pas pu être enregistrée.",
        });
      }
    });
  }

  return (
    <div>
      {notes.length === 0 ? (
        <p className="text-[12.5px] leading-relaxed text-text-4">
          Le prix plancher du vendeur, le nom de l&apos;agent, la raison de votre
          hésitation — c&apos;est ici que ça se garde.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </ul>
      )}

      <div className="mt-3">
        {/* Le type se choisit AVANT d'écrire : après, on a déjà oublié pourquoi
            on notait. Trois puces, pas un menu déroulant. */}
        <div className="mb-2 flex gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              title={t.aide}
              onClick={() => setTypeSaisie(t.key)}
              className={cx(
                "rounded-pill border px-2.5 py-1 text-[12px] transition-colors",
                typeSaisie === t.key
                  ? "border-transparent bg-accent-soft text-accent-hot"
                  : "border-line text-text-3 hover:border-line-strong hover:text-text",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Textarea
          value={saisie}
          rows={2}
          placeholder="Ajouter une note…"
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            // Entrée envoie, Maj+Entrée passe à la ligne : une note fait souvent
            // une seule phrase, l'envoi doit coûter une touche.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ajouter();
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-text-4">Entrée pour enregistrer</span>
          <Button
            variant="outline"
            size="sm"
            disabled={enCours || !saisie.trim()}
            onClick={ajouter}
          >
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}

function NoteItem({ note }: { note: PipelineNote }) {
  const router = useRouter();
  const { pousser } = useToast();
  const [edite, setEdite] = useState(false);
  const [brouillon, setBrouillon] = useState(note.body);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [enCours, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

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

  function ouvrirEdition() {
    setBrouillon(note.body);
    setMenuOuvert(false);
    setEdite(true);
  }

  function valider() {
    const propre = brouillon.trim();
    setEdite(false);
    if (!propre || propre === note.body) return;

    startTransition(async () => {
      try {
        const { ancien } = await updateNote(note.id, propre);
        pousser({
          tone: "succes",
          message: "Note modifiée.",
          actionLabel: "Annuler",
          onAction: async () => {
            await updateNote(note.id, ancien);
            router.refresh();
          },
        });
        router.refresh();
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Modification impossible.",
        });
      }
    });
  }

  function changerType(kind: NoteKind) {
    setMenuOuvert(false);
    startTransition(async () => {
      try {
        await setNoteKind(note.id, kind);
        router.refresh();
      } catch {
        pousser({ tone: "erreur", message: "Changement de type impossible." });
      }
    });
  }

  function supprimer() {
    setMenuOuvert(false);
    startTransition(async () => {
      try {
        const ancienne = await deleteNote(note.id);
        pousser({
          tone: "succes",
          message: "Note supprimée.",
          actionLabel: "Annuler",
          onAction: async () => {
            // On recrée la note : sa date change, mais son contenu et son type
            // sont rendus. Mieux qu'une corbeille invisible.
            await addQuickNote(ancienne.propertyId, ancienne.body, ancienne.kind);
            router.refresh();
          },
        });
        router.refresh();
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Suppression impossible.",
        });
      }
    });
  }

  return (
    <li
      className={cx(
        "group relative rounded-sm bg-surface-hover px-3 py-2.5 transition-opacity",
        enCours && "opacity-50",
      )}
    >
      {edite ? (
        <Textarea
          // Le champ n'est monté que pendant l'édition : `autoFocus` suffit,
          // et évite d'ajouter un transfert de ref à une primitive partagée.
          autoFocus
          value={brouillon}
          rows={3}
          onChange={(e) => setBrouillon(e.target.value)}
          onBlur={valider}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); valider(); }
            if (e.key === "Escape") { e.preventDefault(); setEdite(false); }
          }}
        />
      ) : (
        <>
          <p className="whitespace-pre-wrap pr-7 text-[12.5px] leading-relaxed text-text-2">
            {note.body}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            {note.kind !== "note" && (
              <span className="rounded-pill bg-sunken px-1.5 py-0.5 text-[10.5px] text-text-3">
                {LIBELLE[note.kind]}
              </span>
            )}
            <span className="num text-[11px] text-text-4">
              {new Date(note.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        </>
      )}

      <div ref={menuRef} className="absolute right-1.5 top-1.5">
        <button
          type="button"
          aria-label="Actions sur cette note"
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
            <button
              role="menuitem"
              onClick={ouvrirEdition}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-text-2 transition-colors hover:bg-surface-hover hover:text-text"
            >
              <IconPencil size={13} />
              Modifier
            </button>

            <div className="h-px bg-line-soft" />
            <p className="px-3 pb-1 pt-2 text-[11px] text-text-4">Type</p>
            {TYPES.map((t) => (
              <button
                key={t.key}
                role="menuitem"
                onClick={() => changerType(t.key)}
                className={cx(
                  "block w-full px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-surface-hover",
                  note.kind === t.key ? "text-accent-hot" : "text-text-2 hover:text-text",
                )}
              >
                {t.label}
              </button>
            ))}

            <div className="h-px bg-line-soft" />
            <button
              role="menuitem"
              onClick={supprimer}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-risk transition-colors hover:bg-[var(--risk-soft)]"
            >
              <IconTrash size={13} />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
