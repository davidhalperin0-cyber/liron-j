"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Package, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order {
  total: number;
  status: string;
  created_at: string;
  customer_email: string;
  items: { productName: string; quantity: number; price: number }[];
}

function getMonthLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function AnalyticsAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gold/40" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / activeOrders.length : 0;
  const uniqueCustomers = new Set(orders.map((o) => o.customer_email)).size;
  const paidOrders = orders.filter((o) => o.status !== "pending" && o.status !== "cancelled").length;
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

  // Monthly breakdown
  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  for (const order of activeOrders) {
    const month = getMonthLabel(order.created_at);
    const existing = monthlyMap.get(month);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      monthlyMap.set(month, { revenue: order.total, orders: 1 });
    }
  }
  const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));

  // Top products from order items
  const productMap = new Map<string, { name: string; sales: number; revenue: number }>();
  for (const order of activeOrders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const name = item.productName ?? "Unknown";
      const existing = productMap.get(name);
      if (existing) {
        existing.sales += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productMap.set(name, { name, sales: item.quantity, revenue: item.price * item.quantity });
      }
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const stats = [
    { label: "הכנסות כולל", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-green-400" },
    { label: "סה\"כ הזמנות", value: String(totalOrders), icon: ShoppingCart, color: "text-blue-400" },
    { label: "ערך הזמנה ממוצע", value: formatPrice(Math.round(avgOrderValue)), icon: Package, color: "text-purple-400" },
    { label: "לקוחות ייחודיים", value: String(uniqueCustomers), icon: Users, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-white">אנליטיקס</h1>
        <p className="text-sm text-white/40 mt-1">נתונים מבוססים על הזמנות אמיתיות</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-charcoal border border-white/5 p-5 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40">{stat.label}</span>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-medium text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="bg-charcoal border border-white/5 rounded-lg">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-medium text-white">פירוט חודשי</h2>
          </div>
          {monthlyData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-white/30">אין נתונים עדיין</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {monthlyData.map((row) => {
                const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));
                const barWidth = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0;

                return (
                  <div key={row.month} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/60">{row.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/30">{row.orders} הזמנות</span>
                        <span className="text-sm text-gold">{formatPrice(row.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold/40 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-charcoal border border-white/5 rounded-lg">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-medium text-white">מוצרים מובילים</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-white/30">אין נתונים עדיין</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {topProducts.map((product, i) => (
                <div
                  key={product.name}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-xs text-white/20 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{product.name}</p>
                    <p className="text-[10px] text-white/30">{product.sales} יחידות</p>
                  </div>
                  <span className="text-sm text-gold">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Extra Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-charcoal border border-white/5 rounded-lg p-5">
          <p className="text-xs text-white/40 mb-1">שיעור הזמנות ששולמו</p>
          <p className="text-2xl font-medium text-white">{conversionRate.toFixed(1)}%</p>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-green-400/40 rounded-full"
              style={{ width: `${Math.min(conversionRate, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-charcoal border border-white/5 rounded-lg p-5">
          <p className="text-xs text-white/40 mb-1">הזמנות בממתינות</p>
          <p className="text-2xl font-medium text-white">{orders.filter((o) => o.status === "pending").length}</p>
          <p className="text-[10px] text-white/20 mt-1">ממתינות לתשלום או אישור</p>
        </div>
      </div>
    </div>
  );
}
