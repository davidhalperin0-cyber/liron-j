"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Home,
  Star,
  Settings,
  BarChart3,
  Tags,
  Megaphone,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "דשבורד", href: "/admin", icon: LayoutDashboard },
  { label: "מוצרים", href: "/admin/products", icon: Package },
  { label: "קטגוריות", href: "/admin/categories", icon: Tags },
  { label: "קולקציות", href: "/admin/collections", icon: FolderOpen },
  { label: "קמפיינים", href: "/admin/campaigns", icon: Megaphone },
  { label: "הזמנות", href: "/admin/orders", icon: ShoppingCart },
  { label: "לקוחות", href: "/admin/customers", icon: Users },
  { label: "דף הבית", href: "/admin/homepage", icon: Home },
  { label: "המלצות", href: "/admin/recommendations", icon: Star },
  { label: "אנליטיקס", href: "/admin/analytics", icon: BarChart3 },
  { label: "הגדרות", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-64 bg-charcoal border-l border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <h1 className="font-display text-xl tracking-[0.2em] uppercase text-gradient-gold">
          Liron J
        </h1>
        <p className="text-[10px] text-white/30 tracking-widest uppercase mt-1">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-sm transition-colors",
                isActive
                  ? "text-gold bg-gold/5 border-l-2 border-gold"
                  : "text-white/50 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Store */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-white/30 hover:text-gold transition-colors"
        >
          <ArrowLeft size={14} />
          חזרה לחנות
        </Link>
      </div>
    </aside>
  );
}
