import { createSupabaseAdminClient } from "./server";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Ensure the product-images bucket exists.
 * Safe to call multiple times — skips if already exists.
 */
export async function ensureBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();

  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
  }
}

/**
 * Upload a product image to Supabase Storage.
 * Returns the storage path and public URL.
 */
export async function uploadProductImage(
  file: File,
  productSlug: string
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const supabase = createSupabaseAdminClient();

  // Generate unique filename
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 8);
  const storagePath = `${productSlug}/${timestamp}-${randomId}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Delete a product image from Supabase Storage.
 */
export async function deleteProductImage(storagePath: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * List all images for a product.
 */
export async function listProductImages(productSlug: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(productSlug, { sortBy: { column: "created_at", order: "asc" } });

  if (error || !data) return [];

  return data
    .filter((f) => !f.name.startsWith("."))
    .map((f) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${productSlug}/${f.name}`);
      return urlData.publicUrl;
    });
}

/**
 * Get the Supabase Storage CDN base URL for transformations.
 * Usage: `${getCdnBase()}/render/image/public/${BUCKET_NAME}/path?width=400&height=400`
 */
export function getCdnBase(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

/**
 * Generate an optimized image URL using Supabase Image Transformation.
 * Returns a URL with width/height/quality parameters for CDN-level resizing.
 */
export function getOptimizedUrl(
  publicUrl: string,
  options: { width?: number; height?: number; quality?: number; format?: "webp" | "avif" } = {}
): string {
  const { width, height, quality = 80, format } = options;
  const params = new URLSearchParams();
  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));
  if (format) params.set("format", format);

  // Supabase image transformation URL pattern
  // /storage/v1/render/image/public/bucket/path?width=X&height=Y
  const url = publicUrl.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.toString()}`;
}
