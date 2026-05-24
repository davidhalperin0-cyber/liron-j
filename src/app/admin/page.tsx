"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Eye,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const STATS = [
  {
    label: "מכירות היום",
    value: "₪12,450",
    change: "+18%",
    trend: "up" as const,
    icon: DollarSign,
    color: "text-green-400",
  },
  {
    label: "הזמנות חדשות",
    value: "8",
    change: "+3",
    trend: "up" as const,
    icon: ShoppingCart,
    color: "text-blue-400",
  },
  {
    label: "מבקרים היום",
    value: "342",
    change: "+12%",
    trend: "up" as const,
    icon: Eye,
    color: "text-purple-400",
  },
  {
    label: "לקוחות חדשים",
    value: "14",
    change: "-2",
    trend: "down" as const,
    icon: Users,
    color: "text-orange-400",
  },
];

const RECENT_ORDERS = [
  { id: "LJ-1024", customer: "רונית כהן", total: 6800, status: "חדשה", items: 2, time: "לפני 12 דק'" },
  { id: "LJ-1023", customer: "דנה לוי", total: 3400, status: "בטיפול", items: 1, time: "לפני 45 דק'" },
  { id: "LJ-1022", customer: "מיכל אברהם", total: 11200, status: "נשלחה", items: 3, time: "לפני 2 שעות" },
  { id: "LJ-1021", customer: "יעל שרון", total: 4500, status: "הושלמה", items: 1, time: "לפני 5 שעות" },
  { id: "LJ-1020", customer: "נועה בן דוד", total: 8900, status: "חדשה", items: 2, time: "אתמול" },
];

const TOP_PRODUCTS = [
  { name: "טבעת יהלום סלסטיאל", sales: 24, revenue: 163200, trend: "up" as const },
  { name: "עגילי חישוק יהלומים", sales: 18, revenue: 81000, trend: "up" as const },
  { name: "שרשרת כוכב הצפון", sales: 15, revenue: 58500, trend: "down" as const },
  { name: "צמיד אינפיניטי", sales: 12, revenue: 61200, trend: "up" as const },
  { name: "טבעת נצח", sales: 10, revenue: 52000, trend: "up" as const },
];

const STATUS_COLORS: Record<string, string> = {
  "חדשה": "bg-blue-500/10 text-blue-400",
  "בטיפול": "bg-yellow-500/10 text-yellow-400",
  "נשלחה": "bg-purple-500/10 text-purple-400",
  "הושלמה": "bg-green-500/10 text-green-400",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-white">דשבורד</h1>
        <p className="text-sm text-white/40 mt-1">ברוכים הבאים חזרה</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
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
            <p className="text-2xl font-medium text-white mb-1">{stat.value}</p>
            <div className="flex items-center gap-1">
              {stat.trend === "up" ? (
                <ArrowUp size={12} className="text-green-400" />
              ) : (
                <ArrowDown size={12} className="text-red-400" />
              )}
              <span
                className={cn(
                  "text-xs",
                  stat.trend === "up" ? "text-green-400" : "text-red-400"
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-white/20 mr-1">מאתמול</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-charcoal border border-white/5 rounded-lg">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">הזמנות אחרונות</h2>
            <button className="text-xs text-gold/60 hover:text-gold transition-colors">
              כל ההזמנות
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {RECENT_ORDERS.map((order) => (
              <div
                key={order.id}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm text-white/80 font-mono">
                      {order.id}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px]",
                        STATUS_COLORS[order.status]
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    {order.customer} · {order.items} פריטים
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gold font-medium">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-[10px] text-white/20">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-charcoal border border-white/5 rounded-lg">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-medium text-white">
              מוצרים מובילים
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {TOP_PRODUCTS.map((product, i) => (
              <div
                key={product.name}
                className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-xs text-white/20 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {product.sales} מכירות
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {product.trend === "up" ? (
                    <TrendingUp size={12} className="text-green-400" />
                  ) : (
                    <ArrowDown size={12} className="text-red-400" />
                  )}
                  <span className="text-xs text-white/50">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "הוסף מוצר", href: "/admin/products/new", icon: Package },
          { label: "ערוך דף הבית", href: "/admin/homepage", icon: Home },
          { label: "צפה בהזמנות", href: "/admin/orders", icon: ShoppingCart },
          { label: "סטטיסטיקות", href: "/admin/analytics", icon: BarChart3 },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 p-4 bg-charcoal border border-white/5 rounded-lg hover:border-gold/20 hover:bg-gold/[0.02] transition-all group"
          >
            <action.icon
              size={20}
              className="text-white/30 group-hover:text-gold transition-colors"
            />
            <span className="text-sm text-white/60 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
