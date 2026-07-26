"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, CreditCard, Search, ExternalLink } from "lucide-react";
import { notifyError } from "@/lib/ui-actions";

interface Prod {
  id: string;
  name_he: string;
  category: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
}

export default function TestChargePage() {
  const [prods, setProds] = useState<Prod[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Prod | null>(null);
  const [amount, setAmount] = useState(1);
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState<{ url: string; order: string; name: string; amount: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/test-charge");
        const data = await res.json();
        if (!res.ok) throw new Error();
        setProds(data.products ?? []);
      } catch {
        notifyError("שגיאה בטעינת מוצרים");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shown = useMemo(
    () => (q.trim() ? prods.filter((p) => p.name_he.includes(q.trim())) : prods).slice(0, 60),
    [prods, q]
  );

  async function createLink() {
    setCreating(true);
    setLink(null);
    try {
      const res = await fetch("/api/admin/test-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: sel?.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setLink(data);
    } catch (e) {
      notifyError((e as Error).message || "יצירת קישור נכשלה");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-black/80">בדיקת סליקה — חיוב אמיתי</h1>
      <p className="mt-1 text-sm text-black/45">
        בחר מוצר וסכום (1–100 ₪), וקבל קישור תשלום אמיתי לבדיקת המסוף. ⚠️ זהו חיוב אמיתי.
      </p>

      {/* amount */}
      <div className="mt-6 rounded-xl border border-black/8 bg-white p-4">
        <label className="mb-2 block text-sm text-black/60">סכום לחיוב (₪)</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-28 rounded-lg border border-black/10 px-3 py-2 text-lg outline-none focus:border-[#9A7B3C]/50"
          />
          <div className="flex gap-1.5">
            {[1, 2, 5, 10].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  amount === v ? "border-[#9A7B3C] bg-[#9A7B3C] text-white" : "border-black/10 bg-white text-black/60"
                }`}
              >
                ₪{v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* product picker */}
      <div className="mt-4 rounded-xl border border-black/8 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm text-black/60">
            מוצר: {sel ? <b className="text-black/80">{sel.name_he}</b> : <span className="text-black/40">כללי (בדיקה)</span>}
          </span>
          <div className="relative">
            <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="חיפוש מוצר..."
              className="w-48 rounded-full border border-black/10 py-1.5 pe-3 ps-8 text-sm outline-none focus:border-[#9A7B3C]/50"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#9A7B3C]/50" />
          </div>
        ) : (
          <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {shown.map((p) => {
              const img = p.images?.[1] ?? p.image_url ?? "";
              return (
                <button
                  key={p.id}
                  onClick={() => setSel(sel?.id === p.id ? null : p)}
                  className={`overflow-hidden rounded-lg border text-right transition-colors ${
                    sel?.id === p.id ? "border-[#9A7B3C] ring-1 ring-[#9A7B3C]" : "border-black/8 hover:border-black/20"
                  }`}
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.name_he} className="block aspect-square w-full object-cover" />
                  ) : (
                    <div className="aspect-square w-full bg-black/5" />
                  )}
                  <div className="p-1.5">
                    <p className="truncate text-xs text-black/70">{p.name_he}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={createLink}
        disabled={creating}
        className="mt-5 flex items-center gap-2 rounded-lg bg-[#9A7B3C] px-6 py-3 text-white transition-colors hover:bg-[#8a6d34] disabled:opacity-60"
      >
        {creating ? <Loader2 size={17} className="animate-spin" /> : <CreditCard size={17} />}
        צור קישור תשלום ל-₪{amount}
      </button>

      {link && (
        <div className="mt-5 rounded-xl border border-green-600/30 bg-green-50 p-4">
          <p className="text-sm text-black/70">
            קישור לתשלום <b>₪{link.amount}</b> עבור <b>{link.name}</b> (הזמנה {link.order}):
          </p>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm text-white"
          >
            <ExternalLink size={15} /> פתח דף תשלום ושלם ₪{link.amount}
          </a>
          <p className="mt-3 break-all text-xs text-black/40">{link.url}</p>
        </div>
      )}
    </div>
  );
}
