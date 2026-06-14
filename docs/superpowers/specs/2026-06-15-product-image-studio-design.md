# Product Image Studio — Design Spec

**Date:** 2026-06-15
**Status:** Approved (design)
**Owner:** AURÉA admin

## Goal

Let the merchant turn raw phone photos into a clean, consistent luxury catalog
**without any per-image cost and without external paid APIs**. Two capabilities:

1. **Single-image studio** — remove background, place product on a soft ivory
   studio background with a gentle contact shadow, output a polished image.
2. **360° spin** — assemble multiple frames (shot around the piece) into the
   site's existing interactive 360 viewer, with backgrounds removed.

All processing runs **client-side in the admin browser**. Zero server cost.
Only the final result is uploaded to the existing Supabase storage.

## Non-Goals (YAGNI)

- No AI generation / relighting (that was the paid Gemini path — dropped).
- No true 360 from a single image (physically impossible; requires real frames).
- No automatic processing on every upload — merchant triggers it and reviews.
- No batch processing of unrelated products at once.

## Engine

**`@imgly/background-removal`** — runs an ONNX model entirely in the browser via
WASM. Free to use, no API key, no per-image cost.

- First use downloads the model once (~tens of MB), then cached by the browser.
- Acceptable trade-off: this is an occasional admin tool, not a customer path.
- **Open item (resolve in implementation):** confirm the library + model license
  permits commercial use. If not, fall back to an equivalent permissive
  in-browser remover (e.g. an MIT-licensed ONNX U²-Net pipeline).

Compositing (ivory background + soft contact shadow) is done on an HTML
`<canvas>` — no dependency, full control over the look.

- Background color: `#F7F3EC` (matches site `--color-black` token = ivory page).
- Shadow: soft elliptical contact shadow beneath the product, low opacity.
- Output: high-quality JPEG/WebP at a consistent square (e.g. 1600×1600).

## Mode 1 — Single Image

Flow:
1. Merchant uploads a photo (existing `ImageUploader` drag/drop).
2. Click **"עיבוד סטודיו"** on a thumbnail.
3. In-browser: remove background → composite onto ivory + shadow.
4. **Before/after** modal — merchant chooses *"השתמש במשופרת"* or *"השאר מקור"*.
5. On accept: the composited image is uploaded to Supabase via the existing
   `/api/admin/upload` route; the product's `images[]` entry is replaced.

Nothing is replaced automatically — the merchant always reviews.

## Mode 2 — 360°

Flow:
1. Merchant uploads 8–24 frames shot around the piece (turntable / by hand).
2. In-browser batch: remove background from each frame, composite onto ivory.
3. Store the ordered frames and write them to the product's `media.sequence360`.
4. The **existing** `ProductPresentation` component already renders a
   drag-to-rotate 360 viewer from `sequence360` — no new viewer is built.

Frames upload to Supabase under the product's folder, in order.

## Architecture

- **Client component** `ProductImageStudio` (admin) holds the processing UI,
  the canvas compositing, and the before/after review. All heavy work is
  client-side.
- **Reuse** `/api/admin/upload` for persistence — no new storage route.
- **Reuse** `ProductPresentation` + `media.sequence360` for 360 playback.
- Background-removal model loads lazily (dynamic import) so it never affects the
  storefront or other admin pages.

Data shape (existing types, no schema change):
- Single image → `product.images[]` (string URLs).
- 360 → `product.media.sequence360: string[]` (ordered frame URLs).

## Error Handling

- Model fails to load / removal fails → keep original, show a clear Hebrew
  message; never lose the merchant's source image.
- Oversized files → downscale on canvas before processing.
- 360 with too few frames (<8) → warn but allow; viewer still works, just
  choppier.
- Per-frame failure in batch → skip that frame, report which ones failed.

## Build Order (incremental)

1. **Phase 1:** Mode 1 (single-image background + ivory + shadow + review).
2. **Phase 2:** Mode 2 (360 batch → existing viewer).

Phase 1 delivers visible value on its own and de-risks the engine choice before
investing in the 360 batch flow.

## Success Criteria

- Merchant uploads a messy phone photo and gets a clean ivory studio image in
  under ~15s, reviews before/after, and saves — at zero cost.
- Catalog images look consistent (same background, same framing).
- 360: a piece shot in multiple frames spins smoothly in the existing viewer.
