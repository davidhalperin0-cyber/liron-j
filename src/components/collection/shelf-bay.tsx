"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { shelfImage } from "@/lib/shelf-images";
import type { ProductCard as ProductCardType } from "@/types";

interface Props {
  product: ProductCardType;
  priority?: boolean;
}

// One compartment of the boutique's walnut shelving: the piece photographed on its suede display,
// and under it, on the shelf edge, its name, price and a quiet add-to-bag.
export function ShelfBay({ product, priority }: Props) {
  const addItem = useCartStore((s) => s.addItem);
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

  return (
    <Link href={`/products/${product.slug}`} className="group block shelf-bay">
      <div className="relative aspect-[640/1158] overflow-hidden bg-[#E9DCCB]">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          // not photographed in the boutique yet: its regular photo on the same suede tone
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        {/* the warm light of the shelf strip catches the piece on hover */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_45%,rgba(255,236,205,.22),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="shelf-edge px-2 pt-3 pb-4 text-center">
        <p className="font-hebrew text-[15px] leading-tight text-white">{name}</p>
        <p className="mt-1 text-[13px] text-gold">{formatPrice(product.price)}</p>
        <button
          onClick={add}
          className={cn(
            "mt-2 inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-[11px] text-white/80",
            "transition-colors hover:bg-gold hover:text-black hover:border-gold"
          )}
        >
          <ShoppingBag size={12} />
          הוספה לסל
        </button>
      </div>
    </Link>
  );
}
