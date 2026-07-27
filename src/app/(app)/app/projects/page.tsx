import type { Metadata } from "next";
import Link from "next/link";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { formatCriteria } from "@/lib/format-criteria";
import { CreateProjectForm } from "@/components/app/CreateProjectForm";
import { STATUS_COLUMNS, type PropertyStatus } from "@/lib/pipeline-types";
import { Empty } from "@/components/ui/Feedback";
import { IconArchive, IconArrowRight, IconLayers } from "@/components/ui/Icon";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projets",
  description: "Vos projets d'achat et leurs pipelines.",
};

type ProjectCard = {
  id: string;
  name: string;
  archived: boolean;
  criteria: Json;
  counts: Partial<Record<PropertyStatus, number>>;
  total: number;
};

export default async function ProjectsPage() {
  const supabase = getDemoClient();

  const [projectsRes, propertiesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, archived, criteria")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at"),
    supabase.from("properties").select("project_id, status").eq("user_id", DEMO_USER_ID),
  ]);

  const countsByProject = new Map<string, Partial<Record<PropertyStatus, number>>>();
  for (const row of propertiesRes.data ?? []) {
    const bucket = countsByProject.get(row.project_id) ?? {};
    bucket[row.status] = (bucket[row.status] ?? 0) + 1;
    countsByProject.set(row.project_id, bucket);
  }

  const projects: ProjectCard[] = (projectsRes.data ?? []).map((p) => {
    const counts = countsByProject.get(p.id) ?? {};
    return {
      ...p,
      counts,
      total: Object.values(counts).reduce((a, b) => a + (b ?? 0), 0),
    };
  });

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <header className="focal-in">
          <span className="t-label">Espace de travail</span>
          <h1 className="t-title mt-3 text-text">Projets</h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-text-2">
            Un projet, c&apos;est un achat. Il porte son propre pipeline, ses candidats,
            vos notes et les raisons de ce que vous avez écarté.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-10">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="t-label">Actifs</h2>
                <span className="h-px flex-1 bg-hairline" aria-hidden />
                <span className="num text-[10px] text-text-4">{active.length}</span>
              </div>

              {active.length === 0 ? (
                <Empty
                  icon={<IconLayers size={20} />}
                  title="Aucun projet actif"
                  body="Créez-en un pour ouvrir votre premier pipeline."
                  className="rounded-lg border border-dashed border-hairline-2"
                />
              ) : (
                <ul className="focal-stagger grid gap-3">
                  {active.map((p) => (
                    <ProjectRow key={p.id} project={p} />
                  ))}
                </ul>
              )}
            </section>

            {archived.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <IconArchive size={13} className="text-text-4" />
                  <h2 className="t-label">Archivés</h2>
                  <span className="h-px flex-1 bg-hairline" aria-hidden />
                  <span className="num text-[10px] text-text-4">{archived.length}</span>
                </div>
                <ul className="grid gap-3">
                  {archived.map((p) => (
                    <ProjectRow key={p.id} project={p} muted />
                  ))}
                </ul>
              </section>
            )}
          </div>

          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ project, muted = false }: { project: ProjectCard; muted?: boolean }) {
  const summary = formatCriteria(project.criteria);

  return (
    <li>
      <Link
        href={`/app/p/${project.id}`}
        className="group relative flex items-center gap-6 overflow-hidden rounded-lg border border-hairline bg-surface px-5 py-4 transition-[border-color,background-color] duration-[140ms] hover:border-hairline-3 hover:bg-raised"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-brand transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
        />

        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-[15px] font-medium tracking-[-0.015em] ${muted ? "text-text-2" : "text-text"}`}
          >
            {project.name}
          </h3>
          <p className="num mt-1 truncate text-[11px] text-text-3">
            {summary || "Critères non renseignés"}
          </p>

          {project.total > 0 && (
            <p className="mt-2 truncate text-[12px] text-text-4">
              {STATUS_COLUMNS.filter((col) => (project.counts[col.key] ?? 0) > 0)
                .map((col) => `${project.counts[col.key]} ${col.label.toLowerCase()}`)
                .join(" · ")}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="num text-[20px] leading-none text-text">{project.total}</p>
          <p className="t-label mt-1.5 !text-[9px]">
            bien{project.total > 1 ? "s" : ""}
          </p>
        </div>

        <IconArrowRight
          size={16}
          className="shrink-0 -translate-x-1 text-text-4 opacity-0 transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100"
        />
      </Link>
    </li>
  );
}
