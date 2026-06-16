"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Ticket } from "lucide-react";
import { notifyAction, notifyError } from "@/lib/ui-actions";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  note: string | null;
}

const empty = {
  code: "",
  discountType: "percent",
  discountValue: 10,
  minOrder: 0,
  maxUses: "" as number | "",
  expiresAt: "",
};

export default function PromosAdmin() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/promos");
      const data = await res.json();
      setCodes(data.codes ?? []);
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.code.trim()) { notifyError("נא להזין קוד"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrder: Number(form.minOrder) || 0,
          maxUses: form.maxUses === "" ? null : Number(form.maxUses),
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      notifyAction("הקוד נוצר");
      setForm({ ...empty });
      load();
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "יצירה נכשלה");
    } finally {
      setCreating(false);
    }
  }

  async function toggle(c: PromoCode) {
    setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    await fetch("/api/admin/promos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
  }

  const inputCls = "w-full bg-smoke border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-white">קודי הנחה</h1>
        <p className="text-sm text-white/40 mt-1">{codes.length} קודים · קודי יום הולדת נוצרים אוטומטית</p>
      </div>

      {/* Create */}
      <div className="bg-charcoal border border-white/5 rounded-lg p-5">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">קוד</label>
            <input className={inputCls + " tracking-wider"} value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SPRING20" />
          </div>
          <div>
            <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">סוג</label>
            <select className={inputCls} value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="percent">אחוז %</option>
              <option value="fixed">סכום ₪</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">ערך</label>
            <input type="number" className={inputCls} value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">מינ׳ הזמנה</label>
            <input type="number" className={inputCls} value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">תוקף</label>
            <input type="date" className={inputCls + " [color-scheme:dark]"} value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <button onClick={create} disabled={creating}
            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 py-2 bg-gold text-black text-sm font-medium rounded-lg hover:bg-gold-light disabled:opacity-40 transition-colors">
            {creating ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> צור</>}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-charcoal border border-white/5 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gold/40" /></div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16">
            <Ticket size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">אין קודים עדיין</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">קוד</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">הנחה</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">שימוש</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">תוקף</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">פעיל</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {codes.map((c) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gold tracking-wider">{c.code}</p>
                    {c.note && <p className="text-[10px] text-white/25">{c.note}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-white/70">
                    {c.discount_type === "percent" ? `${c.discount_value}%` : `₪${c.discount_value}`}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-white/40">
                    {c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-white/40">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("he-IL") : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggle(c)}
                      className={`text-xs px-2 py-1 rounded ${c.active ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/30"}`}>
                      {c.active ? "פעיל" : "כבוי"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
