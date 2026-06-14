"use client";

// In-browser background removal via Transformers.js (Apache-2.0) running a
// BiRefNet model (MIT). Free, commercial-safe, no API, no per-image cost.
// The library + model are lazy-loaded so they never enter other bundles.

// BiRefNet (MIT) — high-quality general matting, good for jewelry edges.
const MODEL_ID = "onnx-community/BiRefNet_lite";

type RemovalPipeline = (input: unknown) => Promise<unknown>;

let pipelinePromise: Promise<RemovalPipeline> | null = null;

async function getPipeline(): Promise<RemovalPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const tf = await import("@huggingface/transformers");
      // Always fetch weights from the HF CDN (no bundled/local models).
      tf.env.allowLocalModels = false;
      const pipe = await tf.pipeline("background-removal", MODEL_ID);
      return pipe as unknown as RemovalPipeline;
    })();
  }
  return pipelinePromise;
}

/**
 * Remove the background from an image blob.
 * Returns a PNG blob with a transparent background.
 */
export async function removeBackground(file: Blob): Promise<Blob> {
  const tf = await import("@huggingface/transformers");
  const image = await tf.RawImage.fromBlob(file);
  const pipe = await getPipeline();
  const output = await pipe(image);
  // background-removal returns a single RawImage (alpha applied) for a single input.
  const result = Array.isArray(output) ? output[0] : output;
  const rawImage = result as { toBlob: (type?: string) => Promise<Blob> };
  return rawImage.toBlob("image/png");
}
