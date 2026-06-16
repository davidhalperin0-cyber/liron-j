"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Package, Truck, CheckCircle, Clock, XCircle, X, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import { Button } from "@/components/ui/button";

interface OrderItem {
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode?: string;
  country: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "ממתינה", color: "bg-blue-500/10 text-blue-400", icon: Clock },
  confirmed: { label: "אושרה", color: "bg-cyan-500/10 text-cyan-400", icon: CheckCircle },
  processing: { label: "בטיפול", color: "bg-yellow-500/10 text-yellow-400", icon: Package },
  shipped: { label: "נשלחה", color: "bg-purple-500/10 text-purple-400", icon: Truck },
  delivered: { label: "הושלמה", color: "bg-green-500/10 text-green-400", icon: CheckCircle },
  cancelled: { label: "בוטלה", color: "bg-red-500/10 text-red-400", icon: XCircle },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  paid: { label: "שולם", color: "text-green-400" },
  pending: { label: "ממתין", color: "text-yellow-400" },
  failed: { label: "נכשל", color: "text-red-400" },
  refunded: { label: "הוחזר", color: "text-red-400" },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("טוען הזמנות...");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setOrders(data.orders ?? []);
      setDbStatus(data.orders?.length > 0 ? `${data.orders.length} הזמנות מ-Supabase` : "אין הזמנות עדיין");
    } catch {
      setOrders([]);
      setDbStatus("Supabase לא זמין");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      notifyAction(`סטטוס עודכן ל-${STATUS_MAP[newStatus]?.label ?? newStatus}`);
    } catch {
      notifyError("שגיאה בעדכון סטטוס");
    } finally {
      setUpdatingStatus(false);
    }
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.includes(search) ||
      o.customer_email.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">הזמנות</h1>
          <p className="text-sm text-white/40 mt-1">
            {orders.length} הזמנות {totalRevenue > 0 && `· ${formatPrice(totalRevenue)} הכנסות`}
          </p>
          <p className="text-xs text-gold/60 mt-1">{dbStatus}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_MAP).map(([key, val]) => {
          const count = orders.filter((o) => o.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className={cn(
                "p-3 rounded-lg border text-right transition-colors",
                statusFilter === key ? "border-gold/30 bg-gold/5" : "border-white/5 bg-charcoal hover:border-white/10"
              )}
            >
              <p className="text-lg font-medium text-white">{count}</p>
              <p className="text-[10px] text-white/40">{val.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="חפש לפי מספר הזמנה, לקוח, אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-charcoal border border-white/5 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gold/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">
              {orders.length === 0 ? "אין הזמנות עדיין" : "אין תוצאות לסינון הנוכחי"}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">הזמנה</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">לקוח</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">תאריך</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">סכום</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">תשלום</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">סטטוס</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((order) => {
                const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                const paymentInfo = PAYMENT_MAP[order.payment_status] ?? PAYMENT_MAP.pending;
                const StatusIcon = statusInfo.icon;
                const itemCount = Array.isArray(order.items) ? order.items.length : 0;

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-white/80 font-mono">{order.order_number}</span>
                      <p className="text-[10px] text-white/20">{itemCount} פריטים</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-white/70">{order.customer_name}</p>
                      <p className="text-[10px] text-white/20">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-white/40">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gold">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-xs", paymentInfo.color)}>
                        {paymentInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1", statusInfo.color)}>
                        <StatusIcon size={10} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <button className="p-1 text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100">
                        <Eye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg border border-gold/10 bg-charcoal shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 sticky top-0 bg-charcoal z-10">
              <div>
                <h2 className="text-lg font-medium text-white font-mono">{selectedOrder.order_number}</h2>
                <p className="text-xs text-white/30">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <h3 className="text-xs text-white/30 tracking-wider uppercase mb-3">פרטי לקוח</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">שם</p>
                    <p className="text-white/80">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">אימייל</p>
                    <p className="text-white/80">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">טלפון</p>
                    <p className="text-white/80">{selectedOrder.customer_phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">כתובת</p>
                    <p className="text-white/80">
                      {(selectedOrder.shipping_address as ShippingAddress)?.address ?? "—"},{" "}
                      {(selectedOrder.shipping_address as ShippingAddress)?.city ?? ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs text-white/30 tracking-wider uppercase mb-3">פריטים</h3>
                <div className="space-y-2">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items as OrderItem[] : []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm text-white/80">{item.productName}</p>
                        {item.variantName && <p className="text-[10px] text-white/30">{item.variantName}</p>}
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gold">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-[10px] text-white/30">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-white/5 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>סכום ביניים</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>משלוח</span>
                  <span>{selectedOrder.shipping_cost === 0 ? "חינם" : formatPrice(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-white font-medium pt-2 border-t border-white/5">
                  <span>סה&quot;כ</span>
                  <span className="text-gold text-lg">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-xs text-white/30 tracking-wider uppercase mb-3">עדכון סטטוס</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <Button
                      key={key}
                      variant={selectedOrder.status === key ? "gold" : "ghost"}
                      size="sm"
                      loading={updatingStatus && selectedOrder.status !== key}
                      onClick={() => {
                        if (key !== selectedOrder.status) {
                          updateOrderStatus(selectedOrder.id, key);
                        }
                      }}
                    >
                      {val.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
