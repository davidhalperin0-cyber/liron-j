import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api-auth";

type RelationType = "related" | "matching" | "complete_the_look" | "frequently_bought_together";
const VALID_TYPES: RelationType[] = ["related", "matching", "complete_the_look", "frequently_bought_together"];

// GET — fetch relationships for a product
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const productId = request.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("product_relationships")
      .select("*")
      .eq("product_id", productId)
      .order("relationship_type")
      .order("sort_order");

    if (error) {
      return NextResponse.json({ relationships: [] }, { status: 500 });
    }

    return NextResponse.json({ relationships: data });
  } catch {
    return NextResponse.json({ relationships: [] });
  }
}

// POST — add a relationship
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { productId, relatedProductId, type } = body;

  if (!productId || !relatedProductId || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Must be: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }

  if (productId === relatedProductId) {
    return NextResponse.json({ error: "Cannot relate product to itself" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("product_relationships")
      .upsert(
        {
          product_id: productId,
          related_product_id: relatedProductId,
          relationship_type: type,
          sort_order: body.sortOrder ?? 0,
        },
        { onConflict: "product_id,related_product_id,relationship_type" }
      )
      .select()
      .single();

    if (error) {
      console.error("[relationships] insert error:", error.message);
      return NextResponse.json({ error: "Failed to save relationship" }, { status: 500 });
    }

    return NextResponse.json({ relationship: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — remove a relationship
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("product_relationships")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
