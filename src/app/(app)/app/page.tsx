import type { Metadata } from "next";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export const metadata: Metadata = {
  title: "Tableau de bord — Estio",
  description:
    "Votre espace Estio : vos projets de recherche et leurs biens.",
};

export default async function AppDashboard() {
  const supabase = getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, archived, criteria")
    .eq("user_id", DEMO_USER_ID)
    .order("created_at");

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Tableau de bord
      </h1>
      <p className="mt-2 text-sm text-muted">
        Lecture réelle depuis Supabase (utilisateur démo). Le pipeline arrive au
        Plan 2.
      </p>

      <ul className="mt-10 space-y-3">
        {(projects ?? []).map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-border bg-bg-alt px-5 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-sans text-lg font-medium text-text">
                {p.name}
              </span>
              {p.archived && (
                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                  archivé
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
