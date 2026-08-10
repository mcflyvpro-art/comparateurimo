"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, IconButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  IconArchive,
  IconArrowRight,
  IconMore,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@/components/ui/Icon";
import {
  compterContenuProjet,
  deleteProject,
  renameProject,
  setProjectArchived,
} from "@/app/(app)/app/projects/project-actions";
import { STATUS_COLUMNS, type PropertyStatus } from "@/lib/pipeline-types";
import { cx } from "@/lib/cx";

export type ProjectRowData = {
  id: string;
  name: string;
  archived: boolean;
  summary: string;
  counts: Partial<Record<PropertyStatus, number>>;
  total: number;
};

/**
 * Ligne de projet.
 *
 * La ligne entière reste un lien — c'est le geste principal, il ne doit rien
 * coûter. Le menu d'actions vit EN DEHORS du lien : imbriquer un bouton dans
 * une ancre produit un HTML invalide et un piège au clavier.
 *
 * Renommer se fait en place, sans quitter la liste. Archiver est réversible
 * et le dit. Supprimer exige de retaper le nom : un bouton rouge se clique par
 * réflexe, un nom se tape en conscience.
 */
export function ProjectRow({ project }: { project: ProjectRowData }) {
  const router = useRouter();
  const { pousser } = useToast();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [renomme, setRenomme] = useState(false);
  const [brouillon, setBrouillon] = useState(project.name);
  const [confirmeSuppression, setConfirmeSuppression] = useState(false);
  const [saisieNom, setSaisieNom] = useState("");
  const [contenu, setContenu] = useState<{ biens: number; notes: number } | null>(null);
  const [enCours, startTransition] = useTransition();

  const menuRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renomme) champRef.current?.select();
  }, [renomme]);

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

  function ouvrirRenommage() {
    setBrouillon(project.name);
    setMenuOuvert(false);
    setRenomme(true);
  }

  function validerRenommage() {
    const propre = brouillon.trim();
    setRenomme(false);
    if (!propre || propre === project.name) return;

    startTransition(async () => {
      try {
        const { ancien } = await renameProject(project.id, propre);
        pousser({
          tone: "succes",
          message: `Projet renommé « ${propre} ».`,
          actionLabel: "Annuler",
          onAction: async () => {
            await renameProject(project.id, ancien);
            router.refresh();
          },
        });
        router.refresh();
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Renommage impossible.",
        });
      }
    });
  }

  function basculerArchive() {
    setMenuOuvert(false);
    const versArchive = !project.archived;
    startTransition(async () => {
      try {
        await setProjectArchived(project.id, versArchive);
        pousser({
          tone: "succes",
          message: versArchive
            ? `« ${project.name} » archivé. Rien n'est perdu.`
            : `« ${project.name} » réactivé.`,
          actionLabel: "Annuler",
          onAction: async () => {
            await setProjectArchived(project.id, !versArchive);
            router.refresh();
          },
        });
        router.refresh();
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Action impossible.",
        });
      }
    });
  }

  async function ouvrirSuppression() {
    setMenuOuvert(false);
    setSaisieNom("");
    setContenu(null);
    setConfirmeSuppression(true);
    try {
      setContenu(await compterContenuProjet(project.id));
    } catch {
      setContenu({ biens: 0, notes: 0 });
    }
  }

  function supprimer() {
    startTransition(async () => {
      try {
        await deleteProject(project.id, saisieNom);
        setConfirmeSuppression(false);
        pousser({ tone: "succes", message: `« ${project.name} » a été supprimé.` });
        router.refresh();
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Suppression impossible.",
        });
      }
    });
  }

  const nomCorrespond = saisieNom.trim() === project.name.trim();
  const muted = project.archived;

  return (
    <li className="relative">
      <div
        className={cx(
          "group relative flex items-center gap-4 overflow-hidden rounded-lg border border-line-soft bg-surface px-5 py-4",
          "transition-[border-color,background-color] duration-[140ms]",
          "hover:border-line-strong hover:bg-surface-hover",
          muted && "opacity-70",
          enCours && "opacity-50",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-accent transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
        />

        <div className="min-w-0 flex-1">
          {renomme ? (
            <input
              ref={champRef}
              value={brouillon}
              onChange={(e) => setBrouillon(e.target.value)}
              onBlur={validerRenommage}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); validerRenommage(); }
                if (e.key === "Escape") { e.preventDefault(); setRenomme(false); }
              }}
              aria-label="Nom du projet"
              className="w-full rounded-sm border border-accent bg-surface px-2 py-1 text-[15px] font-medium tracking-[-0.015em] text-text outline-none"
            />
          ) : (
            // Le lien ne couvre QUE le titre et les compteurs : le menu reste
            // atteignable à la souris comme au clavier.
            <Link
              href={`/app/p/${project.id}`}
              className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <h3
                className={cx(
                  "truncate text-[15px] font-medium tracking-[-0.015em]",
                  muted ? "text-text-2" : "text-text",
                )}
              >
                {project.name}
                {muted && <span className="ml-2 text-[11px] font-normal text-text-4">archivé</span>}
              </h3>
              <p className="num mt-1 truncate text-[11px] text-text-3">
                {project.summary || "Critères non renseignés"}
              </p>
              {project.total > 0 && (
                <p className="mt-2 truncate text-[12px] text-text-4">
                  {STATUS_COLUMNS.filter((col) => (project.counts[col.key] ?? 0) > 0)
                    .map((col) => `${project.counts[col.key]} ${col.label.toLowerCase()}`)
                    .join(" · ")}
                </p>
              )}
            </Link>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="num text-[20px] leading-none text-text">{project.total}</p>
          <p className="t-label mt-1.5 !text-[9px]">bien{project.total > 1 ? "s" : ""}</p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <IconButton
            aria-label={`Actions sur le projet ${project.name}`}
            aria-expanded={menuOuvert}
            aria-haspopup="menu"
            size="sm"
            onClick={() => setMenuOuvert((v) => !v)}
          >
            <IconMore size={16} />
          </IconButton>

          {menuOuvert && (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-1.5 w-56 overflow-hidden rounded-md border border-line bg-surface-active shadow-[var(--shadow-3)]"
            >
              <MenuItem icon={<IconPencil size={14} />} onClick={ouvrirRenommage}>
                Renommer
              </MenuItem>
              <MenuItem
                icon={project.archived ? <IconRefresh size={14} /> : <IconArchive size={14} />}
                onClick={basculerArchive}
              >
                {project.archived ? "Réactiver" : "Archiver"}
              </MenuItem>
              <div className="h-px bg-line-soft" />
              <MenuItem icon={<IconTrash size={14} />} onClick={ouvrirSuppression} danger>
                Supprimer
              </MenuItem>
            </div>
          )}
        </div>

        <IconArrowRight
          size={16}
          className="pointer-events-none shrink-0 -translate-x-1 text-text-4 opacity-0 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>

      <Modal
        open={confirmeSuppression}
        onClose={() => setConfirmeSuppression(false)}
        title={`Supprimer « ${project.name} » ?`}
        description="Ce projet et tout ce qu'il contient seront définitivement supprimés. Cette action ne peut pas être annulée."
        width="26rem"
        footer={
          <>
            <Button variant="quiet" size="sm" onClick={() => setConfirmeSuppression(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!nomCorrespond || enCours}
              onClick={supprimer}
            >
              {enCours ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {contenu === null ? (
            <p className="text-[12.5px] text-text-4">Vérification de ce qui sera supprimé…</p>
          ) : contenu.biens > 0 ? (
            <p className="rounded-sm border border-line bg-sunken px-3 py-2.5 text-[12.5px] leading-relaxed text-text-2">
              Seront supprimés avec :{" "}
              <span className="text-text">
                {contenu.biens} bien{contenu.biens > 1 ? "s" : ""}
                {contenu.notes > 0 && ` et ${contenu.notes} note${contenu.notes > 1 ? "s" : ""}`}
              </span>
              .
            </p>
          ) : (
            <p className="text-[12.5px] text-text-4">Ce projet ne contient aucun bien.</p>
          )}

          {/* Retaper le nom : le seul garde-fou qui résiste au clic réflexe. */}
          <div>
            <label htmlFor={`confirme-${project.id}`} className="mb-1.5 block text-[12.5px] text-text-3">
              Tapez <span className="text-text">{project.name}</span> pour confirmer
            </label>
            <Input
              id={`confirme-${project.id}`}
              value={saisieNom}
              onChange={(e) => setSaisieNom(e.target.value)}
              placeholder={project.name}
              autoComplete="off"
            />
          </div>

          <p className="text-[12px] leading-relaxed text-text-4">
            Si vous voulez seulement le sortir de votre liste, <strong className="font-normal text-text-3">archivez-le</strong> :
            rien n&apos;est perdu et il revient d&apos;un clic.
          </p>
        </div>
      </Modal>
    </li>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] transition-colors",
        danger
          ? "text-risk hover:bg-[var(--risk-soft)]"
          : "text-text-2 hover:bg-surface-hover hover:text-text",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
