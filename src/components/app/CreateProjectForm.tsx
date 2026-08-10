"use client";

import { useState } from "react";
import { createProject } from "@/app/(app)/app/projects/actions";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

const GOAL_PRESETS = [
  { value: "Cash-flow ≥ 0 €", label: "Cash-flow ≥ 0", hint: "L'immeuble se paie seul" },
  { value: "Rendement ≥ 6 %", label: "Rendement ≥ 6 %", hint: "Le revenu d'abord" },
  { value: "Patrimoine long terme", label: "Patrimoine", hint: "La valeur dans quinze ans" },
];

/**
 * Création de projet — la porte d'entrée.
 *
 * Trois champs, pas quatorze : un nom, un budget, une intention. Le reste se
 * découvre en chemin. L'objectif n'est pas un menu déroulant mais trois cartes
 * qui expliquent ce qu'elles veulent dire — c'est la seule décision structurante
 * du formulaire, elle mérite d'être lisible.
 */
export function CreateProjectForm() {
  const [goal, setGoal] = useState(GOAL_PRESETS[0].value);

  return (
    <Panel className="h-fit lg:sticky lg:top-8">
      <PanelHeader title="Nouveau projet" />

      <form action={createProject} className="flex flex-col gap-4">
        <Input
          id="name"
          name="name"
          required
          label="Nom du projet"
          placeholder="T2/T3 Lyon locatif"
        />

        <Input
          id="budget_max"
          name="budget_max"
          inputMode="numeric"
          label="Budget maximum"
          placeholder="250 000"
          className="num"
        />

        <div>
          <span className="t-label mb-2 block">Objectif</span>
          <input type="hidden" name="goal" value={goal} />
          <div className="flex flex-col gap-1.5">
            {GOAL_PRESETS.map((g) => {
              const active = goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  aria-pressed={active}
                  className={cx(
                    "group flex items-baseline justify-between gap-3 rounded-sm border px-3 py-2 text-left",
                    "transition-[border-color,background-color] duration-[140ms]",
                    active
                      ? "border-accent-line bg-[var(--accent-soft)]"
                      : "border-line hover:border-line-strong",
                  )}
                >
                  <span
                    className={cx(
                      "text-[13px] font-medium",
                      active ? "text-accent-hot" : "text-text-2",
                    )}
                  >
                    {g.label}
                  </span>
                  <span className="text-[11px] text-text-4">{g.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          variant="solid"
          size="md"
          className="mt-1 w-full"
          trailing={<IconArrowRight size={14} />}
        >
          Créer le projet
        </Button>

        <p className="text-[11px] leading-relaxed text-text-4">
          Vous pourrez tout modifier ensuite. Un projet se borne dans le temps : on
          cherche, on tranche, on archive.
        </p>
      </form>
    </Panel>
  );
}
