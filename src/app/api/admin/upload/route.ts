import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  uploadProductImage,
  deleteProductImage,
  listProductImages,
  ensureBucket,
} from "@/lib/supabase/storage";

let bucketReady = false;

/**
 * POST — upload a product image
 * Expects multipart/form-data with:
 *   - file: the image file
 *   - productSlug: the product slug for folder organization
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    // Ensure bucket exists (once per process)
    if (!bucketReady) {
      await ensureBucket();
      bucketReady = true;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productSlug = formData.get("productSlug") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!productSlug) {
      return NextResponse.json({ error: "Missing productSlug" }, { status: 400 });
    }

    const result = await uploadProductImage(file, productSlug);

    return NextResponse.json({
      path: result.path,
      publicUrl: result.publicUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[admin/upload] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET — list images for a product
 * Query param: ?productSlug=xxx
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const productSlug = request.nextUrl.searchParams.get("productSlug");

  if (!productSlug) {
    return NextResponse.json({ error: "Missing productSlug" }, { status: 400 });
  }

  try {
    const images = await listProductImages(productSlug);
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}

/**
 * DELETE — remove an image from storage
 * Body: { path: "product-slug/filename.jpg" }
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { path } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    await deleteProductImage(path);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
