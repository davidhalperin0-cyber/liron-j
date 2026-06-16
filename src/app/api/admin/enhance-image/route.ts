import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const PROMPT =
  "Place this exact jewelry product on a clean, soft white studio background " +
  "with a subtle, realistic contact shadow directly beneath it. Improve the " +
  "lighting, clarity and sharpness so it looks like a premium catalog photo. " +
  "Center the product in a square composition. Do NOT change the product's " +
  "shape, gemstones, proportions, or metal color. Output only the edited image.";

/**
 * Server-side studio enhancer. Sends the uploaded photo to Gemini
 * ("Nano Banana") which removes the background, places the piece on a white
 * studio backdrop with a shadow, and enhances it. Returns a base64 data URL.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "חסר GEMINI_API_KEY בהגדרות השרת" },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "לא התקבלה תמונה" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "image/jpeg";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: mimeType, data: base64 } },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("[enhance-image] Gemini error:", res.status, detail.slice(0, 300));
      return NextResponse.json(
        { error: "מנוע התמונות החזיר שגיאה. נסו שוב." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inline_data?: { data?: string }; inlineData?: { data?: string } }) =>
        p.inline_data?.data || p.inlineData?.data
    );
    const outData = imagePart?.inline_data?.data || imagePart?.inlineData?.data;
    const outMime =
      imagePart?.inline_data?.mime_type || imagePart?.inlineData?.mimeType || "image/png";

    if (!outData) {
      return NextResponse.json(
        { error: "המנוע לא החזיר תמונה. נסו תמונה אחרת." },
        { status: 502 }
      );
    }

    return NextResponse.json({ image: `data:${outMime};base64,${outData}` });
  } catch (err) {
    console.error("[enhance-image] exception:", err);
    return NextResponse.json({ error: "שגיאת שרת בעיבוד התמונה" }, { status: 500 });
  }
}
