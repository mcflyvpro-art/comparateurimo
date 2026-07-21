import { ViewTabs, type ViewKey } from "@/components/app/ViewTabs";
import { ViewPlaceholder } from "@/components/app/ViewPlaceholder";
import { PipelineBoard } from "@/components/app/PipelineBoard";
import { PropertyTable } from "@/components/app/PropertyTable";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { daysSince } from "@/lib/format";
import type { NoteKind, PipelineNote, PipelineProperty, PropertyStatus } from "@/lib/pipeline-types";

export const dynamic = "force-dynamic";

const CARTE_PLACEHOLDER = {
  title: "Vue Carte",
  plan: "Carte MapLibre, épingles par score — arrive au Plan 6.",
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

  if (active === "carte") {
    return (
      <div className="flex flex-1 flex-col">
        <ViewTabs projectId={projectId} active={active} />
        <ViewPlaceholder title={CARTE_PLACEHOLDER.title} plan={CARTE_PLACEHOLDER.plan} />
      </div>
    );
  }

  const supabase = getDemoClient();
  const { data: rawProperties } = await supabase
    .from("properties")
    .select(
      "id, status, board_position, address, city, postal_code, property_type, surface_carrez, asking_price, works_estimate, estimated_rent, max_price, discard_reason, created_at",
    )
    .eq("project_id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .order("board_position");

  const properties = rawProperties ?? [];
  const propertyIds = properties.map((p) => p.id);

  let rawNotes: { id: string; property_id: string; kind: NoteKind; body: string; created_at: string }[] = [];
  let rawHistory: { property_id: string; to_status: PropertyStatus; created_at: string }[] = [];

  if (propertyIds.length > 0) {
    const [notesRes, historyRes] = await Promise.all([
      supabase
        .from("property_notes")
        .select("id, property_id, kind, body, created_at")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("status_history")
        .select("property_id, to_status, created_at")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false }),
    ]);
    rawNotes = notesRes.data ?? [];
    rawHistory = historyRes.data ?? [];
  }

  const notesByProperty = new Map<string, PipelineNote[]>();
  for (const note of rawNotes) {
    const list = notesByProperty.get(note.property_id) ?? [];
    list.push({ id: note.id, kind: note.kind, body: note.body, created_at: note.created_at });
    notesByProperty.set(note.property_id, list);
  }

  const statusByProperty = new Map(properties.map((p) => [p.id, p.status]));
  const lastStatusChangeByProperty = new Map<string, string>();
  for (const entry of rawHistory) {
    if (entry.to_status !== statusByProperty.get(entry.property_id)) continue;
    if (!lastStatusChangeByProperty.has(entry.property_id)) {
      lastStatusChangeByProperty.set(entry.property_id, entry.created_at);
    }
  }

  const pipelineProperties: PipelineProperty[] = properties.map((p) => {
    const referenceDate = lastStatusChangeByProperty.get(p.id) ?? p.created_at;
    return {
      id: p.id,
      status: p.status,
      board_position: p.board_position,
      address: p.address,
      city: p.city,
      postal_code: p.postal_code,
      property_type: p.property_type,
      surface_carrez: p.surface_carrez,
      asking_price: p.asking_price,
      works_estimate: p.works_estimate,
      estimated_rent: p.estimated_rent,
      max_price: p.max_price,
      discard_reason: p.discard_reason,
      daysInStatus: daysSince(referenceDate),
      notes: notesByProperty.get(p.id) ?? [],
    };
  });

  return (
    <div className="flex flex-1 flex-col">
      <ViewTabs projectId={projectId} active={active} />
      {active === "pipeline" ? (
        <PipelineBoard projectId={projectId} initialProperties={pipelineProperties} />
      ) : (
        <PropertyTable projectId={projectId} initialProperties={pipelineProperties} />
      )}
    </div>
  );
}
