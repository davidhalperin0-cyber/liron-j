"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const MOCK_COLLECTIONS = [
  { id: "1", name: "קולקציית חורף 2026", nameEn: "Winter 2026", slug: "winter-2026", productCount: 18, status: "active", startDate: "2026-01-15", image: "" },
  { id: "2", name: "קולקציית כלות", nameEn: "Bridal Collection", slug: "bridal", productCount: 24, status: "active", startDate: "2025-06-01", image: "" },
  { id: "3", name: "אלגנטיות יומיומית", nameEn: "Everyday Elegance", slug: "everyday-elegance", productCount: 32, status: "active", startDate: "2025-09-01", image: "" },
  { id: "4", name: "מהדורה מוגבלת — זהב ורוד", nameEn: "Limited — Rose Gold", slug: "limited-rose-gold", productCount: 8, status: "active", startDate: "2026-03-01", image: "" },
  { id: "5", name: "קולקציית קיץ 2026", nameEn: "Summer 2026", slug: "summer-2026", productCount: 0, status: "draft", startDate: "2026-06-01", image: "" },
];

export default function CollectionsAdmin() {
  const router = useRouter();
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);
  const [search, setSearch] = useState("");

  const filtered = collections.filter(
    (c) => c.name.includes(search) || c.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold flex items-center gap-2">
        <span className="text-base">🚧</span> עמוד זה בפיתוח — Coming Soon
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">קולקציות</h1>
          <p className="text-sm text-white/40 mt-1">{collections.length} קולקציות</p>
        </div>
        <Button
          variant="gold"
          size="md"
          onClick={() => {
            const name = window.prompt("שם קולקציה חדשה:");
            if (!name) return;
            setCollections((items) => [
              {
                id: `collection-${Date.now()}`,
                name,
                nameEn: name,
                slug: name.toLowerCase().replace(/\s+/g, "-"),
                productCount: 0,
                status: "draft",
                startDate: new Date().toISOString().slice(0, 10),
                image: "",
              },
              ...items,
            ]);
          }}
        >
          <Plus size={16} className="ml-2" />
          קולקציה חדשה
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="חפש קולקציה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-charcoal border border-white/5 rounded-lg overflow-hidden group hover:border-gold/10 transition-colors"
          >
            <div className="aspect-[16/9] bg-smoke relative">
              <div className="absolute inset-0 flex items-center justify-center text-white/10">
                <Package size={32} />
              </div>
              <div className="absolute top-3 left-3">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px]",
                    collection.status === "active"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  )}
                >
                  {collection.status === "active" ? "פעיל" : "טיוטה"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm text-white/80 font-medium">{collection.name}</h3>
              <p className="text-[10px] text-white/30 mt-0.5">{collection.nameEn}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  <span className="flex items-center gap-1">
                    <Package size={10} />
                    {collection.productCount} מוצרים
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {collection.startDate}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => router.push(`/collections/${collection.slug}`)}
                    className="p-1 text-white/30 hover:text-white transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => {
                      const name = window.prompt("שם קולקציה:", collection.name);
                      if (!name) return;
                      setCollections((items) =>
                        items.map((item) =>
                          item.id === collection.id ? { ...item, name } : item
                        )
                      );
                    }}
                    className="p-1 text-white/30 hover:text-white transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (!window.confirm(`למחוק את ${collection.name}?`)) return;
                      setCollections((items) => items.filter((item) => item.id !== collection.id));
                    }}
                    className="p-1 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
