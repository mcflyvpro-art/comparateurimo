import type { Metadata } from "next";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { formatCriteria } from "@/lib/format-criteria";
import { CreateProjectForm } from "@/components/app/CreateProjectForm";
import { ProjectRow } from "@/components/app/ProjectRow";
import type { PropertyStatus } from "@/lib/pipeline-types";
import { Empty } from "@/components/ui/Feedback";
import { IconArchive, IconLayers } from "@/components/ui/Icon";
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
  summary: string;
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
      // Les critères sont mis en forme côté serveur : le composant de ligne
      // reste client sans avoir à embarquer le formateur.
      summary: formatCriteria(p.criteria),
    };
  });

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <header>
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
                <ul className="grid gap-3">
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
                    <ProjectRow key={p.id} project={p} />
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

