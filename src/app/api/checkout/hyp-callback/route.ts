import { NextRequest, NextResponse } from "next/server";
import { verifyHypTransaction } from "@/lib/hyp/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email/send";

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

  // Mark the order paid — but only if the paid amount matches the order total.
  try {
    const supabase = createSupabaseAdminClient();
    const { data: order_row } = await supabase
      .from("orders")
      .select("total, customer_email, customer_name, items, subtotal, shipping_cost, payment_status")
      .eq("order_number", order)
      .single();

    // Reject if the order is unknown or the paid amount doesn't match its total.
    if (!order_row || Math.abs(Number(order_row.total) - Number(amount)) > 0.5) {
      console.error("[hyp-callback] amount mismatch", { order, amount, expected: order_row?.total });
      return fail();
    }

    // Only mark + email once (Hyp may call the return URL more than once).
    const alreadyPaid = order_row.payment_status === "paid";

    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        notes: `hyp_txn:${id}`,
      })
      .eq("order_number", order);

    // Send the receipt / confirmation email (fire-and-forget; never blocks the redirect).
    if (!alreadyPaid && order_row.customer_email) {
      const items = Array.isArray(order_row.items)
        ? (order_row.items as { productName: string; quantity: number; price: number }[])
        : [];
      sendOrderConfirmation(order_row.customer_email, {
        orderNumber: order,
        customerName: order_row.customer_name ?? "",
        items,
        subtotal: Number(order_row.subtotal ?? 0),
        shippingCost: Number(order_row.shipping_cost ?? 0),
        total: Number(order_row.total ?? 0),
      }).catch((e) => console.error("[hyp-callback] email failed:", e));
    }
  } catch (err) {
    console.error("[hyp-callback] order update error:", err);
    return fail();
  }

  return succeed();
}
