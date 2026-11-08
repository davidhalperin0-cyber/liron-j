"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { shelfImage } from "@/lib/shelf-images";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  product: ProductCardType;
  priority?: boolean;
}

// One piece of the boutique: photographed on pale suede in soft daylight, its name and price
// quietly under it, a heart in the corner and an add-to-bag that appears on hover (always on touch).
export function ShelfBay({ product, priority }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const liked = has(product.id);
  const photo = shelfImage(product.slug);
  const name = product.name.he || product.name.en;

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: `${product.id}-${product.variants?.[0]?.id ?? "default"}`,
      product,
      variantId: product.variants?.[0]?.id,
      variantName: product.variants?.[0]?.name,
      quantity: 1,
      price: product.price,
    });
  };

  const like = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block shelf-bay">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#EFE6DA]">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          // not photographed yet: its regular photo on the same suede tone
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-6 mix-blend-multiply transition-transform duration-[1200ms] group-hover:scale-[1.03]"
          />
        )}

        <button
          onClick={like}
          aria-label={liked ? "הסרה מהמועדפים" : "הוספה למועדפים"}
          aria-pressed={liked}
          style={{ minHeight: 40 }}
          className="absolute top-1 end-1 grid h-10 w-10 place-items-center rounded-full text-[#6B5A45] transition-colors hover:text-[#9A7B3C]"
        >
          <Heart size={17} strokeWidth={1.3} className={cn(liked && "fill-[#B08D57] text-[#B08D57]")} />
        </button>

        {/* phone: a small round bag in the corner; desktop: a quiet pill that rises on hover */}
        <button
          onClick={add}
          aria-label="הוספה לסל"
          style={{ minHeight: 40 }}
          className={cn(
            "absolute bottom-2 start-2 grid h-10 w-10 place-items-center rounded-full",
            "bg-[rgba(251,248,243,.88)] text-[#3A2E22] backdrop-blur-sm transition-all duration-300",
            "hover:bg-[#3A2E22] hover:text-[#FBF8F3]",
            "sm:inset-x-3 sm:bottom-3 sm:flex sm:items-center sm:justify-center sm:h-auto sm:w-auto sm:min-h-[38px] sm:gap-1.5 sm:text-[12px] sm:tracking-wide",
            "sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          )}
        >
          <ShoppingBag size={14} strokeWidth={1.4} />
          <span className="hidden sm:inline">הוספה לסל</span>
        </button>
      </div>
      <div className="px-1 pt-3 pb-2 text-center">
        <p className="font-hebrew text-[14px] leading-snug text-white/85">{name}</p>
        <p className="mt-1 text-[13px] tracking-wide text-white/55">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
