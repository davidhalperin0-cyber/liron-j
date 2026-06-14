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
