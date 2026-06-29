"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: Props) {
  const pics = images.filter(Boolean);
  const [active, setActive] = useState(0);

  if (pics.length === 0) {
    return <div className="aspect-[3/4] bg-charcoal" />;
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        <Image
          key={pics[active]}
          src={pics[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {pics.length > 1 && (
        <div className="flex gap-3">
          {pics.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={cn(
                "relative w-20 h-24 sm:w-24 sm:h-28 overflow-hidden bg-cream transition-all",
                i === active ? "ring-2 ring-gold" : "opacity-60 hover:opacity-100"
              )}
              aria-label={`תמונה ${i + 1}`}
            >
              <Image src={src} alt={`${name} ${i + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
