import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/app/AppTopbar";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export const dynamic = "force-dynamic";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = getDemoClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, criteria")
    .eq("id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (!project) notFound();

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AppTopbar project={project} />
      {children}
    </div>
  );
}
