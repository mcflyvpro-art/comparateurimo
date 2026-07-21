import { redirect } from "next/navigation";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export const dynamic = "force-dynamic";

export default async function AppRoot() {
  const supabase = getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", DEMO_USER_ID)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(1);

  const last = projects?.[0];
  redirect(last ? `/app/p/${last.id}` : "/app/projects");
}
