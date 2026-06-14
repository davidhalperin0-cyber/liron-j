import { describe, it, expect } from "vitest";
import {
  STUDIO_SIZE,
  fitContain,
  shadowEllipse,
  orderFrames,
  validateImageFile,
} from "./geometry";

describe("fitContain", () => {
  it("scales a wide image to fit within the padded square and centers it", () => {
    const r = fitContain(2000, 1000, STUDIO_SIZE, 0.82);
    const maxContent = STUDIO_SIZE * 0.82; // 1312
    expect(Math.round(r.width)).toBe(Math.round(maxContent));
    expect(r.height).toBeLessThan(r.width);
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
    expect(s.cy).toBeGreaterThan(placement.y + placement.height - 1);
    expect(s.rx).toBeGreaterThan(s.ry);
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
