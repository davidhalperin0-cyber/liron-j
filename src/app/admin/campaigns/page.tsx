"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, Calendar, Percent, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { notifyAction } from "@/lib/ui-actions";

const MOCK_CAMPAIGNS = [
  { id: "1", name: "סייל אביב", type: "discount", discount: 20, status: "active", startDate: "2026-04-01", endDate: "2026-05-31", revenue: 45200, orders: 28 },
  { id: "2", name: "השקת קולקציה חדשה", type: "launch", discount: 0, status: "active", startDate: "2026-05-15", endDate: "2026-06-15", revenue: 18900, orders: 12 },
  { id: "3", name: "Black Friday", type: "discount", discount: 30, status: "scheduled", startDate: "2026-11-28", endDate: "2026-11-30", revenue: 0, orders: 0 },
  { id: "4", name: "ולנטיינז", type: "bundle", discount: 15, status: "ended", startDate: "2026-02-01", endDate: "2026-02-14", revenue: 72800, orders: 45 },
  { id: "5", name: "VIP בלבד — גישה מוקדמת", type: "exclusive", discount: 10, status: "draft", startDate: "", endDate: "", revenue: 0, orders: 0 },
];

const TYPE_MAP: Record<string, { label: string; icon: typeof Percent }> = {
  discount: { label: "הנחה", icon: Percent },
  launch: { label: "השקה", icon: Tag },
  bundle: { label: "באנדל", icon: Tag },
  exclusive: { label: "בלעדי", icon: Tag },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "פעיל", color: "bg-green-500/10 text-green-400" },
  scheduled: { label: "מתוזמן", color: "bg-blue-500/10 text-blue-400" },
  ended: { label: "הסתיים", color: "bg-white/5 text-white/30" },
  draft: { label: "טיוטה", color: "bg-yellow-500/10 text-yellow-400" },
};

export default function CampaignsAdmin() {
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [search, setSearch] = useState("");

  const filtered = campaigns.filter((c) => c.name.includes(search));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold flex items-center gap-2">
        <span className="text-base">🚧</span> עמוד זה בפיתוח — Coming Soon
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">קמפיינים</h1>
          <p className="text-sm text-white/40 mt-1">{campaigns.length} קמפיינים</p>
        </div>
        <Button
          variant="gold"
          size="md"
          onClick={() => {
            const name = window.prompt("שם קמפיין חדש:");
            if (!name) return;
            setCampaigns((items) => [
              {
                id: `campaign-${Date.now()}`,
                name,
                type: "discount",
                discount: 0,
                status: "draft",
                startDate: "",
                endDate: "",
                revenue: 0,
                orders: 0,
              },
              ...items,
            ]);
          }}
        >
          <Plus size={16} className="ml-2" />
          קמפיין חדש
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="חפש קמפיין..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
        />
      </div>

      <div className="bg-charcoal border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">קמפיין</th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">סוג</th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">תאריכים</th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">הכנסות</th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">הזמנות</th>
              <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">סטטוס</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((campaign) => (
              <motion.tr
                key={campaign.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm text-white/80">{campaign.name}</p>
                  {campaign.discount > 0 && (
                    <p className="text-[10px] text-gold">{campaign.discount}% הנחה</p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-white/40">{TYPE_MAP[campaign.type]?.label}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 text-[10px] text-white/30">
                    <Calendar size={10} />
                    {campaign.startDate ? `${campaign.startDate} — ${campaign.endDate}` : "לא נקבע"}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-gold">{campaign.revenue > 0 ? formatPrice(campaign.revenue) : "—"}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-white/60">{campaign.orders || "—"}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px]", STATUS_MAP[campaign.status].color)}>
                    {STATUS_MAP[campaign.status].label}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => notifyAction(`${campaign.name}\nהכנסות: ${formatPrice(campaign.revenue)}\nהזמנות: ${campaign.orders}`)} className="p-1 text-white/30 hover:text-white transition-colors"><Eye size={14} /></button>
                    <button onClick={() => {
                      const discount = window.prompt("אחוז הנחה:", String(campaign.discount));
                      if (discount === null) return;
                      setCampaigns((items) => items.map((item) => item.id === campaign.id ? { ...item, discount: Number(discount), status: "active" } : item));
                    }} className="p-1 text-white/30 hover:text-white transition-colors"><Edit size={14} /></button>
                    <button onClick={() => {
                      if (!window.confirm(`למחוק את ${campaign.name}?`)) return;
                      setCampaigns((items) => items.filter((item) => item.id !== campaign.id));
                    }} className="p-1 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
