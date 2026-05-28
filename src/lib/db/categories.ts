import { createClient } from "@supabase/supabase-js";

// Use untyped client since categories table isn't in generated types yet
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  description: string;
  image_url: string;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all active categories (for storefront navigation/display)
 */
export async function getActiveCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "active")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
