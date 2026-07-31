import Link from "next/link";
import { formatCriteria } from "@/lib/format-criteria";
import type { Json } from "@/lib/supabase/types";
import { Button } from "@/components/ui/Button";
import { ProjectCriteria } from "@/components/app/ProjectCriteria";
import { IconLayers, IconPlus, IconSearch } from "@/components/ui/Icon";

/**
 * Barre de projet — l'en-tête de l'instrument.
 *
 * Un seul bouton incandescent par écran : « Ajouter un bien ». Tout le reste est
 * filaire. Les fonctions pas encore câblées ne sont pas des boutons gris tristes :
 * elles portent une étiquette « bientôt » assumée, en petites capitales, comme un
 * cadran non encore branché sur un tableau de bord.
 */
export function AppTopbar({
  project,
  projectId,
}: {
  project: { name: string; criteria: Json };
  projectId: string;
}) {
  const summary = formatCriteria(project.criteria);

  // `criteria` est un `jsonb` libre : on n'en extrait que ce qu'on sait éditer,
  // le reste est conservé tel quel côté serveur.
  const criteres =
    project.criteria && typeof project.criteria === "object" && !Array.isArray(project.criteria)
      ? (project.criteria as Record<string, unknown>)
      : {};
  const budgetMax = typeof criteres.budget_max === "number" ? criteres.budget_max : null;
  const goal = typeof criteres.goal === "string" ? criteres.goal : null;

  return (
    <header className="flex h-[var(--topbar)] shrink-0 items-center justify-between gap-6 border-b border-hairline px-5">
      <div className="flex min-w-0 items-baseline gap-3">
        {/* Le rail latéral disparaît sous `lg` : la sortie vers les projets doit
            rester atteignable, sinon l'outil devient une impasse. */}
        <Link
          href="/app/projects"
          aria-label="Tous les projets"
          className="shrink-0 text-text-3 transition-colors hover:text-text lg:hidden"
        >
          <IconLayers size={16} />
        </Link>
        <h1 className="truncate text-[15px] font-medium tracking-[-0.015em] text-text">
          {project.name}
        </h1>
        <span className="h-3 w-px shrink-0 bg-hairline-2" aria-hidden />
        <ProjectCriteria
          projectId={projectId}
          summary={summary}
          budgetMax={budgetMax}
          goal={goal}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative hidden md:block">
          <IconSearch
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4"
          />
          <input
            type="search"
            placeholder="Rechercher un bien…"
            disabled
            title="Recherche — arrive avec la vue Tableau"
            className="h-8 w-52 rounded-sm border border-hairline-2 bg-sunken pl-8 pr-3 text-[13px] text-text placeholder:text-text-4 outline-none transition-colors hover:border-hairline-3 focus:border-brand disabled:cursor-not-allowed disabled:opacity-45"
          />
        </div>

        <Soon label="Comparer" hint="Arbitrage entre finalistes">
          <IconLayers size={14} />
        </Soon>

        <Button variant="solid" size="sm" disabled icon={<IconPlus size={14} />} title="Flux de capture — à venir">
          Ajouter un bien
        </Button>
      </div>
    </header>
  );
}

/** Commande annoncée mais pas encore branchée. Honnête plutôt que grisée. */
function Soon({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={`${hint} — à venir`}
      className="hidden h-8 cursor-not-allowed items-center gap-2 rounded-sm border border-dashed border-hairline-2 px-3 text-[13px] text-text-3 sm:flex"
    >
      {children}
      {label}
      <span className="text-[11px] text-text-4">bientôt</span>
    </span>
  );
}
