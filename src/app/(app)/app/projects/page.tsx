import type { Metadata } from "next";
import Link from "next/link";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { formatCriteria } from "@/lib/format-criteria";
import { CreateProjectForm } from "@/components/app/CreateProjectForm";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projets — Estio",
  description: "Vos projets d'achat et leurs pipelines.",
};

type ProjectRow = { id: string; name: string; archived: boolean; criteria: Json };

export default async function ProjectsPage() {
  const supabase = getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, archived, criteria")
    .eq("user_id", DEMO_USER_ID)
    .order("created_at");

  const active = (projects ?? []).filter((p) => !p.archived);
  const archived = (projects ?? []).filter((p) => p.archived);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Projets
      </h1>
      <p className="mt-2 text-sm text-muted">
        Un projet = un achat. Chacun porte son propre pipeline de biens.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <ProjectList
            title="Actifs"
            projects={active}
            emptyLabel="Aucun projet actif pour l'instant."
          />
          {archived.length > 0 && (
            <ProjectList title="Archivés" projects={archived} emptyLabel="" />
          )}
        </div>
        <CreateProjectForm />
      </div>
    </main>
  );
}

function ProjectList({
  title,
  projects,
  emptyLabel,
}: {
  title: string;
  projects: ProjectRow[];
  emptyLabel: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wide text-faint">{title}</h2>
      {projects.length === 0 ? (
        <p className="text-sm text-faint">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/p/${p.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-bg-alt px-5 py-4 transition-colors hover:border-brand"
              >
                <div>
                  <span className="font-sans text-lg font-medium text-text">
                    {p.name}
                  </span>
                  <p className="mt-1 text-sm text-muted">
                    {formatCriteria(p.criteria) || "Critères non renseignés"}
                  </p>
                </div>
                {p.archived && (
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                    archivé
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
