import { NextRequest, NextResponse } from "next/server";
import { getStripe, hasStripeConfig } from "@/lib/stripe/server";
import { hasHypConfig, createHypPaymentUrl } from "@/lib/hyp/server";
import { getProductsByIds } from "@/lib/db/products";
import { validatePromoCode } from "@/lib/promo";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { orderSchema, validateForm } from "@/lib/validations";
import { sendOrderConfirmation } from "@/lib/email/send";
import { redeemPromoCode } from "@/lib/promo";
import { rateLimit } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json();

  // Validate customer info
  const validation = validateForm(orderSchema, {
    customerEmail: body.customerEmail,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    shippingAddress: body.shippingAddress,
  });

  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // ── SECURITY: recompute all money server-side. Never trust client prices. ──
  const reqItems: { productId?: string; quantity?: number; productName?: string }[] =
    body.items;
  const ids = [
    ...new Set(reqItems.map((i) => i.productId).filter(Boolean)),
  ] as string[];
  const dbProducts = await getProductsByIds(ids);
  const priceById = new Map(dbProducts.map((p) => [p.id, p.price]));

  const pricedItems: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[] = [];
  for (const it of reqItems) {
    const price = it.productId ? priceById.get(it.productId) : undefined;
    if (price == null) {
      return NextResponse.json(
        { error: "פריט לא תקין בעגלה" },
        { status: 400 }
      );
    }
    const quantity = Math.max(1, Math.floor(Number(it.quantity) || 1));
    pricedItems.push({
      productId: it.productId as string,
      productName: it.productName ?? "פריט",
      quantity,
      price,
    });
  }

  const subtotal = pricedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // Shipping — only the known published tiers are accepted.
  const allowedShipping = new Set([0, 29, 49]);
  let shippingCost = allowedShipping.has(body.shippingCost) ? body.shippingCost : 29;
  if (subtotal >= 500 && shippingCost === 29) shippingCost = 0;

  // Discounts — re-validate the promo server-side; recompute the club gift.
  let discount = 0;
  if (body.promoCode) {
    const pv = await validatePromoCode(body.promoCode, subtotal);
    if (pv.valid) discount += pv.discount ?? 0;
  }
  if (body.joinedClub) discount += Math.round(subtotal * 0.05);
  discount = Math.min(discount, subtotal);

  const total = Math.max(0, subtotal + shippingCost - discount);

  // 1) Create order in DB with status "pending"
  const orderData = {
    order_number: "",
    customer_email: body.customerEmail,
    customer_name: body.customerName,
    customer_phone: body.customerPhone ?? "",
    shipping_address: body.shippingAddress,
    items: pricedItems,
    subtotal,
    shipping_cost: shippingCost,
    total,
    status: "pending" as const,
    payment_status: "pending" as const,
    payment_method: "stripe",
    notes: "",
  };

  let orderId: string;
  let orderNumber: string;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select("id, order_number")
      .single();

    if (error || !data) {
      console.error("[checkout] order insert error:", error?.message);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    orderId = data.id;
    orderNumber = data.order_number;
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Consume the promo code (if any) now that the order exists.
  if (body.promoCode) {
    redeemPromoCode(body.promoCode).catch(() => {});
  }

  // 2) Hyp (Yaad Sarig) — Israeli card processing. Takes priority when configured.
  if (hasHypConfig()) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
      const [firstName, ...rest] = String(body.customerName ?? "").trim().split(/\s+/);
      const paymentUrl = await createHypPaymentUrl({
        amount: Math.round(total * 100) / 100,
        order: orderNumber,
        info: `AURÉA — הזמנה ${orderNumber}`,
        clientName: firstName || undefined,
        clientLName: rest.join(" ") || undefined,
        email: body.customerEmail,
        cell: body.customerPhone || undefined,
        successUrl: `${baseUrl}/api/checkout/hyp-callback`,
        errorUrl: `${baseUrl}/checkout/cancel?order=${orderNumber}`,
      });
      try {
        const supabase = createSupabaseAdminClient();
        await supabase
          .from("orders")
          .update({ payment_method: "hyp" })
          .eq("id", orderId);
      } catch {
        // Non-critical
      }
      return NextResponse.json({ orderId, orderNumber, checkoutUrl: paymentUrl });
    } catch (err) {
      console.error("[checkout] Hyp error:", err);
      return NextResponse.json(
        { error: "Payment session creation failed" },
        { status: 500 }
      );
    }
  }

  // 3) If Stripe not configured, return order without payment
  if (!hasStripeConfig()) {
    // Send order confirmation email (fire-and-forget)
    sendOrderConfirmation(body.customerEmail, {
      orderNumber,
      customerName: body.customerName,
      items: pricedItems,
      subtotal,
      shippingCost,
      total,
    }).catch((err) => { console.error("[email] send failed:", err); });

    return NextResponse.json({
      orderId,
      orderNumber,
      status: "pending",
      note: "Stripe not configured — order created without payment",
    });
  }

  // 3) Create Stripe Checkout Session
  try {
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000`;

    const lineItems = pricedItems.map((item) => ({
      price_data: {
        currency: "ils",
        product_data: {
          name: item.productName,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects agora (cents)
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if > 0
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "ils",
          product_data: { name: "משלוח" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Apply the server-validated discount as a Stripe coupon, if any.
    let discounts: { coupon: string }[] | undefined;
    if (discount > 0) {
      try {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(discount * 100),
          currency: "ils",
          duration: "once",
          name: "הנחה",
        });
        discounts = [{ coupon: coupon.id }];
      } catch {
        // If coupon creation fails, proceed without the discount rather than block checkout.
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts,
      customer_email: body.customerEmail,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },
      success_url: `${baseUrl}/checkout/success?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?order=${orderNumber}`,
    });

    // Save Stripe session ID on the order
    try {
      const supabase = createSupabaseAdminClient();
      await supabase
        .from("orders")
        .update({ notes: `stripe_session:${session.id}` })
        .eq("id", orderId);
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      orderId,
      orderNumber,
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error("[checkout] Stripe error:", err);
    return NextResponse.json(
      { error: "Payment session creation failed" },
      { status: 500 }
    );
  }
}
