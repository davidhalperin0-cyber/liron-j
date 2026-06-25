import type { ProductMedia } from "@/types";
import type { Database } from "@/lib/supabase/database.types";

export interface AdminProduct {
  id: string;
  slug?: string;
  name: string;
  nameEn: string;
  sku: string;
  description?: string;
  story?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: "active" | "draft" | "archived";
  category: string;
  gender?: "women" | "men" | "unisex";
  material?: string;
  color?: string;
  gemstone?: string;
  weight?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isLimited?: boolean;
  image: string;
  images?: string[];
  media: ProductMedia;
  options?: { colors: { id: string; name: string; value: string }[]; sizes: string[] };
}

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export function productRowToAdminProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name_he,
    nameEn: row.name_en,
    sku: row.sku,
    description: row.description,
    story: row.story,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    stock: row.stock,
    status: row.status,
    category: row.category,
    gender: row.gender,
    material: row.material,
    color: row.color,
    gemstone: row.gemstone,
    weight: row.weight,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    isLimited: row.is_limited,
    image: row.image_url ?? "",
    images: row.images,
    media: row.media,
    options: row.options,
  };
}

export function adminProductToProductPayload(product: AdminProduct) {
  return {
    slug: product.slug ?? product.nameEn.toLowerCase().replace(/\s+/g, "-"),
    name_he: product.name,
    name_en: product.nameEn,
    sku: product.sku,
    description: product.description ?? "",
    story: product.story ?? "",
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    stock: product.stock,
    status: product.status,
    category: product.category,
    gender: product.gender ?? "women",
    material: product.material ?? "",
    color: product.color ?? "",
    gemstone: product.gemstone ?? "",
    weight: product.weight ?? "",
    is_new: product.isNew ?? false,
    is_featured: product.isFeatured ?? false,
    is_limited: product.isLimited ?? false,
    image_url: product.image || product.media.images[0] || null,
    images: product.images ?? product.media.images ?? [],
    media: product.media,
    options: product.options ?? { colors: [], sizes: [] },
  };
}
