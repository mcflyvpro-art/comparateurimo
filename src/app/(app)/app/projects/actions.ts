"use server";

import { redirect } from "next/navigation";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";

export async function createProject(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const budgetRaw = String(formData.get("budget_max") ?? "").replace(/\D/g, "");
  const budget_max = budgetRaw ? Number(budgetRaw) : undefined;
  const goal = String(formData.get("goal") ?? "").trim() || undefined;

  const supabase = getDemoClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: DEMO_USER_ID, name, criteria: { budget_max, goal } })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Création du projet impossible.");
  }

  redirect(`/app/p/${data.id}`);
}
