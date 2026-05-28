import { NextRequest, NextResponse } from "next/server";
import { getStripe, hasStripeConfig } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { orderSchema, validateForm } from "@/lib/validations";
import { sendOrderConfirmation } from "@/lib/email/send";
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

  // 1) Create order in DB with status "pending"
  const orderData = {
    order_number: "",
    customer_email: body.customerEmail,
    customer_name: body.customerName,
    customer_phone: body.customerPhone ?? "",
    shipping_address: body.shippingAddress,
    items: body.items,
    subtotal: body.subtotal ?? 0,
    shipping_cost: body.shippingCost ?? 0,
    total: body.total ?? 0,
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

  // 2) If Stripe not configured, return order without payment
  if (!hasStripeConfig()) {
    // Send order confirmation email (fire-and-forget)
    sendOrderConfirmation(body.customerEmail, {
      orderNumber,
      customerName: body.customerName,
      items: body.items,
      subtotal: body.subtotal ?? 0,
      shippingCost: body.shippingCost ?? 0,
      total: body.total ?? 0,
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

    const lineItems = body.items.map((item: { productName: string; quantity: number; price: number }) => ({
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
    if (body.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "ils",
          product_data: { name: "משלוח" },
          unit_amount: Math.round(body.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
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
