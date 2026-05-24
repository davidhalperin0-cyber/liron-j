"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import Link from "next/link";

const NAV_ITEMS = [
  {
    label: "תכשיטים",
    labelEn: "Jewelry",
    href: "/collections",
    children: [
      { label: "טבעות", labelEn: "Rings", href: "/collections/rings" },
      { label: "עגילים", labelEn: "Earrings", href: "/collections/earrings" },
      { label: "שרשראות", labelEn: "Necklaces", href: "/collections/necklaces" },
      { label: "צמידים", labelEn: "Bracelets", href: "/collections/bracelets" },
      { label: "פירסינג", labelEn: "Piercings", href: "/collections/piercings" },
    ],
  },
  {
    label: "קולקציות",
    labelEn: "Collections",
    href: "/collections/all",
    children: [
      { label: "חדש", labelEn: "New In", href: "/collections/new" },
      { label: "בסט סלרס", labelEn: "Best Sellers", href: "/collections/bestsellers" },
      { label: "מהדורה מוגבלת", labelEn: "Limited Edition", href: "/collections/limited" },
    ],
  },
  { label: "אודות", labelEn: "About", href: "/about" },
  { label: "צור קשר", labelEn: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const cartItemCount = useCartStore((s) => s.items.length);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openCart = useCartStore((s) => s.open);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "glass py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-gold transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-sm tracking-widest uppercase text-white/80 hover:text-gold transition-colors duration-300"
                  >
                    {item.label}
                    {item.children && <ChevronDown size={14} className="opacity-50" />}
                  </Link>

                  {item.children && (
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 pt-4"
                        >
                          <div className="glass rounded-lg py-3 min-w-[200px]">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block px-5 py-2.5 text-sm text-white/70 hover:text-gold hover:bg-white/5 transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <motion.h1
                className="font-display text-2xl sm:text-3xl tracking-[0.3em] uppercase text-gradient-gold"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                Liron J
              </motion.h1>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                className="p-2 text-white/80 hover:text-gold transition-colors hidden sm:block"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <button
                className="p-2 text-white/80 hover:text-gold transition-colors hidden sm:block"
                aria-label="Account"
              >
                <User size={20} />
              </button>

              <Link
                href="/wishlist"
                className="relative p-2 text-white/80 hover:text-gold transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 h-4 w-4 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 text-white/80 hover:text-gold transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 h-4 w-4 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute top-0 left-0 bottom-0 w-[300px] bg-charcoal pt-20 px-6 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <div key={item.href} className="border-b border-white/5">
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 text-lg tracking-wider text-white/90 hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pr-4 pb-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 text-sm text-white/50 hover:text-gold transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-8 flex gap-6">
                <button className="text-white/60 hover:text-gold transition-colors">
                  <Search size={22} />
                </button>
                <button className="text-white/60 hover:text-gold transition-colors">
                  <User size={22} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
