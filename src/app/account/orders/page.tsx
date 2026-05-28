"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  items: { name: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "ממתינה",
  confirmed: "אושרה",
  processing: "בטיפול",
  shipped: "נשלחה",
  delivered: "הושלמה",
  cancelled: "בוטלה",
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/my")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />
      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl text-white mb-8">ההזמנות שלי</h1>

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gold/50" />
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/30">אין הזמנות עדיין</p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-charcoal border border-white/5 rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 font-mono">{order.order_number}</p>
                    <p className="text-xs text-white/30">
                      {new Date(order.created_at).toLocaleDateString("he-IL")} · {Array.isArray(order.items) ? order.items.length : 0} פריטים
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-white/35">{STATUS_LABELS[order.status] ?? order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
