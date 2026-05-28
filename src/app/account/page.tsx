"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ShoppingCart, Heart, MapPin, Settings, LogOut, Crown, Package, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { formatPrice } from "@/lib/utils";
import { notifyAction, notifyError } from "@/lib/ui-actions";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

interface UserOrder {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  items: { productName: string; quantity: number }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "ממתינה", color: "bg-blue-500/10 text-blue-400" },
  confirmed: { label: "אושרה", color: "bg-cyan-500/10 text-cyan-400" },
  processing: { label: "בטיפול", color: "bg-yellow-500/10 text-yellow-400" },
  shipped: { label: "נשלחה", color: "bg-purple-500/10 text-purple-400" },
  delivered: { label: "הושלמה", color: "bg-green-500/10 text-green-400" },
  cancelled: { label: "בוטלה", color: "bg-red-500/10 text-red-400" },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatMemberSince(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("he-IL", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

const MENU_ITEMS = [
  { label: "המועדפים שלי", icon: Heart, href: "/wishlist" },
  { label: "הקולקציות", icon: ShoppingCart, href: "/collections" },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        const [userRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/orders/my"),
        ]);

        if (!userRes.ok) {
          // Not authenticated — redirect to login
          router.push("/auth/login?redirect=/account");
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders ?? []);
        }
      } catch {
        router.push("/auth/login?redirect=/account");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      notifyAction("התנתקת בהצלחה");
      router.push("/auth/login");
    } catch {
      notifyError("שגיאה בהתנתקות");
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <CartDrawer />
        <div className="flex items-center justify-center pt-40 pb-20">
          <Loader2 size={28} className="animate-spin text-gold/40" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null; // redirect happening

  const displayName = user.name || user.email.split("@")[0];
  const totalOrders = orders.length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Profile */}
              <div className="bg-charcoal border border-white/5 rounded-lg p-5 text-center">
                <div className="w-16 h-16 rounded-full bg-smoke mx-auto flex items-center justify-center mb-3">
                  <User size={24} className="text-white/30" />
                </div>
                <h2 className="text-sm text-white/80 font-medium">{displayName}</h2>
                <p className="text-[10px] text-white/30 mt-0.5">{user.email}</p>
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] bg-gold/10 text-gold">
                    <Crown size={10} />
                    אדמין
                  </span>
                )}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-lg font-medium text-white">{totalOrders}</p>
                    <p className="text-[10px] text-white/30">הזמנות</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gold">{formatPrice(totalSpent)}</p>
                    <p className="text-[10px] text-white/30">סה&quot;כ</p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="bg-charcoal border border-white/5 rounded-lg overflow-hidden">
                {MENU_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0"
                  >
                    <item.icon size={16} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ))}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-gold/50 hover:text-gold hover:bg-gold/5 transition-colors border-b border-white/5"
                  >
                    <Settings size={16} />
                    <span className="flex-1">ניהול</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 px-5 py-3.5 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full disabled:opacity-40"
                >
                  {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  התנתקות
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-white">שלום, {displayName.split(" ")[0]}</h1>
                {user.createdAt && (
                  <p className="text-sm text-white/40 mt-1">
                    חברה מאז {formatMemberSince(user.createdAt)}
                  </p>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bg-charcoal border border-white/5 rounded-lg">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-white">הזמנות אחרונות</h2>
                  {totalOrders > 5 && (
                    <span className="text-xs text-white/20">{totalOrders} הזמנות</span>
                  )}
                </div>

                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={28} className="text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">אין הזמנות עדיין</p>
                    <Link
                      href="/collections"
                      className="inline-block mt-3 text-xs text-gold/60 hover:text-gold transition-colors"
                    >
                      גלי את הקולקציות שלנו
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentOrders.map((order) => {
                      const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                      const itemCount = Array.isArray(order.items) ? order.items.length : 0;

                      return (
                        <div
                          key={order.id}
                          className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="w-10 h-10 bg-smoke rounded-sm flex items-center justify-center">
                            <Package size={16} className="text-white/20" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white/70 font-mono">{order.order_number}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/30">
                              {formatDate(order.created_at)} · {itemCount} פריטים
                            </p>
                          </div>
                          <span className="text-sm text-gold">{formatPrice(order.total)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/wishlist"
                  className="bg-charcoal border border-white/5 rounded-lg p-5 hover:border-gold/10 transition-colors group"
                >
                  <Heart size={20} className="text-white/20 group-hover:text-gold transition-colors mb-3" />
                  <h3 className="text-sm text-white/70">המועדפים שלי</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">צפי בפריטים ששמרת</p>
                </Link>
                <Link
                  href="/collections"
                  className="bg-charcoal border border-white/5 rounded-lg p-5 hover:border-gold/10 transition-colors group"
                >
                  <ShoppingCart size={20} className="text-white/20 group-hover:text-gold transition-colors mb-3" />
                  <h3 className="text-sm text-white/70">המשיכי לקנות</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">גלי את הקולקציות החדשות</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
