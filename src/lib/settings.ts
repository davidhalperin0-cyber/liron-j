import { createClient } from "@supabase/supabase-js";

// Store settings live in a single-row table (store_settings, id=1) as JSON.
// Anything not yet saved falls back to these defaults, so the site works even
// before the row is populated.

import { DEFAULT_SETTINGS, type StoreSettings } from "./settings-defaults";

export { DEFAULT_SETTINGS, type StoreSettings };

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Deep-merge stored values over the defaults so a partial row is still valid.
function merge(stored: Partial<StoreSettings> | null | undefined): StoreSettings {
  const s = stored ?? {};
  return {
    store: { ...DEFAULT_SETTINGS.store, ...(s.store ?? {}) },
    shipping: { ...DEFAULT_SETTINGS.shipping, ...(s.shipping ?? {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(s.social ?? {}) },
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("store_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;
    return merge((data as { data?: Partial<StoreSettings> }).data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveStoreSettings(next: StoreSettings): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("store_settings")
      .upsert({ id: 1, data: next, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}
