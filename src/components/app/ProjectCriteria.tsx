"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { updateProjectCriteria } from "@/app/(app)/app/projects/project-actions";

/**
 * Les critères du projet — budget et objectif.
 *
 * Ils s'affichaient dans la barre sans qu'aucun écran ne permette de les
 * changer : un budget saisi une fois à la création restait pour toujours, alors
 * que c'est précisément le chiffre qui bouge quand on avance dans sa recherche.
 *
 * Le résumé devient donc un bouton. Pas d'icône à deviner : le texte qu'on lit
 * est le texte qu'on clique.
 */
export function ProjectCriteria({
  projectId,
  summary,
  budgetMax,
  goal,
}: {
  projectId: string;
  summary: string;
  budgetMax: number | null;
  goal: string | null;
}) {
  const router = useRouter();
  const { pousser } = useToast();
  const [ouvert, setOuvert] = useState(false);
  const [budget, setBudget] = useState(budgetMax ? String(budgetMax) : "");
  const [objectif, setObjectif] = useState(goal ?? "");
  const [enCours, startTransition] = useTransition();

  function ouvrir() {
    setBudget(budgetMax ? String(budgetMax) : "");
    setObjectif(goal ?? "");
    setOuvert(true);
  }

  function enregistrer() {
    const chiffres = budget.replace(/\D/g, "");
    startTransition(async () => {
      try {
        await updateProjectCriteria(projectId, {
          budget_max: chiffres ? Number(chiffres) : null,
          goal: objectif.trim() || null,
        });
        setOuvert(false);
        pousser({ tone: "succes", message: "Critères du projet enregistrés." });
        router.refresh();
      } catch (e) {
        pousser({
          tone: "erreur",
          message: e instanceof Error ? e.message : "Enregistrement impossible.",
        });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={ouvrir}
        title="Modifier les critères du projet"
        className="num truncate rounded-sm px-1.5 py-0.5 text-[11px] text-text-3 transition-colors hover:bg-raised hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
      >
        {summary || "Définir les critères"}
      </button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Critères du projet"
        description="Ils servent de repère quand vous comparez vos biens. Vous pouvez les changer à tout moment."
        footer={
          <>
            <Button variant="quiet" size="sm" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <Button variant="solid" size="sm" disabled={enCours} onClick={enregistrer}>
              {enCours ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="budget-max" className="mb-1.5 block text-[12.5px] text-text-3">
              Budget maximum
            </label>
            <Input
              id="budget-max"
              value={budget}
              inputMode="numeric"
              placeholder="250 000"
              onChange={(e) => setBudget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enregistrer()}
            />
            <p className="mt-1.5 text-[11.5px] text-text-4">
              Prix d&apos;achat affiché, hors frais de notaire.
            </p>
          </div>

          <div>
            <label htmlFor="objectif" className="mb-1.5 block text-[12.5px] text-text-3">
              Ce que vous cherchez
            </label>
            <Input
              id="objectif"
              value={objectif}
              placeholder="T2/T3 · Lyon · cash-flow ≥ 0"
              onChange={(e) => setObjectif(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enregistrer()}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
