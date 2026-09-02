import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_ANON_KEY missing. " +
      "Set them in backend/.env — see .env.example. " +
      "Project: https://nmhopxhlwpbcjzhzrvxj.supabase.co"
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://nmhopxhlwpbcjzhzrvxj.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key"
);

export const supabaseAdmin =
  supabaseServiceKey && supabaseUrl
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export default supabase;
