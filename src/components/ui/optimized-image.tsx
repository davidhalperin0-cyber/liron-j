"use client";

import { useState } from "react";
import { getOptimizedUrl } from "@/lib/supabase/storage";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Optimized image component that uses Supabase Image Transformation
 * for CDN-level resizing and format conversion.
 * Falls back gracefully for non-Supabase URLs.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  className = "",
  priority = false,
  sizes,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Only apply Supabase transformations to Supabase Storage URLs
  const isSupabaseUrl = src.includes("/storage/v1/object/public/");

  const optimizedSrc = isSupabaseUrl
    ? getOptimizedUrl(src, { width, height, quality, format: "webp" })
    : src;

  // Generate srcSet for responsive images (only for Supabase URLs)
  const srcSet = isSupabaseUrl && width
    ? [
        `${getOptimizedUrl(src, { width: Math.round(width * 0.5), quality, format: "webp" })} ${Math.round(width * 0.5)}w`,
        `${getOptimizedUrl(src, { width, quality, format: "webp" })} ${width}w`,
        `${getOptimizedUrl(src, { width: Math.round(width * 1.5), quality, format: "webp" })} ${Math.round(width * 1.5)}w`,
      ].join(", ")
    : undefined;

  if (error) {
    return (
      <div
        className={`bg-neutral-900 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-white/30 text-xs">אין תמונה</span>
      </div>
    );
  }

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={`
        transition-opacity duration-300
        ${loaded ? "opacity-100" : "opacity-0"}
        ${className}
      `}
    />
  );
}
