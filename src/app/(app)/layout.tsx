import { AppSidebar, type SidebarProject } from "@/components/app/AppSidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import type { PropertyStatus } from "@/lib/pipeline-types";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getDemoClient();

  // Le rail affiche le thermomètre de chaque projet : on rapatrie la
  // répartition des biens par statut en une requête, agrégée côté serveur.
  const [projectsRes, propertiesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, archived")
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

  const projects: SidebarProject[] = (projectsRes.data ?? []).map((p) => ({
    ...p,
    counts: countsByProject.get(p.id),
  }));

  return (
    // Coque plein écran : le rail est fixe, seul le contenu défile. C'est ce qui
    // distingue un outil d'une page web — on ne perd jamais sa navigation.
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <AppSidebar projects={projects} />
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </ToastProvider>
  );
}
