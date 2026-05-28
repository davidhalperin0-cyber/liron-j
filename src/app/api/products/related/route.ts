import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  const type = request.nextUrl.searchParams.get("type");

  if (!productId) {
    return NextResponse.json({ products: [] }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Get relationship entries
    let query = supabase
      .from("product_relationships")
      .select("related_product_id, relationship_type, sort_order")
      .eq("product_id", productId)
      .order("sort_order");

    if (type) {
      query = query.eq("relationship_type", type as "related" | "matching" | "complete_the_look" | "frequently_bought_together");
    }

    const { data: rels, error: relsError } = await query;

    if (relsError || !rels || rels.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Get the actual products
    const productIds = rels.map((r) => r.related_product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, slug, name_he, name_en, price, compare_at_price, image_url, images, media, material, color, is_new, is_limited, is_featured, options")
      .in("id", productIds)
      .eq("status", "active");

    if (productsError || !products) {
      return NextResponse.json({ products: [] });
    }

    // Group by relationship type and preserve sort order
    const grouped: Record<string, typeof products> = {};
    for (const rel of rels) {
      const product = products.find((p) => p.id === rel.related_product_id);
      if (!product) continue;
      const key = rel.relationship_type;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(product);
    }

    return NextResponse.json({ grouped, products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
