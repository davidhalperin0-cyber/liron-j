import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo";
import { rateLimit } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { code, subtotal } = await request.json();
  if (typeof code !== "string" || typeof subtotal !== "number") {
    return NextResponse.json({ valid: false, message: "בקשה לא תקינה" }, { status: 400 });
  }

  const result = await validatePromoCode(code, subtotal);
  return NextResponse.json(result);
}
