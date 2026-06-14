# Product Image Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the AURÉA admin a zero-cost, in-browser studio that removes a photo's background, places the product on an ivory studio backdrop with a soft contact shadow, and (Phase 2) assembles multiple frames into the existing 360 viewer.

**Architecture:** All image processing runs client-side in the admin browser — `@imgly/background-removal` (WASM/ONNX) for cutout, an HTML `<canvas>` for compositing onto ivory `#F7F3EC` with a soft shadow. Pure geometry/validation logic is extracted into a testable helper module. Only the final image is persisted, reusing the existing `/api/admin/upload` route and `media.sequence360` field — no new storage route, no new 360 viewer.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, `@imgly/background-removal`, HTML Canvas, vitest (new, for pure helpers), Supabase storage (existing).

---

## File Structure

- `src/lib/image-studio/geometry.ts` — pure functions: target sizing, centered fit, shadow ellipse params, frame ordering, file validation. **Unit-tested.**
- `src/lib/image-studio/compose.ts` — canvas compositing (ivory bg + shadow + product). Browser-verified.
- `src/lib/image-studio/remove-bg.ts` — lazy wrapper around `@imgly/background-removal`. Browser-verified.
- `src/components/admin/product-image-studio.tsx` — admin UI: single-image + 360 tabs, before/after review. Browser-verified.
- `src/components/admin/image-uploader.tsx` — modify: add a "עיבוד סטודיו" action per image that opens the studio.
- `vitest.config.ts` + `package.json` — add vitest + `test` script.

Data shapes are unchanged: single image → `product.images[]`; 360 → `product.media.sequence360[]`.

---

## Task 1: Project setup — deps + vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Read the Next.js client-component / lazy-loading guidance**

Run: `sed -n '1,60p' node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`
Expected: confirms `next/dynamic` usage and `ssr: false` for client-only modules. (Per `AGENTS.md`, read before coding.)

- [ ] **Step 2: Install dependencies**

Run: `npm install @imgly/background-removal && npm install -D vitest`
Expected: both added to `package.json`, no peer-dep errors that break install.

- [ ] **Step 3: Add test script**

In `package.json` `scripts`, add: `"test": "vitest run"`.

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Verify vitest runs (no tests yet = exit 0)**

Run: `npx vitest run`
Expected: "No test files found" — exit code 0 (acceptable for setup).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add @imgly/background-removal and vitest"
```

---

## Task 2: Pure geometry + validation helpers (TDD)

**Files:**
- Create: `src/lib/image-studio/geometry.ts`
- Test: `src/lib/image-studio/geometry.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import {
  STUDIO_SIZE,
  IVORY_BG,
  fitContain,
  shadowEllipse,
  orderFrames,
  validateImageFile,
} from "./geometry";

describe("fitContain", () => {
  it("scales a wide image to fit within the padded square and centers it", () => {
    // 2000x1000 source into 1600 canvas with 0.82 content scale
    const r = fitContain(2000, 1000, STUDIO_SIZE, 0.82);
    const maxContent = STUDIO_SIZE * 0.82; // 1312
    expect(Math.round(r.width)).toBe(Math.round(maxContent)); // width is the limiting side
    expect(r.height).toBeLessThan(r.width);
    // centered
    expect(Math.round(r.x + r.width / 2)).toBe(STUDIO_SIZE / 2);
    expect(Math.round(r.y + r.height / 2)).toBe(STUDIO_SIZE / 2);
  });

  it("scales a tall image so height is the limiting side", () => {
    const r = fitContain(1000, 2000, STUDIO_SIZE, 0.82);
    const maxContent = STUDIO_SIZE * 0.82;
    expect(Math.round(r.height)).toBe(Math.round(maxContent));
    expect(r.width).toBeLessThan(r.height);
  });
});

describe("shadowEllipse", () => {
  it("sits beneath the product and is wider than it is tall", () => {
    const placement = fitContain(1000, 1000, STUDIO_SIZE, 0.82);
    const s = shadowEllipse(placement, STUDIO_SIZE);
    expect(s.cx).toBe(STUDIO_SIZE / 2);
    expect(s.cy).toBeGreaterThan(placement.y + placement.height - 1); // near/below the base
    expect(s.rx).toBeGreaterThan(s.ry); // flattened
  });
});

