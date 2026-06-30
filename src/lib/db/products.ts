import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Database, ProductOptions } from "@/lib/supabase/database.types";
import type { ProductCard, ProductMedia } from "@/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface ProductDetail {
  id: string;
  slug: string;
  name: { en: string; he: string };
  description: string;
  story: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  media: ProductMedia;
  material: string;
  color: string;
  gemstone: string;
  weight: string;
  category: string;
  isNew: boolean;
  isFeatured: boolean;
  isLimited: boolean;
  options: {
    colors: { id: string; name: string; value: string }[];
    sizes: string[];
  };
}

// A short, elegant fragment of the story for product cards — first clause,
// trimmed to a tasteful length so it never wraps to multiple lines.
function shortExcerpt(text: string | undefined, max = 52): string | undefined {
  if (!text) return undefined;
  const firstSentence = text.split(/(?<=[.!?…])\s/)[0].trim();
  if (firstSentence.length <= max) return firstSentence.replace(/[.…]+$/, "");
  const cut = firstSentence.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).replace(/[.,…]+$/, "") + "…";
}

function rowToProductCard(row: ProductRow): ProductCard {
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.name_en, he: row.name_he },
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    image: row.image_url || row.images[0] || "",
    hoverImage: row.images?.[1] || undefined,
    category: row.category,
    material: row.material,
    tagline: shortExcerpt(row.story || row.description),
    color: row.color,
    isNew: row.is_new,
    isLimited: row.is_limited,
    isFeatured: row.is_featured,
    media: row.media,
    variants: ((row.options as ProductOptions)?.colors ?? []).map((c) => ({
      id: c.id,
      color: c.value,
      name: c.name,
    })),
  };
}

function rowToProductDetail(row: ProductRow): ProductDetail {
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.name_en, he: row.name_he },
    description: row.description,
    story: row.story,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    image: row.image_url || row.images[0] || "",
    images: row.images,
    media: row.media,
    material: row.material,
    color: row.color,
    gemstone: row.gemstone,
    weight: row.weight,
    category: row.category,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    isLimited: row.is_limited,
    options: {
      colors: ((row.options as ProductOptions)?.colors ?? []),
      sizes: ((row.options as ProductOptions)?.sizes ?? []),
    },
  };
}

function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function queryProducts(
  filter?: (q: ReturnType<ReturnType<typeof createSupabaseAdminClient>["from"]>) => ReturnType<ReturnType<typeof createSupabaseAdminClient>["from"]>
): Promise<ProductRow[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = createSupabaseAdminClient();
  let query = supabase.from("products").select("*");

  if (filter) {
    query = filter(query) as typeof query;
  }

  const { data, error } = await query;
  if (error) {
    console.error("[db/products] query error:", error.message);
    return [];
  }
  return (data ?? []) as ProductRow[];
}

// ─── Public API ──────────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return rowToProductDetail(data as ProductRow);
}

export async function getFeaturedProducts(limit = 4): Promise<ProductCard[]> {
  const rows = await queryProducts((q) =>
    q.eq("status", "active").order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(limit)
  );

  return rows.map(rowToProductCard);
}

export async function getNewProducts(limit = 4): Promise<ProductCard[]> {
  const rows = await queryProducts((q) =>
    q.eq("status", "active").eq("is_new", true).order("created_at", { ascending: false }).limit(limit)
  );

  // Fallback: if nothing is flagged "מוצר חדש" yet, show the most recent items
  // so the "גלו את הקולקציה" page is never empty.
  if (rows.length === 0) {
    const recent = await queryProducts((q) =>
      q.eq("status", "active").order("created_at", { ascending: false }).limit(limit)
    );
    return recent.map(rowToProductCard);
  }

  return rows.map(rowToProductCard);
}

