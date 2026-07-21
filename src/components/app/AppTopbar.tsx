import { formatCriteria } from "@/lib/format-criteria";
import type { Json } from "@/lib/supabase/types";

/** Barre du haut d'un projet : nom + critères, recherche, Comparer, + Ajouter un bien.
 *  Recherche/Comparer/Ajouter sont désactivés dans ce plan (arrivent aux Plans 4/7/8). */
export function AppTopbar({
  project,
}: {
  project: { name: string; criteria: Json };
}) {
  const summary = formatCriteria(project.criteria);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div>
        <h1 className="font-sans text-lg font-medium text-text">{project.name}</h1>
        {summary && <p className="text-sm text-muted">{summary}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher un bien…"
          disabled
          title="Recherche — arrive avec la vue Tableau (Plan 4)"
          className="w-48 rounded-full border border-border bg-bg-alt px-4 py-2 text-sm text-text placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          disabled
          title="Arrive au Plan 7 (Comparer / Arbitrage)"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Comparer
        </button>
        <button
          type="button"
          disabled
          title="Arrive au Plan 8 (Flux Ajouter un bien)"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Ajouter un bien
        </button>
      </div>
    </header>
  );
}
