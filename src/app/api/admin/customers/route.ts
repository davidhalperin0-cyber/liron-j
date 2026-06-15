import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface OrderRow {
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  total: number | null;
  created_at: string | null;
}

interface OrderStat {
  orders: number;
  totalSpent: number;
  lastOrder: string;
  name?: string;
  phone?: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birthday: string | null;
  marketing_consent: boolean | null;
  vip_tier: string | null;
  created_at: string | null;
}

function aggregateOrders(orders: OrderRow[]): Record<string, OrderStat> {
  const stats: Record<string, OrderStat> = {};
  for (const o of orders) {
    const email = (o.customer_email ?? "").toLowerCase();
    if (!email) continue;
    const s = stats[email] ?? { orders: 0, totalSpent: 0, lastOrder: "" };
    s.orders += 1;
    s.totalSpent += o.total ?? 0;
    if (o.created_at && o.created_at > s.lastOrder) s.lastOrder = o.created_at;
    s.name = s.name ?? o.customer_name ?? undefined;
    s.phone = s.phone ?? o.customer_phone ?? undefined;
    stats[email] = s;
  }
  return stats;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const supabase = createSupabaseAdminClient();

  // Order stats (used to enrich every customer)
  const { data: ordersData } = await supabase
    .from("orders")
    .select("customer_email,customer_name,customer_phone,total,created_at");
  const orders = (ordersData ?? []) as OrderRow[];
  const stats = aggregateOrders(orders);

  // Registered users (profiles). If the table isn't there yet, fall back to
  // deriving customers from orders so the page keeps working pre-migration.
  const { data: profilesData, error: profilesErr } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,phone,birthday,marketing_consent,vip_tier,created_at")
    .order("created_at", { ascending: false });
  const profiles = (profilesData ?? []) as unknown as ProfileRow[];

  if (profilesErr) {
    const customers = Object.entries(stats).map(([email, s]) => ({
      email,
      name: s.name ?? "—",
      phone: s.phone ?? "",
      birthday: null as string | null,
      vipTier: "standard",
      marketingConsent: false,
      registered: false,
      orders: s.orders,
      totalSpent: s.totalSpent,
      lastOrder: s.lastOrder,
    }));
    return NextResponse.json({ customers, source: "orders", needsMigration: true });
  }

  const customers = profiles.map((p) => {
    const s = stats[(p.email ?? "").toLowerCase()];
    return {
      email: p.email ?? "",
      name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "—",
      phone: p.phone ?? "",
      birthday: p.birthday ?? null,
      vipTier: p.vip_tier ?? "standard",
      marketingConsent: !!p.marketing_consent,
      registered: true,
      orders: s?.orders ?? 0,
      totalSpent: s?.totalSpent ?? 0,
      lastOrder: s?.lastOrder ?? "",
    };
  });

  return NextResponse.json({ customers, source: "profiles" });
}
