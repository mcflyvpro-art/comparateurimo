import { ViewTabs, type ViewKey } from "@/components/app/ViewTabs";
import { ViewPlaceholder } from "@/components/app/ViewPlaceholder";

export const dynamic = "force-dynamic";

const PLACEHOLDERS: Record<ViewKey, { title: string; plan: string }> = {
  pipeline: {
    title: "Vue Pipeline",
    plan: "Board Kanban à statuts (drag & drop) — arrive au Plan 3.",
  },
  tableau: {
    title: "Vue Tableau",
    plan: "Table dense et triable, colonnes chiffrées — arrive au Plan 4.",
  },
  carte: {
    title: "Vue Carte",
    plan: "Carte MapLibre, épingles par score — arrive au Plan 6.",
  },
};

export default async function ProjectBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;
  const active: ViewKey = view === "tableau" || view === "carte" ? view : "pipeline";
  const placeholder = PLACEHOLDERS[active];

  return (
    <div className="flex flex-1 flex-col">
      <ViewTabs projectId={projectId} active={active} />
      <ViewPlaceholder title={placeholder.title} plan={placeholder.plan} />
    </div>
  );
}
