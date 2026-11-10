"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, X, Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { shelfImage } from "@/lib/shelf-images";
import type { ProductCard as ProductCardType } from "@/types";

const HE_CAT: Record<string, string> = {
  necklaces: "שרשרת",
  rings: "טבעת",
  bracelets: "צמיד",
  earrings: "עגילים",
  pendants: "תליון",
};

interface Props {
  products: ProductCardType[];
  index: number | null;
  onIndex: (i: number | null) => void;
}

// Stepping into one cell of the vitrine: the piece grows out of its place in the grid to fill
// the view, with its details beside it, and the neighbours one tap (or swipe) away.
export function VitrineView({ products, index, onIndex }: Props) {
  const open = index !== null;
  const p = open ? products[index] : null;
  const addItem = useCartStore((s) => s.addItem);
  const [variant, setVariant] = useState(0);
  const [added, setAdded] = useState(false);
  const [dir, setDir] = useState(0);

  const go = (step: number) => {
    if (index === null) return;
    setDir(step);
    setVariant(0);
    setAdded(false);
    onIndex((index + step + products.length) % products.length);
  };
  const close = () => onIndex(null);

  // keyboard + no page scroll behind the view
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // RTL: the left arrow moves forward
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  const add = () => {
    if (!p) return;
    const v = p.variants?.[variant];
    addItem({
      id: `${p.id}-${v?.id ?? "default"}`,
      product: p,
      variantId: v?.id,
      variantName: v?.name,
      quantity: 1,
      price: p.price,
    });
    setAdded(true);
  };

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          key="vitrine"
          role="dialog"
          aria-modal="true"
          aria-label={p.name.he || p.name.en}
          className="fixed inset-0 z-[70] overflow-y-auto bg-[rgba(247,243,236,.98)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="סגירה"
            style={{ minHeight: 44 }}
            className="fixed top-4 end-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-[rgba(251,248,243,.9)] text-[#3A2E22] shadow-[0_1px_8px_rgba(58,46,34,.12)] hover:bg-[#3A2E22] hover:text-[#FBF8F3] transition-colors"
          >
            <X size={18} strokeWidth={1.4} />
          </button>

          <div
            className="mx-auto grid min-h-full max-w-[1180px] items-center gap-4 sm:gap-6 px-4 pt-14 sm:pt-16 pb-28 sm:pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* the piece, grown out of its cell */}
            <motion.div
              layoutId={`cell-${p.id}`}
              className="relative mx-auto aspect-[4/5] w-full max-w-[min(520px,34vh)] sm:max-w-[min(520px,42vh)] overflow-hidden rounded-[2px] bg-[#EFE6DA] lg:max-w-none"
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
            >
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={p.id}
                  className="absolute inset-0"
                  custom={dir}
                  initial={{ opacity: 0, x: dir * -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * 40 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    // RTL: a swipe to the right brings the next piece
                    if (info.offset.x > 70) go(1);
                    else if (info.offset.x < -70) go(-1);
                  }}
                >
                  <Image
                    src={shelfImage(p.slug) ?? p.image}
                    alt={p.name.he || p.name.en}
                    fill
                    priority
                    draggable={false}
                    sizes="(max-width: 1024px) 92vw, 560px"
                    className={cn(shelfImage(p.slug) ? "object-cover" : "object-contain p-10 mix-blend-multiply")}
                  />
                  {/* the light of the cell */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_38%_at_50%_0%,rgba(255,238,208,.35),transparent_70%)]" />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* its card */}
            <motion.div
              key={`info-${p.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[520px] text-center lg:text-start"
            >
              <p className="text-[11px] tracking-[0.35em] text-[#9A7B3C]">
                <span dir="ltr">
                  {String((index ?? 0) + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                </span>
              </p>
              <h2 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                {p.name.he || p.name.en}
              </h2>
              {(p.tagline || p.category) && (
                <p className="mt-2 text-[15px] text-white/55">
                  {[p.category && HE_CAT[p.category], p.tagline].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="mt-4 text-2xl tracking-wide text-white/85">{formatPrice(p.price)}</p>

              {p.variants && p.variants.length > 1 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {p.variants.map((v, vi) => (
                    <button
                      key={v.id}
                      onClick={() => setVariant(vi)}
                      className={cn(
                        "min-h-[40px] rounded-full border px-4 text-[13px] transition-colors",
                        vi === variant
                          ? "border-[#3A2E22] bg-[#3A2E22] text-[#FBF8F3]"
                          : "border-[#3A2E22]/20 text-white/70 hover:border-[#3A2E22]/50"
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}

              {/* buy here, or step out to the piece's full card */}
              <div className="mt-5 flex gap-2 sm:gap-3 sm:justify-center lg:justify-start">
                <button
                  onClick={add}
                  className={cn(
                    "inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full text-[14px] tracking-wide transition-colors sm:flex-none sm:px-10",
                    added ? "bg-[#B08D57] text-[#FBF8F3]" : "bg-[#3A2E22] text-[#FBF8F3] hover:bg-[#B08D57]"
                  )}
                >
                  {added ? <Check size={16} strokeWidth={1.6} /> : <ShoppingBag size={16} strokeWidth={1.4} />}
                  {added ? "נוסף לסל" : "הוספה לסל"}
                </button>
                <Link
                  href={`/products/${p.slug}`}
                  className="inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full border border-[#3A2E22]/25 text-[14px] tracking-wide text-white/80 transition-colors hover:border-[#3A2E22] hover:bg-[#3A2E22] hover:text-[#FBF8F3] sm:flex-none sm:px-8"
                >
                  לכרטיס המלא
                  <ArrowLeft size={15} strokeWidth={1.4} />
                </Link>
              </div>
              <div className="mx-auto mt-7 h-px w-16 bg-[#B08D57]/50 lg:mx-0" />

              <dl className="mt-6 space-y-2 text-[14px] text-white/65">
                {p.material && (
                  <div className="flex justify-center gap-3 lg:justify-start">
                    <dt className="text-white/40">חומר</dt>
                    <dd>{p.material}</dd>
                  </div>
                )}
                <div className="flex justify-center gap-3 lg:justify-start">
                  <dt className="text-white/40">אריזה</dt>
                  <dd>אריזת מתנה וכרטיס ברכה, בלי תוספת</dd>
                </div>
              </dl>

            </motion.div>
          </div>

          {/* previous / next, like walking along the vitrine */}
          <div
            className="fixed inset-x-0 bottom-4 z-10 mx-auto flex w-max items-center gap-1 rounded-full bg-[rgba(251,248,243,.92)] p-1 shadow-[0_2px_14px_rgba(58,46,34,.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => go(-1)}
              style={{ minHeight: 44 }}
              className="inline-flex items-center gap-1 rounded-full px-4 text-[13px] text-white/75 hover:bg-[#3A2E22] hover:text-[#FBF8F3] transition-colors"
            >
              <ChevronRight size={15} strokeWidth={1.4} /> הקודם
            </button>
            <span className="h-5 w-px bg-[#3A2E22]/15" />
            <button
              onClick={() => go(1)}
              style={{ minHeight: 44 }}
              className="inline-flex items-center gap-1 rounded-full px-4 text-[13px] text-white/75 hover:bg-[#3A2E22] hover:text-[#FBF8F3] transition-colors"
            >
              הבא <ChevronLeft size={15} strokeWidth={1.4} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
