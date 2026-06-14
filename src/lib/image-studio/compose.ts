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
