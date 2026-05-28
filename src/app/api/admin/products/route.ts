import { NextRequest, NextResponse } from "next/server";
import { adminProductToProductPayload } from "@/lib/admin-products";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api-auth";
import type { AdminProduct } from "@/lib/admin-products";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const product = (await request.json()) as AdminProduct;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(adminProductToProductPayload(product))
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const product = (await request.json()) as AdminProduct;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(adminProductToProductPayload(product))
    .eq("id", product.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const { id } = (await request.json()) as { id: string };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
