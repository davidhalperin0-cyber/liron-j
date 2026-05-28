import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase browser environment variables");
  }

  return createClient<Database>(url, anonKey);
}
