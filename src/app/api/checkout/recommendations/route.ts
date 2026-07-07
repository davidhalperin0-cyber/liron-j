import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface Rec {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

// Two "complete the look" recommendations for the checkout, related to the
// products already in the cart. Strategy:
//   1) curated product_relationships (complete_the_look / related) if any
//   2) fallback to same-category products (featured first)
//   3) fallback to any featured/recent products
// Always excludes items already in the cart.
export async function POST(request: NextRequest) {
  let body: { productIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ products: [] });
  }
  const cartIds = Array.isArray(body.productIds) ? body.productIds.filter(Boolean) : [];

  try {
    const supabase = createSupabaseAdminClient();
    const SELECT = "id, slug, name_he, price, image_url, images";
    const toRec = (p: {
      id: string; slug: string; name_he: string; price: number;
      image_url: string | null; images: string[] | null;
    }): Rec => ({
      id: p.id,
      slug: p.slug,
      name: p.name_he,
      price: p.price,
      image: p.image_url || p.images?.[0] || "",
    });

    const picked = new Map<string, Rec>();
    const exclude = new Set(cartIds);
    const add = (rows: Parameters<typeof toRec>[0][] | null) => {
      for (const p of rows ?? []) {
        if (picked.size >= 2) break;
        if (exclude.has(p.id) || picked.has(p.id)) continue;
        picked.set(p.id, toRec(p));
      }
    };

    // 1) Curated relationships from the first cart item
    if (cartIds.length > 0) {
      const { data: rels } = await supabase
        .from("product_relationships")
        .select("related_product_id, relationship_type, sort_order")
        .eq("product_id", cartIds[0])
        .order("sort_order");
      const relIds = (rels ?? [])
        .filter((r) => r.relationship_type === "complete_the_look" || r.relationship_type === "related")
        .map((r) => r.related_product_id)
        .filter((id) => !exclude.has(id));
      if (relIds.length > 0) {
        const { data } = await supabase.from("products").select(SELECT).in("id", relIds).eq("status", "active");
        add(data);
      }
    }

    // 2) Same-category products
    if (picked.size < 2 && cartIds.length > 0) {
      const { data: cartProducts } = await supabase.from("products").select("category").in("id", cartIds);
      const cats = [...new Set((cartProducts ?? []).map((p) => p.category).filter(Boolean))];
      if (cats.length > 0) {
        const { data } = await supabase
          .from("products")
          .select(SELECT)
          .in("category", cats)
          .eq("status", "active")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);
        add(data);
      }
    }

    // 3) Featured / recent fallback
    if (picked.size < 2) {
      const { data } = await supabase
        .from("products")
        .select(SELECT)
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);
      add(data);
    }

    return NextResponse.json({ products: [...picked.values()] });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