describe("orderFrames", () => {
  it("orders frames by trailing number in the filename, not lexicographically", () => {
    const files = [
      { name: "ring_10.jpg" },
      { name: "ring_2.jpg" },
      { name: "ring_1.jpg" },
    ] as File[];
    expect(orderFrames(files).map((f) => f.name)).toEqual([
      "ring_1.jpg",
      "ring_2.jpg",
      "ring_10.jpg",
    ]);
  });
});

describe("validateImageFile", () => {
  it("accepts jpeg/png/webp under the size cap", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 5_000_000 } as File).ok).toBe(true);
  });
  it("rejects non-images", () => {
    const r = validateImageFile({ type: "application/pdf", size: 100 } as File);
    expect(r.ok).toBe(false);
  });
  it("rejects files over 25MB", () => {
    const r = validateImageFile({ type: "image/png", size: 30_000_000 } as File);
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/image-studio/geometry.test.ts`
Expected: FAIL — "Failed to resolve import ./geometry" / functions undefined.

- [ ] **Step 3: Implement `geometry.ts`**

```ts
export const STUDIO_SIZE = 1600;
export const IVORY_BG = "#F7F3EC";

export interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Fit a source image inside `size`*`contentScale`, centered. */
export function fitContain(
  srcW: number,
  srcH: number,
  size: number,
  contentScale: number
): Placement {
  const max = size * contentScale;
  const ratio = srcW / srcH;
  let width = max;
  let height = max;
  if (ratio >= 1) {
    height = max / ratio;
  } else {
    width = max * ratio;
  }
  return { x: (size - width) / 2, y: (size - height) / 2, width, height };
}

export interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/** Soft contact shadow centered under the product base. */
export function shadowEllipse(p: Placement, size: number): Ellipse {
  const base = p.y + p.height;
  return {
    cx: size / 2,
    cy: Math.min(base + p.height * 0.02, size - 8),
    rx: p.width * 0.42,
    ry: p.height * 0.05,
  };
}

/** Order frames by the last number in the filename (natural order). */
export function orderFrames(files: File[]): File[] {
  const num = (n: string) => {
    const m = n.match(/(\d+)(?=\.[^.]+$)/);
    return m ? parseInt(m[1], 10) : 0;
  };
  return [...files].sort((a, b) => num(a.name) - num(b.name));
}

const MAX_BYTES = 25 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): { ok: boolean; error?: string } {
  if (!OK_TYPES.includes(file.type)) {
    return { ok: false, error: "פורמט לא נתמך — רק JPG, PNG או WebP" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "הקובץ גדול מדי (מקסימום 25MB)" };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/image-studio/geometry.test.ts`
Expected: PASS — all cases green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/image-studio/geometry.ts src/lib/image-studio/geometry.test.ts
git commit -m "feat: image-studio geometry + validation helpers"
```

---

## Task 3: Canvas compositing (ivory bg + shadow)

**Files:**
- Create: `src/lib/image-studio/compose.ts`

This module needs a real `<canvas>`/`Image`, so it is **browser-verified** (vitest node env can't render canvas). Keep it small and lean on the Task 2 helpers (already tested).

- [ ] **Step 1: Implement `compose.ts`**

```ts
"use client";

import {
  STUDIO_SIZE,
  IVORY_BG,
  fitContain,
  shadowEllipse,
  type Placement,
} from "./geometry";

const CONTENT_SCALE = 0.82;

/** Draw a transparent-cutout image onto an ivory studio canvas with a soft shadow. */
export async function composeOnIvory(cutout: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(cutout);
  const canvas = document.createElement("canvas");
  canvas.width = STUDIO_SIZE;
  canvas.height = STUDIO_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Ivory background
  ctx.fillStyle = IVORY_BG;
  ctx.fillRect(0, 0, STUDIO_SIZE, STUDIO_SIZE);

  const placement: Placement = fitContain(
    bitmap.width,
    bitmap.height,
    STUDIO_SIZE,
    CONTENT_SCALE
  );

  // Soft contact shadow
  const s = shadowEllipse(placement, STUDIO_SIZE);
  ctx.save();
  ctx.filter = "blur(18px)";
  ctx.fillStyle = "rgba(28, 25, 21, 0.18)";
  ctx.beginPath();
  ctx.ellipse(s.cx, s.cy, s.rx, s.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Product
  ctx.drawImage(bitmap, placement.x, placement.y, placement.width, placement.height);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.92
    )
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors in `compose.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/image-studio/compose.ts
git commit -m "feat: ivory canvas compositing with soft shadow"
```

---

## Task 4: Background-removal wrapper (lazy)

**Files:**
- Create: `src/lib/image-studio/remove-bg.ts`

- [ ] **Step 1: Implement the lazy wrapper**

```ts
"use client";

/** Lazily load @imgly/background-removal so it never enters other bundles. */
export async function removeBackground(file: Blob): Promise<Blob> {
  const { removeBackground: imgly } = await import("@imgly/background-removal");
  // Returns a PNG blob with transparent background.
  return imgly(file);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If types are missing, add `// @ts-expect-error` only as a last resort and note it.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/image-studio/remove-bg.ts
git commit -m "feat: lazy background-removal wrapper"
```

---

## Task 5: Single-image studio component + before/after review

**Files:**
- Create: `src/components/admin/product-image-studio.tsx`

Single end-to-end pipeline: pick file → validate → removeBackground → composeOnIvory → before/after → on accept, upload via `/api/admin/upload` and return the new URL through `onResult`.

- [ ] **Step 1: Implement the component**

```tsx
"use client";

import { useState, useCallback } from "react";
import { Loader2, X, Sparkles } from "lucide-react";
import { validateImageFile } from "@/lib/image-studio/geometry";
import { removeBackground } from "@/lib/image-studio/remove-bg";
import { composeOnIvory } from "@/lib/image-studio/compose";

interface Props {
  productSlug: string;
  onResult: (publicUrl: string) => void;
  onClose: () => void;
}

export function ProductImageStudio({ productSlug, onResult, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterBlob, setAfterBlob] = useState<Blob | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  const process = useCallback(async (file: File) => {
    const v = validateImageFile(file);
    if (!v.ok) { setError(v.error!); return; }
    setError(null);
    setBeforeUrl(URL.createObjectURL(file));
    setBusy(true);
    try {
      const cut = await removeBackground(file);
      const composed = await composeOnIvory(cut);
      setAfterBlob(composed);
      setAfterUrl(URL.createObjectURL(composed));
    } catch {
      setError("העיבוד נכשל. נסה תמונה אחרת או השאר את המקור.");
    } finally {
      setBusy(false);
    }
  }, []);

  const accept = useCallback(async () => {
    if (!afterBlob) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", new File([afterBlob], "studio.jpg", { type: "image/jpeg" }));
      fd.append("productSlug", productSlug);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload");
      const data = await res.json();
      onResult(data.publicUrl);
      onClose();
    } catch {
      setError("ההעלאה נכשלה. נסה שוב.");
    } finally {
      setBusy(false);
    }
  }, [afterBlob, productSlug, onResult, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] border border-gold/15 p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 end-4 text-white/40 hover:text-white/70" aria-label="סגירה">
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} className="text-gold" />
          <h3 className="text-sm tracking-[0.2em] uppercase text-white/70">עיבוד סטודיו</h3>
        </div>

        {!beforeUrl && (
          <label className="block border border-dashed border-gold/30 rounded-sm p-10 text-center cursor-pointer hover:border-gold/50 transition-colors">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => e.target.files?.[0] && process(e.target.files[0])} />
            <p className="text-sm text-white/50">בחר תמונה להעלאה</p>
          </label>
        )}

        {beforeUrl && (
          <div className="grid grid-cols-2 gap-4">
            <figure>
              <figcaption className="text-[11px] tracking-widest uppercase text-white/30 mb-2">לפני</figcaption>
              <img src={beforeUrl} alt="לפני" className="w-full aspect-square object-cover" />
            </figure>
            <figure>
              <figcaption className="text-[11px] tracking-widest uppercase text-gold/60 mb-2">אחרי</figcaption>
              <div className="w-full aspect-square flex items-center justify-center" style={{ background: "#F7F3EC" }}>
                {busy && <Loader2 className="animate-spin text-gold" />}
                {afterUrl && <img src={afterUrl} alt="אחרי" className="w-full h-full object-contain" />}
              </div>
            </figure>
          </div>
        )}

        {error && <p className="text-xs text-deep-red mt-4">{error}</p>}

        {afterUrl && !busy && (
          <div className="flex gap-3 mt-6">
            <button onClick={accept} className="flex-1 py-3 bg-gold text-black text-sm font-medium hover:bg-gold-light transition-colors">
              השתמש במשופרת
            </button>
            <button onClick={onClose} className="px-6 py-3 border border-white/15 text-sm text-white/60 hover:text-white/90 transition-colors">
              השאר מקור
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && cd /Users/harelhalperin/liron-j && npx next build`
Expected: compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/product-image-studio.tsx
git commit -m "feat: single-image studio component with before/after review"
```

---

## Task 6: Wire the studio into the admin image uploader

**Files:**
- Modify: `src/components/admin/image-uploader.tsx`

- [ ] **Step 1: Add studio trigger + modal**

In `ImageUploader`, import the studio and add state:

```tsx
import { ProductImageStudio } from "@/components/admin/product-image-studio";
// inside the component:
const [studioOpen, setStudioOpen] = useState(false);
```

Add a button near the upload control:

```tsx
<button
  type="button"
  onClick={() => setStudioOpen(true)}
  className="mt-3 inline-flex items-center gap-2 text-xs text-gold/80 hover:text-gold transition-colors"
>
  ✨ עיבוד סטודיו (רקע לבן + שיפור)
</button>
{studioOpen && (
  <ProductImageStudio
    productSlug={productSlug}
    onResult={(url) => onChange([...images, url])}
    onClose={() => setStudioOpen(false)}
  />
)}
```

- [ ] **Step 2: Build**

Run: `cd /Users/harelhalperin/liron-j && npx next build`
Expected: compiles successfully.

- [ ] **Step 3: Browser verification**

Start the dev server (preview tooling), open `/admin/products`, open a product, click "עיבוד סטודיו", upload a sample jewelry photo, confirm: background removed, ivory backdrop + soft shadow, before/after shows, "השתמש במשופרת" uploads and the new image appears in the gallery.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/image-uploader.tsx
git commit -m "feat: launch image studio from admin uploader"
```

---

## Task 7 (Phase 2): 360° batch → existing viewer

**Files:**
- Modify: `src/components/admin/product-image-studio.tsx` (add a 360 tab)

- [ ] **Step 1: Add a 360 mode**

Add a `mode` state (`"single" | "spin"`). In `"spin"` mode accept multiple files, then:

```tsx
import { orderFrames } from "@/lib/image-studio/geometry";

async function processFrames(files: File[], onProgress: (done: number, total: number) => void): Promise<string[]> {
  const ordered = orderFrames(files);
  const urls: string[] = [];
  for (let i = 0; i < ordered.length; i++) {
    try {
      const cut = await removeBackground(ordered[i]);
      const composed = await composeOnIvory(cut);
      const fd = new FormData();
      fd.append("file", new File([composed], `frame_${i}.jpg`, { type: "image/jpeg" }));
      fd.append("productSlug", productSlug);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) urls.push((await res.json()).publicUrl);
    } catch { /* skip failed frame, continue */ }
    onProgress(i + 1, ordered.length);
  }
  return urls;
}
```

On completion, call a new prop `onSequence(urls: string[])` so the editor writes them to `product.media.sequence360`.

- [ ] **Step 2: Persist into `media.sequence360`**

In the admin product editor that hosts `ImageUploader`, pass `onSequence` to set `media.sequence360 = urls`. The existing `ProductPresentation` already renders a drag-to-rotate viewer when `sequence360` is present (verify in `src/lib/product-media.ts` decision logic).

- [ ] **Step 3: Build**

Run: `cd /Users/harelhalperin/liron-j && npx next build`
Expected: compiles successfully.

- [ ] **Step 4: Browser verification**

Upload 8–24 frames, confirm each is processed (progress shown), the product page shows the 360 viewer and drag rotates through the ivory-background frames.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 360 batch mode feeding the existing spin viewer"
```

---

## Self-Review Notes

- **Spec coverage:** Mode 1 (Tasks 2-6), Mode 2 (Task 7), ivory `#F7F3EC` + shadow (Task 3), in-browser/zero-cost engine (Task 4), review-before-save (Task 5), reuse upload route + `sequence360` viewer (Tasks 5-7). License open-item from the spec is checked in Task 1 Step 2 (install) — if `@imgly` license is unsuitable, swap the wrapper in Task 4 for a permissive ONNX U²-Net remover; the rest of the pipeline is engine-agnostic.
- **Types:** `Placement`/`Ellipse` defined in Task 2 and consumed in Task 3; `removeBackground`/`composeOnIvory`/`validateImageFile`/`orderFrames` signatures match across tasks.
- **Verification honesty:** Canvas/ML/UI tasks are browser-verified (vitest node env can't render canvas); only the pure helpers are unit-tested.
