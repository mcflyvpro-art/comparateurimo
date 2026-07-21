import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Utilisateur démo (Phase 2). Tant que l'auth réelle n'existe pas (Phase 5),
 * toutes les données de l'app appartiennent à cet utilisateur seedé.
 */
export const DEMO_USER_ID = "00000000-0000-0000-0000-0000000000e5";

/**
 * Client Supabase serveur en service role (clé secrète — JAMAIS exposée au client).
 * Il contourne la RLS ; on filtre donc explicitement par `user_id = DEMO_USER_ID`
 * dans les requêtes de l'app. La RLS reste active en base pour la Phase 5
 * (vraie auth par utilisateur). À n'importer que depuis du code serveur.
 */
export function getDemoClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
