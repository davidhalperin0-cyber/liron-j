import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error("[webhook] No order_id in session metadata");
        break;
      }

      // Update order: payment confirmed
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_method: "stripe",
          notes: `stripe_payment:${session.payment_intent}`,
        })
        .eq("id", orderId);

      if (error) {
        console.error("[webhook] Failed to update order:", error.message);
      } else {
        console.log(`[webhook] Order ${orderId} payment confirmed`);

        // Send order confirmation email
        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderData) {
          const items = Array.isArray(orderData.items) ? orderData.items as { productName: string; quantity: number; price: number }[] : [];
          sendOrderConfirmation(orderData.customer_email, {
            orderNumber: orderData.order_number,
            customerName: orderData.customer_name,
            items,
            subtotal: orderData.subtotal,
            shippingCost: orderData.shipping_cost,
            total: orderData.total,
          }).catch((err) => { console.error("[email] send failed:", err); }); // Fire-and-forget
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", orderId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntent = charge.payment_intent;

      if (paymentIntent) {
        // Find order by payment intent stored in notes
        const { data } = await supabase
          .from("orders")
          .select("id")
          .like("notes", `%${paymentIntent}%`)
          .single();

        if (data) {
          await supabase
            .from("orders")
            .update({ payment_status: "refunded" })
            .eq("id", data.id);
        }
      }
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
