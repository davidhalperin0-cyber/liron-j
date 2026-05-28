"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  products: ProductCardType[];
  heroImage?: string;
}

const MATERIALS = ["14K Gold", "18K Gold", "Silver", "Rose Gold"];
const COLORS = [
  { name: "זהב צהוב", value: "yellow", bg: "bg-yellow-600" },
  { name: "זהב לבן", value: "white", bg: "bg-gray-200" },
  { name: "זהב ורוד", value: "rose", bg: "bg-rose-300" },
  { name: "כסף", value: "silver", bg: "bg-gray-400" },
];
const SORT_OPTIONS = [
  { value: "popular", label: "פופולרי" },
  { value: "newest", label: "חדש ביותר" },
  { value: "price-asc", label: "מחיר: נמוך לגבוה" },
  { value: "price-desc", label: "מחיר: גבוה לנמוך" },
  { value: "trending", label: "טרנדי" },
];

export function CollectionPage({ slug, name, nameEn, description, products: initialProducts, heroImage }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("popular");
  const [activeMaterials, setActiveMaterials] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (activeMaterials.length > 0) {
      result = result.filter((p) => p.material && activeMaterials.includes(p.material));
    }
    if (activeColors.length > 0) {
      result = result.filter((p) => p.color && activeColors.includes(p.color));
    }
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (activeSort) {
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "trending":
        result.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
        break;
    }

    return result;
  }, [activeMaterials, activeColors, priceRange, activeSort]);

  const toggleMaterial = (mat: string) => {
    setActiveMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const toggleColor = (col: string) => {
    setActiveColors((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const hasActiveFilters = activeMaterials.length > 0 || activeColors.length > 0;

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Collection Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {heroImage ? (
          <>
            <img
              src={heroImage}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 to-black" />
        )}
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4"
          >
            {nameEn} / {slug}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl lg:text-7xl text-white mb-4"
          >
            {name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            {description}
          </motion.p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-[60px] z-30 glass border-y border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                filtersOpen ? "text-gold" : "text-white/60 hover:text-white"
              )}
            >
              <SlidersHorizontal size={16} />
              סינון
              {hasActiveFilters && (
                <span className="h-4 w-4 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
                  {activeMaterials.length + activeColors.length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setActiveMaterials([]);
                  setActiveColors([]);
                }}
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                נקה הכל
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30">
              {filteredProducts.length} מוצרים
            </span>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                {SORT_OPTIONS.find((s) => s.value === activeSort)?.label}
                <ChevronDown size={14} className={cn("transition-transform", sortOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full end-0 mt-2 glass rounded-lg py-2 min-w-[160px] z-50"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setActiveSort(option.value);
                          setSortOpen(false);
                        }}
                        className={cn(
                          "block w-full text-right px-4 py-2 text-sm transition-colors",
                          activeSort === option.value
                            ? "text-gold"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters — mobile: bottom sheet, desktop: inline sidebar */}
          <AnimatePresence>
            {filtersOpen && (
              <>
                {/* Mobile overlay backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                  onClick={() => setFiltersOpen(false)}
                />

                {/* Mobile filter sheet */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal rounded-t-2xl max-h-[80vh] overflow-y-auto safe-area-pb lg:hidden"
                >
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-medium text-white">סינון</h2>
                      <button onClick={() => setFiltersOpen(false)} className="p-2 text-white/60 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <X size={20} />
                      </button>
                    </div>
                    {/* Material Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-3 tracking-wider uppercase">חומר</h3>
                      <div className="space-y-1">
                        {MATERIALS.map((mat) => (
                          <button key={mat} onClick={() => toggleMaterial(mat)} className={cn("flex items-center gap-3 w-full py-3 text-sm transition-colors min-h-[44px]", activeMaterials.includes(mat) ? "text-gold" : "text-white/50 hover:text-white")}>
                            <span className={cn("h-5 w-5 border rounded-sm flex items-center justify-center transition-colors", activeMaterials.includes(mat) ? "border-gold bg-gold" : "border-white/20")}>
                              {activeMaterials.includes(mat) && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                            </span>
                            {mat}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Color Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-3 tracking-wider uppercase">צבע</h3>
                      <div className="flex flex-wrap gap-4">
                        {COLORS.map((color) => (
                          <button key={color.value} onClick={() => toggleColor(color.value)} className={cn("w-10 h-10 rounded-full transition-all", color.bg, activeColors.includes(color.value) ? "ring-2 ring-gold ring-offset-2 ring-offset-charcoal scale-110" : "ring-1 ring-white/10 hover:scale-105")} title={color.name} />
                        ))}
                      </div>
                    </div>
                    {/* Price Range */}
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-3 tracking-wider uppercase">טווח מחיר</h3>
                      <input type="range" min={0} max={15000} step={500} value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-gold" />
                      <div className="flex justify-between mt-2 text-xs text-white/40"><span>₪0</span><span>₪{priceRange[1].toLocaleString()}</span></div>
                    </div>
                    {/* Apply button */}
                    <button onClick={() => setFiltersOpen(false)} className="w-full py-3.5 bg-gold text-black rounded-lg font-medium text-sm mt-4">
                      הצג {filteredProducts.length} תוצאות
                    </button>
                  </div>
                </motion.div>

                {/* Desktop inline sidebar */}
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 overflow-hidden hidden lg:block"
                >
                  <div className="w-[260px] space-y-8">
                    {/* Material Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-4 tracking-wider uppercase">חומר</h3>
                      <div className="space-y-2">
                        {MATERIALS.map((mat) => (
                          <button key={mat} onClick={() => toggleMaterial(mat)} className={cn("flex items-center gap-3 w-full py-2 text-sm transition-colors", activeMaterials.includes(mat) ? "text-gold" : "text-white/50 hover:text-white")}>
                            <span className={cn("h-4 w-4 border rounded-sm flex items-center justify-center transition-colors", activeMaterials.includes(mat) ? "border-gold bg-gold" : "border-white/20")}>
                              {activeMaterials.includes(mat) && (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                            </span>
                            {mat}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Color Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-4 tracking-wider uppercase">צבע</h3>
                      <div className="flex flex-wrap gap-3">
                        {COLORS.map((color) => (
                          <button key={color.value} onClick={() => toggleColor(color.value)} className={cn("w-8 h-8 rounded-full transition-all", color.bg, activeColors.includes(color.value) ? "ring-2 ring-gold ring-offset-2 ring-offset-black scale-110" : "ring-1 ring-white/10 hover:scale-105")} title={color.name} />
                        ))}
                      </div>
                    </div>
                    {/* Price Range */}
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-4 tracking-wider uppercase">טווח מחיר</h3>
                      <input type="range" min={0} max={15000} step={500} value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-gold" />
                      <div className="flex justify-between mt-2 text-xs text-white/40"><span>₪0</span><span>₪{priceRange[1].toLocaleString()}</span></div>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            <motion.div
              layout
              className={cn(
                "grid gap-4 sm:gap-6",
                filtersOpen
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2 lg:grid-cols-4"
              )}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                >
                  <ProductCard
                    product={product}
                    size={
                      !filtersOpen && (index === 0 || index === 5) ? "lg" : "md"
                    }
                  />
                </motion.div>
              ))}
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white/40 text-lg mb-2">לא נמצאו מוצרים</p>
                <p className="text-white/20 text-sm">נסו לשנות את הסינון</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
