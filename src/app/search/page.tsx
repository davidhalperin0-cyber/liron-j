"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardType } from "@/types";
import Link from "next/link";

const POPULAR_SEARCHES = ["שרשרת", "עגילים", "צמיד", "מתנה", "רוז גולד", "כסף 925"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardType[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (term: string) => {
    setQuery(term);
    setHasSearched(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                placeholder="חפשי תכשיטים, קולקציות, סגנונות..."
                className="w-full pr-12 pl-12 py-4 bg-charcoal border border-white/5 rounded-lg text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setHasSearched(false); setResults([]); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {!hasSearched ? (
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm text-white/40 mb-4">חיפושים פופולריים</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2 bg-charcoal border border-white/5 rounded-full text-sm text-white/50 hover:text-gold hover:border-gold/20 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-white/40">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      מחפש...
                    </span>
                  ) : results.length > 0
                    ? `${results.length} תוצאות עבור "${query}"`
                    : `לא נמצאו תוצאות עבור "${query}"`}
                </p>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {results.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : !loading ? (
                <div className="text-center py-20">
                  <p className="text-white/30 mb-4">לא מצאנו מה שחיפשת</p>
                  <p className="text-sm text-white/20 mb-6">נסי לחפש במילים אחרות או לעיין בקולקציות שלנו</p>
                  <Link
                    href="/collections/all"
                    className="inline-block px-6 py-2.5 bg-gold text-black text-sm font-medium tracking-wider uppercase hover:bg-gold/90 transition-colors"
                  >
                    לכל הקולקציות
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
