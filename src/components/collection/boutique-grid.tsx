"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ShelfBay } from "@/components/collection/shelf-bay";
import type { ProductCard as ProductCardType } from "@/types";

// Moments from a LUZ day, set between the pieces like the pages of a lookbook.
const MOMENTS = [
  { src: "/images/editorial/morning.webp", eyebrow: "07:30 · Morning", line: "קפה ראשון, צמיד אחד", cta: "לצמידים", href: "/collections/bracelets?gender=women", pos: "50% 60%" },
  { src: "/images/editorial/earring.webp", eyebrow: "Everyday Elegance", line: "קטנים, ומדברים בשקט", cta: "לעגילים", href: "/collections/earrings?gender=women", pos: "50% 55%" },
  { src: "/images/editorial/afternoon.webp", eyebrow: "16:00 · Golden hour", line: "האור של אחר הצהריים", cta: "לכל הקולקציה", href: "/collections/women", pos: "50% 50%" },
  { src: "/images/editorial/scarf.webp", eyebrow: "Jewelry for every moment", line: "כל יום, כל רגע", cta: "לעגילים", href: "/collections/earrings?gender=women", pos: "50% 45%" },
];

// after this many pieces comes a moment; few pieces (a filtered view) stay a plain grid
const EVERY = 8;

interface Props {
  products: ProductCardType[];
  className?: string;
}

export function BoutiqueGrid({ products, className }: Props) {
  const showMoments = products.length >= EVERY + 4;
  return (
    // dense: on 3- and 4-column widths a wide moment would otherwise leave a hole at a row end
    <div className={cn("shelf-unit grid grid-flow-row-dense", className)}>
      {products.map((p, i) => {
        const slot = (i + 1) / EVERY;
        const m = showMoments && Number.isInteger(slot) && i < products.length - 2 ? MOMENTS[(slot - 1) % MOMENTS.length] : null;
        return (
          <Fragment key={p.id}>
            <ShelfBay product={p} priority={i < 5} />
            {m && (
              <Link
                href={m.href}
                className="group relative col-span-2 block overflow-hidden rounded-[2px] bg-[#E9DFD2]"
                // inline: the global coarse-pointer rule (a { min-height: 44px }) is unlayered and beats a utility class
                style={{ minHeight: 280 }}
              >
                <Image
                  src={m.src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  style={{ objectPosition: m.pos }}
                  className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(40,28,18,.55),rgba(40,28,18,0)_55%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-[rgba(251,248,243,.95)]">
                  <p dir="ltr" className="text-[10px] uppercase tracking-[0.35em] opacity-80 text-right">{m.eyebrow}</p>
                  <p className="mt-2 font-display text-2xl sm:text-3xl leading-tight">{m.line}</p>
                  <span className="mt-3 inline-block border-b border-current/60 pb-0.5 text-[12px] tracking-wide">
                    {m.cta}
                  </span>
                </div>
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
