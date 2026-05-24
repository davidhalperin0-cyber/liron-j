"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

const MOCK_PRODUCTS = [
  { id: "1", name: "טבעת יהלום סלסטיאל", nameEn: "Celestial Diamond Ring", sku: "LJ-R-001", price: 6800, stock: 12, status: "active", category: "טבעות", image: "" },
  { id: "2", name: "עגילי חישוק יהלומים", nameEn: "Diamond Huggie Earrings", sku: "LJ-E-001", price: 4500, stock: 8, status: "active", category: "עגילים", image: "" },
  { id: "3", name: "שרשרת כוכב הצפון", nameEn: "North Star Necklace", sku: "LJ-N-001", price: 3900, stock: 15, status: "active", category: "שרשראות", image: "" },
  { id: "4", name: "צמיד אינפיניטי", nameEn: "Infinity Cuff", sku: "LJ-B-001", price: 5100, stock: 3, status: "active", category: "צמידים", image: "" },
  { id: "5", name: "טבעת נצח", nameEn: "Eternity Band", sku: "LJ-R-002", price: 5200, stock: 0, status: "draft", category: "טבעות", image: "" },
  { id: "6", name: "עגילי קסקייד", nameEn: "Cascade Earrings", sku: "LJ-E-002", price: 3400, stock: 20, status: "active", category: "עגילים", image: "" },
  { id: "7", name: "תליון לונה", nameEn: "Luna Pendant", sku: "LJ-N-002", price: 4200, stock: 6, status: "active", category: "שרשראות", image: "" },
  { id: "8", name: "טבעת כתר", nameEn: "Crown Ring", sku: "LJ-R-003", price: 7200, stock: 4, status: "archived", category: "טבעות", image: "" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "פעיל", color: "bg-green-500/10 text-green-400" },
  draft: { label: "טיוטה", color: "bg-yellow-500/10 text-yellow-400" },
  archived: { label: "ארכיון", color: "bg-white/5 text-white/30" },
};

export default function ProductsAdmin() {
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.includes(search) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">מוצרים</h1>
          <p className="text-sm text-white/40 mt-1">
            {MOCK_PRODUCTS.length} מוצרים סה&quot;כ
          </p>
        </div>
        <Button variant="gold" size="md">
          <Plus size={16} className="ml-2" />
          הוסף מוצר
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="חפש מוצר לפי שם, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white/50 hover:text-white hover:border-white/10 transition-colors">
          <Filter size={14} />
          סינון
        </button>
      </div>

      {/* Table */}
      <div className="bg-charcoal border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                מוצר
              </th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                SKU
              </th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                מחיר
              </th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                מלאי
              </th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                סטטוס
              </th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                קטגוריה
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((product) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-smoke rounded-sm shrink-0" />
                    <div>
                      <p className="text-sm text-white/80">{product.name}</p>
                      <p className="text-[10px] text-white/30">
                        {product.nameEn}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-white/40 font-mono">
                    {product.sku}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-gold">
                    {formatPrice(product.price)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "text-sm",
                      product.stock === 0
                        ? "text-red-400"
                        : product.stock <= 5
                        ? "text-yellow-400"
                        : "text-white/60"
                    )}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px]",
                      STATUS_MAP[product.status].color
                    )}
                  >
                    {STATUS_MAP[product.status].label}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-white/40">
                    {product.category}
                  </span>
                </td>
                <td className="px-3 py-3.5 relative">
                  <button
                    onClick={() =>
                      setActiveMenu(
                        activeMenu === product.id ? null : product.id
                      )
                    }
                    className="p-1 text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {activeMenu === product.id && (
                    <div className="absolute left-0 top-full mt-1 bg-smoke border border-white/10 rounded-lg py-1 min-w-[140px] z-50 shadow-xl">
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Edit size={12} />
                        ערוך
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Eye size={12} />
                        צפה
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Copy size={12} />
                        שכפל
                      </button>
                      <div className="border-t border-white/5 my-1" />
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={12} />
                        מחק
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
