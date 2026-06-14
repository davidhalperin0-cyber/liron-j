"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, GripVertical, Sparkles } from "lucide-react";
import { ProductImageStudio } from "@/components/admin/product-image-studio";

interface ImageUploaderProps {
  productSlug: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  productSlug,
  images,
  onChange,
  maxImages = 8,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        setError(`ניתן להעלות עד ${maxImages} תמונות`);
        return;
      }

      const toUpload = fileArray.slice(0, remaining);
      setUploading(true);
      setError(null);

      const newUrls: string[] = [];

      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productSlug", productSlug);

        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error ?? "Upload failed");
          }

          const data = await res.json();
          newUrls.push(data.publicUrl);
        } catch (err) {
          setError(err instanceof Error ? err.message : "שגיאה בהעלאה");
          break;
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
      setUploading(false);
    },
    [images, maxImages, onChange, productSlug]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const removeImage = useCallback(
    async (index: number) => {
      const url = images[index];
      const updated = images.filter((_, i) => i !== index);
      onChange(updated);

      // Try to delete from Supabase Storage (fire-and-forget)
      // Extract storage path from public URL
      const pathMatch = url.match(/\/product-images\/(.+)$/);
      if (pathMatch) {
        fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pathMatch[1] }),
        }).catch(() => {});
      }
    },
    [images, onChange]
  );

  const moveImage = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= images.length) return;
      const updated = [...images];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      onChange(updated);
    },
    [images, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20"
            >
              <img
                src={url}
                alt={`תמונה ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                  className="p-1.5 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white"
                  title="הזז שמאלה"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 rounded bg-red-500/80 hover:bg-red-500 text-white"
                  title="הסר תמונה"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Primary badge */}
              {index === 0 && (
                <span className="absolute top-1 right-1 text-[10px] bg-[#B89B5E] text-black px-1.5 py-0.5 rounded font-medium">
                  ראשית
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver ? "border-[#B89B5E] bg-[#B89B5E]/5" : "border-white/20 hover:border-white/40"}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-white/60">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">מעלה...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/60">
              <Upload className="w-6 h-6" />
              <span className="text-sm">גררי תמונות לכאן או לחצי לבחירה</span>
              <span className="text-xs text-white/40">
                JPG, PNG, WebP, AVIF • עד 10MB • {images.length}/{maxImages}
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* AI Studio — free in-browser background removal + ivory backdrop */}
      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => setStudioOpen(true)}
          className="inline-flex items-center gap-2 text-xs text-[#B89B5E]/90 hover:text-[#B89B5E] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          עיבוד סטודיו — רקע לבן + שיפור (חינם)
        </button>
      )}

      {studioOpen && (
        <ProductImageStudio
          productSlug={productSlug}
          onResult={(url) => onChange([...images, url])}
          onClose={() => setStudioOpen(false)}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
