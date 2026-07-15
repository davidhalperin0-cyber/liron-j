import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api-auth";
import { SUPPLIERS, getSupplier } from "@/lib/suppliers";

// Builds a WhatsApp-ready order message, grouped by supplier, including each
// product's image link — so the store owner can forward each group to the
// right supplier with one tap.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const orderId = request.nextUrl.searchParams.get("id");
  if (!orderId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  type Item = { productId: string; productName: string; quantity: number; price: number; variantName?: string };
  const items = (order.items ?? []) as Item[];

  // Fetch supplier + image for each product in the order.
  const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  const { data: prods } = await supabase
    .from("products")
    .select("id,name_he,image_url,images,options")
    .in("id", ids);
  const byId = new Map((prods ?? []).map((p) => [p.id, p]));

  // Group items by supplier id (options.supplier), unassigned last.
  const groups = new Map<string, { name: string; phone: string; lines: string[] }>();
  for (const it of items) {
    const p = byId.get(it.productId);
    const opts = (p?.options ?? {}) as { supplier?: string };
    const sup = getSupplier(opts.supplier);
    const key = sup?.id ?? "none";
    if (!groups.has(key)) {
      groups.set(key, { name: sup?.name ?? "ללא ספק משויך", phone: sup?.phone ?? "", lines: [] });
    }
    const image = p?.images?.[1] ?? p?.image_url ?? "";
    groups.get(key)!.lines.push(
      `• ${it.productName}${it.variantName ? ` (${it.variantName})` : ""} × ${it.quantity}` +
        (image ? `\n  תמונה: ${image}` : "")
    );
  }

  const addr = order.shipping_address as { address?: string; city?: string; postalCode?: string } | null;
  const header =
    `🛍️ הזמנה ${order.order_number} — AURÉA\n` +
    `לקוח/ה: ${order.customer_name} · ${order.customer_phone}\n` +
    `כתובת: ${addr?.address ?? ""}, ${addr?.city ?? ""}${addr?.postalCode ? " " + addr.postalCode : ""}\n` +
    `סה"כ: ₪${order.total}\n`;

  const groupList = [...groups.entries()].map(([id, g]) => ({
    supplierId: id,
    supplierName: g.name,
    phone: g.phone,
    text: `${header}\nפריטים (${g.name}):\n${g.lines.join("\n")}`,
  }));

  const fullText =
    header +
    "\n" +
    groupList.map((g) => `--- ${g.supplierName} ---\n${g.text.split("\nפריטים")[1] ? "פריטים" + g.text.split("\nפריטים")[1] : ""}`).join("\n\n");

  return NextResponse.json({
    orderNumber: order.order_number,
    groups: groupList,
    fullText,
    suppliers: SUPPLIERS,
  });
}
