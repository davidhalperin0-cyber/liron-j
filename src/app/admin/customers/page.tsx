"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface Order {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
}

interface Customer {
  email: string;
  name: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const orders: Order[] = data.orders ?? [];

        // Aggregate customers from orders
        const map = new Map<string, Customer>();
        for (const order of orders) {
          if (order.status === "cancelled") continue;
          const key = order.customer_email;
          const existing = map.get(key);
          if (existing) {
            existing.orders += 1;
            existing.totalSpent += order.total;
            if (order.created_at > existing.lastOrder) {
              existing.lastOrder = order.created_at;
              existing.name = order.customer_name;
              existing.phone = order.customer_phone;
            }
          } else {
            map.set(key, {
              email: order.customer_email,
              name: order.customer_name,
              phone: order.customer_phone,
              orders: 1,
              totalSpent: order.total,
              lastOrder: order.created_at,
            });
          }
        }

        const sorted = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
        setCustomers(sorted);
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.includes(search) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-white">לקוחות</h1>
        <p className="text-sm text-white/40 mt-1">
          {totalCustomers} לקוחות {totalRevenue > 0 && `· ${formatPrice(totalRevenue)} הכנסות`}
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="חפש לפי שם, אימייל, טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
        />
      </div>

      <div className="bg-charcoal border border-white/5 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gold/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">
              {customers.length === 0 ? "אין לקוחות עדיין — לקוחות ייווצרו אוטומטית מהזמנות" : "אין תוצאות לחיפוש"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">לקוח</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">טלפון</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">הזמנות</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">סה&quot;כ</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">הזמנה אחרונה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((customer) => (
                <motion.tr
                  key={customer.email}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-white/80">{customer.name}</p>
                    <p className="text-[10px] text-white/30">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/40">{customer.phone || "—"}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-white/60">{customer.orders}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gold">{formatPrice(customer.totalSpent)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/40">{formatDate(customer.lastOrder)}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
