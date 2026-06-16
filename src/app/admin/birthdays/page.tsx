"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cake, Loader2, Gift, Check } from "lucide-react";
import { notifyAction, notifyError } from "@/lib/ui-actions";

interface Customer {
  email: string;
  name: string;
  phone: string;
  birthday: string | null;
  marketingConsent: boolean;
}

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function birthdayParts(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return { month: d.getMonth(), day: d.getDate() };
}

export default function BirthdaysAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  const now = new Date();
  const thisMonth = now.getMonth();
  const todayDate = now.getDate();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/customers");
        const data = await res.json();
        setCustomers(data.customers ?? []);
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const monthBirthdays = customers
    .map((c) => ({ c, b: birthdayParts(c.birthday) }))
    .filter((x) => x.b && x.b.month === thisMonth)
    .sort((a, b) => (a.b!.day - b.b!.day));

  async function sendGift(c: Customer) {
    setSending(c.email);
    try {
      const res = await fetch("/api/admin/birthdays/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: c.email, name: c.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setSent((prev) => new Set(prev).add(c.email));
      notifyAction(`מתנת יום הולדת נשלחה ל-${c.name} (קוד ${data.code})`);
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "השליחה נכשלה");
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-white">ימי הולדת</h1>
        <p className="text-sm text-white/40 mt-1">
          {MONTHS[thisMonth]} · {monthBirthdays.length} ימי הולדת · מתנה אוטומטית נשלחת ביום עצמו
        </p>
      </div>

      <div className="rounded-lg border border-gold/15 bg-gold/5 px-4 py-3 text-xs text-gold/80 flex items-center gap-2">
        <Gift size={14} /> שליחה אוטומטית פעילה — כל לקוח שהסכים לדיוור מקבל 15% מתנה במייל ביום ההולדת. כאן אפשר גם לשלוח ידנית.
      </div>

      <div className="bg-charcoal border border-white/5 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gold/40" />
          </div>
        ) : monthBirthdays.length === 0 ? (
          <div className="text-center py-16">
            <Cake size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">אין ימי הולדת בחודש {MONTHS[thisMonth]}</p>
          </div>
        ) : (
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">תאריך</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">לקוח</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">דיוור</th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">מתנה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {monthBirthdays.map(({ c, b }) => {
                const isToday = b!.day === todayDate;
                const wasSent = sent.has(c.email);
                return (
                  <motion.tr
                    key={c.email}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={isToday ? "bg-gold/5" : "hover:bg-white/[0.02] transition-colors"}
                  >
                    <td className="px-5 py-3.5">
                      <span className={`text-sm flex items-center gap-1.5 ${isToday ? "text-gold" : "text-white/60"}`}>
                        {isToday && <Cake size={13} />}
                        {b!.day} ב{MONTHS[thisMonth]}
                        {isToday && <span className="text-[9px] uppercase tracking-wider">היום</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-white/80">{c.name}</p>
                      <p className="text-[10px] text-white/30">{c.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs ${c.marketingConsent ? "text-green-400/70" : "text-white/25"}`}>
                        {c.marketingConsent ? "מסכים" : "לא מסכים"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => sendGift(c)}
                        disabled={sending === c.email || wasSent}
                        className="inline-flex items-center gap-1.5 text-xs text-gold/80 hover:text-gold disabled:text-white/20 transition-colors"
                      >
                        {sending === c.email ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : wasSent ? (
                          <><Check size={13} /> נשלח</>
                        ) : (
                          <><Gift size={13} /> שלח מתנה</>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
