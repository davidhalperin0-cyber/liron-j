"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Star, Search } from "lucide-react";
import { notifyAction, notifyError } from "@/lib/ui-actions";

interface Row {
  id: string;
  name_he: string;
  category: string;
  gender: string;
  price: number;
  material: string | null;
  image_url: string | null;
  images: string[] | null;
  is_featured: boolean;
}

const CAT_HE: Record<string, string> = {
  rings: "טבעות",
  necklaces: "שרשראות",
  earrings: "עגילים",
  bracelets: "צמידים",
  pendants: "תליונים",
};

type Filter = "all" | "featured" | "women" | "men";

export default function FeaturedPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("featured");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/featured");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "failed");
        setRows(data.products ?? []);
      } catch {
        notifyError("שגיאה בטעינת המוצרים");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggle(row: Row) {
    const next = !row.is_featured;
    setSaving(row.id);
    // optimistic
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_featured: next } : r)));
    try {
      const res = await fetch("/api/admin/featured", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, featured: next }),
      });
      if (!res.ok) throw new Error();
      notifyAction(next ? `${row.name_he} סומן כמומלץ` : `${row.name_he} הוסר מהמומלצים`);
    } catch {
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_featured: !next } : r)));
      notifyError("השמירה נכשלה");
    } finally {
      setSaving(null);
    }
  }

  const featuredCount = rows.filter((r) => r.is_featured).length;

  const shown = useMemo(() => {
    const term = q.trim();
    return rows.filter((r) => {
      if (term && !r.name_he.includes(term)) return false;
      if (filter === "featured") return r.is_featured;
      if (filter === "women") return r.gender === "women";
      if (filter === "men") return r.gender === "men";
      return true;
    });
  }, [rows, filter, q]);

  const FilterBtn = ({ k, label }: { k: Filter; label: string }) => (
    <button
      onClick={() => setFilter(k)}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        filter === k
          ? "border-[#9A7B3C] bg-[#9A7B3C] text-white"
          : "border-black/10 bg-white text-black/60 hover:border-black/25"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <h1 className="font-display text-2xl text-black/80">מוצרים מומלצים</h1>
      <p className="mt-1 text-sm text-black/45">
        המומלצים מוצגים בדף הבית ובאוסף &quot;בסט סלרס&quot;. לחיצה על הכוכב מסמנת או מבטלת.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterBtn k="featured" label={`⭐ מומלצים (${featuredCount})`} />
        <FilterBtn k="all" label={`הכל (${rows.length})`} />
        <FilterBtn k="women" label="נשים" />
        <FilterBtn k="men" label="גברים" />
        <div className="relative ms-auto">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש לפי שם..."
            className="w-52 rounded-full border border-black/10 bg-white py-1.5 pe-4 ps-9 text-sm outline-none focus:border-[#9A7B3C]/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[#9A7B3C]/50" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((r) => {
            const img = r.images?.[1] ?? r.image_url ?? "";
            return (
              <div
                key={r.id}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  r.is_featured ? "border-[#9A7B3C]" : "border-black/8"
                }`}
              >
                <div className="relative">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={r.name_he} className="block aspect-square w-full object-cover" />
                  ) : (
                    <div className="aspect-square w-full bg-black/5" />
                  )}
                  <button
                    onClick={() => toggle(r)}
                    disabled={saving === r.id}
                    aria-label={r.is_featured ? "הסר מהמומלצים" : "סמן כמומלץ"}
                    className={`absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors ${
                      r.is_featured
                        ? "bg-[#9A7B3C] text-white"
                        : "bg-white/90 text-black/35 hover:text-[#9A7B3C]"
                    }`}
                  >
                    {saving === r.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Star size={16} fill={r.is_featured ? "currentColor" : "none"} />
                    )}
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm text-black/80">{r.name_he}</p>
                  <p className="mt-0.5 text-xs text-black/40">
                    {CAT_HE[r.category] ?? r.category} · {r.gender === "men" ? "גברים" : "נשים"}
                  </p>
                  <p className="mt-1 text-sm text-[#9A7B3C]">₪{r.price}</p>
                </div>
              </div>
            );
          })}
          {shown.length === 0 && (
            <p className="col-span-full py-16 text-center text-sm text-black/40">אין מוצרים להצגה</p>
          )}
        </div>
      )}
    </div>
  );
}
