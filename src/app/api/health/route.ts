import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Test de connexion Supabase. Vérifie que les variables d'env sont présentes
 * et que le client s'initialise (getUser renvoie null si non connecté = OK).
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Variables NEXT_PUBLIC_SUPABASE_* manquantes" },
      { status: 500 },
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getUser();
    // "Auth session missing" est normal quand personne n'est connecté.
    const authReachable = !error || error.message.includes("session");
    return NextResponse.json({
      ok: true,
      supabaseUrl: url,
      auth: authReachable ? "reachable" : "error",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
