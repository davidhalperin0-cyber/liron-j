import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/api-auth";

// Use untyped client since categories table isn't in generated types yet
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET — list all categories
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data ?? [] });
}

// PUT — update a category (including image_url)
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { id, name, name_en, description, image_url, sort_order, status } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing category id" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .update({
      ...(name !== undefined && { name }),
      ...(name_en !== undefined && { name_en }),
      ...(description !== undefined && { description }),
      ...(image_url !== undefined && { image_url }),
      ...(sort_order !== undefined && { sort_order }),
      ...(status !== undefined && { status }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}

// POST — create a new category
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { slug, name, name_en, description, image_url, sort_order } = body;

  if (!slug || !name || !name_en) {
    return NextResponse.json({ error: "Missing required fields: slug, name, name_en" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug,
      name,
      name_en,
      description: description ?? "",
      image_url: image_url ?? "",
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}

// DELETE — remove a category
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing category id" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
