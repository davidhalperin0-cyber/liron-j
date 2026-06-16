"use client";

import { useState, useCallback } from "react";
import { Loader2, X, Sparkles } from "lucide-react";
import { validateImageFile } from "@/lib/image-studio/geometry";
import { removeBackground } from "@/lib/image-studio/remove-bg";
import { composeOnIvory } from "@/lib/image-studio/compose";

interface Props {
  productSlug: string;
  onResult: (publicUrl: string) => void;
  onClose: () => void;
}

export function ProductImageStudio({ productSlug, onResult, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterBlob, setAfterBlob] = useState<Blob | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  const process = useCallback(async (file: File) => {
    const v = validateImageFile(file);
    if (!v.ok) {
      setError(v.error!);
      return;
    }
    setError(null);
    setBeforeUrl(URL.createObjectURL(file));
    setBusy(true);
    try {
      setStatus("מסיר רקע… (טעינת מודל ראשונית עשויה לקחת רגע)");
      const cut = await removeBackground(file);
      setStatus("מרכיב על רקע סטודיו…");
      const composed = await composeOnIvory(cut);
      setAfterBlob(composed);
      setAfterUrl(URL.createObjectURL(composed));
      setStatus("");
    } catch {
      setError(
        "העיבוד נכשל — ככל הנראה זיכרון. מומלץ להשתמש ב-Chrome או Edge במחשב (תומכי WebGPU), ולנסות תמונה קטנה יותר."
      );
      setStatus("");
    } finally {
      setBusy(false);
    }
  }, []);

  const accept = useCallback(async () => {
    if (!afterBlob) return;
    setBusy(true);
    setStatus("מעלה…");
    try {
      const fd = new FormData();
      fd.append("file", new File([afterBlob], "studio.jpg", { type: "image/jpeg" }));
      fd.append("productSlug", productSlug);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload");
      const data = await res.json();
      onResult(data.publicUrl);
      onClose();
    } catch {
      setError("ההעלאה נכשלה. נסה שוב.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }, [afterBlob, productSlug, onResult, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] border border-gold/15 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 text-white/40 hover:text-white/70"
          aria-label="סגירה"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} className="text-gold" />
          <h3 className="text-sm tracking-[0.2em] uppercase text-white/70">עיבוד סטודיו</h3>
        </div>

        {!beforeUrl && (
          <label className="block border border-dashed border-gold/30 rounded-sm p-10 text-center cursor-pointer hover:border-gold/50 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && process(e.target.files[0])}
            />
            <p className="text-sm text-white/50">בחר תמונה להעלאה</p>
            <p className="text-[11px] text-white/30 mt-1">JPG · PNG · WebP</p>
          </label>
        )}

        {beforeUrl && (
          <div className="grid grid-cols-2 gap-4">
            <figure>
              <figcaption className="text-[11px] tracking-widest uppercase text-white/30 mb-2">לפני</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforeUrl} alt="לפני" className="w-full aspect-square object-cover" />
            </figure>
            <figure>
              <figcaption className="text-[11px] tracking-widest uppercase text-gold/60 mb-2">אחרי</figcaption>
              <div
                className="w-full aspect-square flex items-center justify-center"
                style={{ background: "#F7F3EC" }}
              >
                {busy && <Loader2 className="animate-spin text-gold" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {afterUrl && <img src={afterUrl} alt="אחרי" className="w-full h-full object-contain" />}
              </div>
            </figure>
          </div>
        )}

        {status && <p className="text-xs text-white/40 mt-4">{status}</p>}
        {error && <p className="text-xs text-deep-red mt-4">{error}</p>}

        {afterUrl && !busy && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={accept}
              className="flex-1 py-3 bg-gold text-black text-sm font-medium hover:bg-gold-light transition-colors"
            >
              השתמש במשופרת
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-white/15 text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              השאר מקור
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
