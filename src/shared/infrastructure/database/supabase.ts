import "dotenv/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../config/env.js";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Lazy anon client. Throws on first use if SUPABASE_URL / SUPABASE_ANON_KEY
 * are missing — no hard-coded project URL or placeholder key.
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) _supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
  return _supabase;
}

/**
 * Lazy service-role client (server-side only). Returns null when the
 * service-role key is not configured.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const key = env.supabaseServiceRoleKey;
  if (!key) return null;
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(env.supabaseUrl, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseAdmin;
}

export default getSupabase;
