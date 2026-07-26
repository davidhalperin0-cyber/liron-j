import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api-auth";

// Lightweight endpoint for the featured-products picker: list active products
// with their featured flag, and toggle a single product's flag.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,name_he,category,gender,price,material,image_url,images,is_featured")
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("name_he", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const { id, featured } = (await request.json()) as { id?: string; featured?: boolean };
  if (!id || typeof featured !== "boolean") {
    return NextResponse.json({ error: "Missing id or featured" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_featured: featured })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
