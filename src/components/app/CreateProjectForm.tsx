"use client";

import { useState } from "react";
import { createProject } from "@/app/(app)/app/projects/actions";

const GOAL_PRESETS = ["Cash-flow ≥ 0 €", "Rendement ≥ 6 %", "Patrimoine long terme"];

export function CreateProjectForm() {
  const [goal, setGoal] = useState(GOAL_PRESETS[0]);

  return (
    <form
      action={createProject}
      className="h-fit rounded-2xl border border-border bg-bg-alt p-5"
    >
      <h2 className="font-sans text-lg font-medium text-text">Nouveau projet</h2>
      <p className="mt-1 text-sm text-muted">
        Un projet = un achat. Il contient ton pipeline.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs text-muted">
            Nom du projet
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="T2/T3 Lyon locatif"
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
          />
        </div>

        <div>
          <label htmlFor="budget_max" className="mb-1.5 block text-xs text-muted">
            Budget max
          </label>
          <input
            id="budget_max"
            name="budget_max"
            inputMode="numeric"
            placeholder="250 000 €"
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-faint focus:border-brand"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-muted">Objectif</span>
          <input type="hidden" name="goal" value={goal} />
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  goal === g
                    ? "bg-brand text-bg"
                    : "border border-border text-muted hover:border-brand hover:text-text"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-full bg-brand py-2.5 text-sm font-medium text-bg transition-colors hover:bg-brand-hover"
      >
        Créer le projet
      </button>
    </form>
  );
}
