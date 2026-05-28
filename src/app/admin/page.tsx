"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Home,
  BarChart3,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items: { productName: string; quantity: number }[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "ממתינה", color: "bg-blue-500/10 text-blue-400" },
  confirmed: { label: "אושרה", color: "bg-cyan-500/10 text-cyan-400" },
  processing: { label: "בטיפול", color: "bg-yellow-500/10 text-yellow-400" },
  shipped: { label: "נשלחה", color: "bg-purple-500/10 text-purple-400" },
  delivered: { label: "הושלמה", color: "bg-green-500/10 text-green-400" },
  cancelled: { label: "בוטלה", color: "bg-red-500/10 text-red-400" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק'`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, contactRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/contact"),
        ]);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders ?? []);
        }
        if (contactRes.ok) {
          const data = await contactRes.json();
          setContactCount(data.submissions?.length ?? 0);
        }
      } catch {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: "הכנסות", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-green-400" },
    { label: "הזמנות", value: String(orders.length), icon: ShoppingCart, color: "text-blue-400" },
    { label: "ממתינות לטיפול", value: String(pendingOrders), icon: Package, color: "text-yellow-400" },
    { label: "פניות חדשות", value: String(contactCount), icon: MessageSquare, color: "text-purple-400" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gold/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-white">דשבורד</h1>
        <p className="text-sm text-white/40 mt-1">סקירה כללית</p>
      </div>

      {/* Stats Grid */}
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

      {/* Recent Orders */}
      <div className="bg-charcoal border border-white/5 rounded-lg">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">הזמנות אחרונות</h2>
          <Link href="/admin/orders" className="text-xs text-gold/60 hover:text-gold transition-colors">
            כל ההזמנות
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">אין הזמנות עדיין</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
              const itemCount = Array.isArray(order.items) ? order.items.length : 0;

              return (
                <div
                  key={order.id}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm text-white/80 font-mono">{order.order_number}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px]", statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">
                      {order.customer_name} · {itemCount} פריטים
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gold font-medium">{formatPrice(order.total)}</p>
                    <p className="text-[10px] text-white/20">{timeAgo(order.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "ניהול מוצרים", href: "/admin/products", icon: Package },
          { label: "ערוך דף הבית", href: "/admin/homepage", icon: Home },
          { label: "צפה בהזמנות", href: "/admin/orders", icon: ShoppingCart },
          { label: "סטטיסטיקות", href: "/admin/analytics", icon: BarChart3 },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 p-4 bg-charcoal border border-white/5 rounded-lg hover:border-gold/20 hover:bg-gold/[0.02] transition-all group"
          >
            <action.icon size={20} className="text-white/30 group-hover:text-gold transition-colors" />
            <span className="text-sm text-white/60 group-hover:text-white transition-colors">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
