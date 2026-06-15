"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Loader2, Cake, Crown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Customer {
  email: string;
  name: string;
  phone: string;
  birthday: string | null;
  vipTier: string;
  marketingConsent: boolean;
  registered: boolean;
  orders: number;
  totalSpent: number;
  lastOrder: string;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatBirthday(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
  } catch {
    return iso;
  }
}

function isBirthdayThisMonth(iso: string | null) {
  if (!iso) return false;
  try {
    return new Date(iso).getMonth() === new Date().getMonth();
  } catch {
    return false;
  }
}

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [needsMigration, setNeedsMigration] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/customers");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCustomers((data.customers ?? []).sort((a: Customer, b: Customer) => b.totalSpent - a.totalSpent));
        setNeedsMigration(!!data.needsMigration);
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
  const registeredCount = customers.filter((c) => c.registered).length;
  const birthdaysThisMonth = customers.filter((c) => isBirthdayThisMonth(c.birthday)).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-white">לקוחות</h1>
        <p className="text-sm text-white/40 mt-1">
          {totalCustomers} לקוחות · {registeredCount} רשומים
          {birthdaysThisMonth > 0 && ` · ${birthdaysThisMonth} ימי הולדת החודש`}
          {totalRevenue > 0 && ` · ${formatPrice(totalRevenue)} הכנסות`}
        </p>
      </div>

      {needsMigration && (
        <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold flex items-center gap-2">
          <span>⚙️</span> כדי לראות משתמשים רשומים (לא רק קונים), הריצו את <code className="text-xs">supabase/migrate-profiles.sql</code> ב-Supabase.
        </div>
      )}

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
              {customers.length === 0 ? "אין לקוחות עדיין" : "אין תוצאות לחיפוש"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">לקוח</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">טלפון</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">יום הולדת</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">הזמנות</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">סה&quot;כ</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">אחרונה</th>
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
                    <p className="text-sm text-white/80 flex items-center gap-1.5">
                      {customer.name}
                      {customer.vipTier === "vip" && <Crown size={12} className="text-gold" />}
                      {!customer.registered && (
                        <span className="text-[9px] text-white/25 border border-white/10 rounded px-1">אורח</span>
                      )}
                    </p>
                    <p className="text-[10px] text-white/30">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/40">{customer.phone || "—"}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs flex items-center gap-1 ${isBirthdayThisMonth(customer.birthday) ? "text-gold" : "text-white/40"}`}>
                      {isBirthdayThisMonth(customer.birthday) && <Cake size={12} />}
                      {formatBirthday(customer.birthday)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-white/60">{customer.orders}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gold">{customer.totalSpent > 0 ? formatPrice(customer.totalSpent) : "—"}</span>
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
