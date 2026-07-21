import { AppSidebar } from "@/components/app/AppSidebar";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, archived")
    .eq("user_id", DEMO_USER_ID)
    .order("created_at");

  return (
    <div className="flex min-h-screen bg-bg">
      <AppSidebar projects={projects ?? []} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
