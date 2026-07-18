import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour le navigateur (composants "use client").
 * Utilise la clé publishable → respecte la RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
