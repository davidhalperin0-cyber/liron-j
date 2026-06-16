import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { listPromoCodes, createPromoCode, setPromoActive } from "@/lib/promo";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;
  const codes = await listPromoCodes();
  return NextResponse.json({ codes });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  if (!body.code || typeof body.discountValue !== "number") {
    return NextResponse.json({ error: "קוד וערך הנחה נדרשים" }, { status: 400 });
  }

  const result = await createPromoCode({
    code: body.code,
    discountType: body.discountType === "fixed" ? "fixed" : "percent",
    discountValue: body.discountValue,
    minOrder: body.minOrder,
    maxUses: body.maxUses ?? null,
    expiresAt: body.expiresAt ?? null,
    note: body.note,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error?.includes("duplicate") ? "הקוד כבר קיים" : "יצירה נכשלה" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;
  const { id, active } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await setPromoActive(id, !!active);
  return NextResponse.json({ ok });
}
