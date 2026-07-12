import { NextRequest, NextResponse } from "next/server";
import { verifyHypTransaction } from "@/lib/hyp/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Hyp redirects the customer here (GET) after the hosted payment page.
// We verify the transaction server-side, update the order, then send the
// customer to the success or cancel page.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  const order = sp.get("Order") ?? "";
  const ccode = sp.get("CCode") ?? "";
  const id = sp.get("Id") ?? "";
  const amount = sp.get("Amount") ?? "";

  const fail = () =>
    NextResponse.redirect(`${baseUrl}/checkout/cancel?order=${encodeURIComponent(order)}`);
  const succeed = () =>
    NextResponse.redirect(
      `${baseUrl}/checkout/success?order=${encodeURIComponent(order)}&total=${encodeURIComponent(amount)}`
    );

  // Quick reject before hitting the API.
  if (ccode !== "0" || !id || !order) return fail();

  let verified = false;
  try {
    verified = await verifyHypTransaction({
      Id: id,
      CCode: ccode,
      Amount: amount,
      ACode: sp.get("ACode") ?? undefined,
      Order: order,
      Sign: sp.get("Sign") ?? undefined,
    });
  } catch (err) {
    console.error("[hyp-callback] verify error:", err);
  }

  if (!verified) return fail();

  // Mark the order paid.
  try {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        notes: `hyp_txn:${id}`,
      })
      .eq("order_number", order);
  } catch (err) {
    console.error("[hyp-callback] order update error:", err);
  }

  return succeed();
}