// Best Sellers — products flagged "מוצר מומלץ" (is_featured), capped (max 10).
// Fully controlled per-product from the admin. Falls back to recent items
// only when nothing has been flagged yet, so the page is never empty.
export async function getBestSellers(limit = 10): Promise<ProductCard[]> {
  const capped = Math.min(limit, 10);
  const rows = await queryProducts((q) =>
    q.eq("status", "active").eq("is_featured", true).order("created_at", { ascending: false }).limit(capped)
  );

  if (rows.length === 0) {
    const recent = await queryProducts((q) =>
      q.eq("status", "active").order("created_at", { ascending: false }).limit(capped)
    );
    return recent.map(rowToProductCard);
  }

  return rows.map(rowToProductCard);
}

export async function getProductsByCategory(category: string): Promise<ProductCard[]> {
  const rows = await queryProducts((q) =>
    q.eq("status", "active").eq("category", category).order("created_at", { ascending: false })
  );

  return rows.map(rowToProductCard);
}

export async function getAllActiveProducts(): Promise<ProductCard[]> {
  const rows = await queryProducts((q) =>
    q.eq("status", "active").order("created_at", { ascending: false })
  );

  return rows.map(rowToProductCard);
}

export async function getProductsByGender(gender: "women" | "men"): Promise<ProductCard[]> {
  const rows = await queryProducts((q) =>
    q
      .eq("status", "active")
      .in("gender", [gender, "unisex"])
      .order("created_at", { ascending: false })
  );

  return rows.map(rowToProductCard);
}

export async function getProductsByCategoryAndGender(
  category: string,
  gender: "women" | "men"
): Promise<ProductCard[]> {
  const rows = await queryProducts((q) =>
    q
      .eq("status", "active")
      .eq("category", category)
      .in("gender", [gender, "unisex"])
      .order("created_at", { ascending: false })
  );

  return rows.map(rowToProductCard);
}

export async function searchProducts(query: string): Promise<ProductCard[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  if (!hasSupabaseConfig()) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .or(`name_he.ilike.%${normalized}%,name_en.ilike.%${normalized}%,material.ilike.%${normalized}%,gemstone.ilike.%${normalized}%`);

  if (error || !data) return [];

  return (data as ProductRow[]).map(rowToProductCard);
}

export async function getProductsByIds(ids: string[]): Promise<ProductCard[]> {
  if (ids.length === 0) return [];

  const rows = await queryProducts((q) => q.in("id", ids));

  return rows.map(rowToProductCard);
}

export async function getRelatedProducts(productId: string): Promise<{
  related: ProductCard[];
  matching: ProductCard[];
  completeTheLook: ProductCard[];
  frequentlyBoughtTogether: ProductCard[];
}> {
  const empty = { related: [], matching: [], completeTheLook: [], frequentlyBoughtTogether: [] };

  if (!hasSupabaseConfig()) return empty;

  const supabase = createSupabaseAdminClient();
  const { data: rels, error: relsError } = await supabase
    .from("product_relationships")
    .select("related_product_id, relationship_type, sort_order")
    .eq("product_id", productId)
    .order("sort_order");

  if (relsError || !rels || rels.length === 0) return empty;

  const productIds = [...new Set(rels.map((r) => r.related_product_id))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("status", "active");

  if (productsError || !products || products.length === 0) return empty;

  const rows = products as ProductRow[];
  const result: { related: ProductCard[]; matching: ProductCard[]; completeTheLook: ProductCard[]; frequentlyBoughtTogether: ProductCard[] } = { related: [], matching: [], completeTheLook: [], frequentlyBoughtTogether: [] };

  for (const rel of rels) {
    const row = rows.find((r) => r.id === rel.related_product_id);
    if (!row) continue;
    const card = rowToProductCard(row);

    switch (rel.relationship_type) {
      case "related": result.related.push(card); break;
      case "matching": result.matching.push(card); break;
      case "complete_the_look": result.completeTheLook.push(card); break;
      case "frequently_bought_together": result.frequentlyBoughtTogether.push(card); break;
    }
  }

  return result;
}

