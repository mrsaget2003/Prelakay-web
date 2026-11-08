import { createClient } from "@supabase/supabase-js";

// Client navigateur — clé publique (anon) uniquement, jamais la service role key.
// Variables définies dans .env.local (voir .env.example). 04-trd.md.
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant(e) — voir .env.example"
    );
  }

  return createClient(url, anonKey);
}
