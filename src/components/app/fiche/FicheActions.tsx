"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, IconButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { IconCopy, IconMore, IconTrash } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import {
  compterDependances,
  deleteProperty,
  duplicateProperty,
} from "@/app/(app)/app/p/[projectId]/bien/[propertyId]/property-actions";
import { cx } from "@/lib/cx";

/**
 * Actions sur le bien entier — dupliquer, supprimer.
 *
 * Deux principes tenus ici :
 *
 *   — Une action réversible n'a pas besoin d'être confirmée : dupliquer se
 *     fait d'un clic, et la bannière propose d'annuler.
 *   — Une action irréversible doit NOMMER ce qu'elle détruit. « Êtes-vous
 *     sûr ? » ne prévient de rien ; « 3 notes, 8 photos et 2 documents seront
 *     supprimés avec » prévient vraiment.
 */
export function FicheActions({
  propertyId,
  projectId,
  adresse,
}: {
  propertyId: string;
  projectId: string;
  adresse: string;
}) {
  const router = useRouter();
  const { pousser } = useToast();
  const [ouvert, setOuvert] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [deps, setDeps] = useState<{ notes: number; photos: number; documents: number } | null>(null);
  const [enCours, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Un menu ouvert se ferme au clic ailleurs et à Échap — sinon il devient
  // un piège qu'on ne sait plus refermer.
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOuvert(false);
    };
    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", clic);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", clic);
      document.removeEventListener("keydown", touche);
    };
  }, [ouvert]);

  async function ouvrirConfirmation() {
    setOuvert(false);
    setDeps(null);
    setConfirme(true);
    // On charge l'inventaire pendant que la boîte s'ouvre : la confirmation
    // doit dire ce qui tombe, pas seulement demander l'accord.
    try {
      setDeps(await compterDependances(propertyId));
    } catch {
      setDeps({ notes: 0, photos: 0, documents: 0 });
    }
  }

  function dupliquer() {
    setOuvert(false);
    startTransition(async () => {
      try {
        const { id } = await duplicateProperty(propertyId, projectId);
        pousser({
          tone: "succes",
          message: "Bien dupliqué. La copie est à l'étape « À analyser ».",
          actionLabel: "Ouvrir la copie",
          onAction: () => router.push(`/app/p/${projectId}/bien/${id}`),
        });
        router.refresh();
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Duplication impossible.",
        });
      }
    });
  }

  function supprimer() {
    startTransition(async () => {
      try {
        await deleteProperty(propertyId, projectId);
        setConfirme(false);
        pousser({ tone: "succes", message: `${adresse} a été supprimé.` });
        router.push(`/app/p/${projectId}`);
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Suppression impossible.",
        });
      }
    });
  }

  const total = deps ? deps.notes + deps.photos + deps.documents : 0;
  const inventaire = deps
    ? [
        deps.notes && `${deps.notes} note${deps.notes > 1 ? "s" : ""}`,
        deps.photos && `${deps.photos} photo${deps.photos > 1 ? "s" : ""}`,
        deps.documents && `${deps.documents} document${deps.documents > 1 ? "s" : ""}`,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <>
      <div ref={menuRef} className="relative shrink-0">
        <IconButton
          aria-label="Autres actions sur ce bien"
          aria-expanded={ouvert}
          aria-haspopup="menu"
          size="sm"
          onClick={() => setOuvert((v) => !v)}
        >
          <IconMore size={16} />
        </IconButton>

        {ouvert && (
          <div
            role="menu"
            className={cx(
              "absolute right-0 top-full z-40 mt-1.5 w-52 overflow-hidden rounded-md",
              "border border-hairline-2 bg-surface-high shadow-[var(--lift-3)]",
            )}
          >
            <button
              role="menuitem"
              onClick={dupliquer}
              disabled={enCours}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-text-2 transition-colors hover:bg-raised hover:text-text disabled:opacity-40"
            >
              <IconCopy size={14} />
              Dupliquer ce bien
            </button>
            {/* Une action destructive se sépare visuellement des autres. */}
            <div className="h-px bg-hairline" />
            <button
              role="menuitem"
              onClick={ouvrirConfirmation}
              disabled={enCours}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-risk transition-colors hover:bg-[var(--risk-wash)] disabled:opacity-40"
            >
              <IconTrash size={14} />
              Supprimer ce bien
            </button>
          </div>
        )}
      </div>

      <Modal
        open={confirme}
        onClose={() => setConfirme(false)}
        title="Supprimer ce bien ?"
        description={`${adresse} sera définitivement supprimé. Cette action ne peut pas être annulée.`}
        footer={
          <>
            <Button variant="quiet" size="sm" onClick={() => setConfirme(false)}>
              Annuler
            </Button>
            <Button variant="danger" size="sm" disabled={enCours} onClick={supprimer}>
              {enCours ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </>
        }
      >
        {deps === null ? (
          <p className="text-[12.5px] text-text-4">Vérification de ce qui sera supprimé…</p>
        ) : total > 0 ? (
          <p className="rounded-sm border border-hairline-2 bg-sunken px-3 py-2.5 text-[12.5px] leading-relaxed text-text-2">
            Seront supprimés avec : <span className="text-text">{inventaire}</span>.
          </p>
        ) : (
          <p className="text-[12.5px] text-text-4">Ce bien ne porte ni note, ni photo, ni document.</p>
        )}
      </Modal>
    </>
  );
}
