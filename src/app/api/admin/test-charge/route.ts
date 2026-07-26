import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api-auth";
import { hasHypConfig, createHypPaymentUrl } from "@/lib/hyp/server";

// Admin-only: generate a REAL Hyp payment link for a chosen product at a chosen
// amount — a quick way to verify the live terminal end to end.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("products")
    .select("id,name_he,category,price,image_url,images")
    .eq("status", "active")
    .order("name_he", { ascending: true });
  return NextResponse.json({ products: data ?? [], configured: hasHypConfig() });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  if (!hasHypConfig()) {
    return NextResponse.json({ error: "Hyp לא מוגדר" }, { status: 400 });
  }

  const { productId, amount } = (await request.json()) as { productId?: string; amount?: number };
  const amt = Number(amount);
  if (!amt || amt <= 0 || amt > 100) {
    return NextResponse.json({ error: "סכום לא תקין (1–100)" }, { status: 400 });
  }

  let name = "בדיקת סליקה";
  if (productId) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("products")
      .select("name_he")
      .eq("id", productId)
      .single();
    if (data?.name_he) name = data.name_he;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const order = `TEST-${Date.now().toString().slice(-8)}`;

  try {
    const url = await createHypPaymentUrl({
      amount: amt,
      order,
      info: `בדיקת סליקה — ${name}`,
      clientName: "בדיקה",
      successUrl: `${baseUrl}/api/checkout/hyp-callback`,
      errorUrl: `${baseUrl}/checkout/cancel?order=${order}`,
    });
    return NextResponse.json({ url, order, name, amount: amt });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "יצירת קישור נכשלה" },
      { status: 500 }
    );
  }
}
