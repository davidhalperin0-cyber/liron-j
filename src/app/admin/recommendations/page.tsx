"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Link2, Layers, ShoppingBag, ArrowLeftRight, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const RECOMMENDATION_TYPES = [
  { id: "similar", name: "מוצרים דומים", nameEn: "Similar Products", icon: Layers, description: "מוצרים באותה קטגוריה וסגנון", count: 156, auto: true },
  { id: "matching", name: "מתאים לזה", nameEn: "Goes Well With", icon: Link2, description: "המלצות לשילוב מוצרים", count: 89, auto: false },
  { id: "complete-look", name: "השלימי את הלוק", nameEn: "Complete The Look", icon: ShoppingBag, description: "סטים ושילובים מלאים", count: 42, auto: false },
  { id: "trending", name: "טרנדי עכשיו", nameEn: "Trending Now", icon: TrendingUp, description: "מוצרים פופולריים אוטומטית", count: 24, auto: true },
  { id: "also-viewed", name: "צפו גם ב...", nameEn: "Also Viewed", icon: Users, description: "מבוסס על התנהגות גולשים", count: 312, auto: true },
  { id: "upsell", name: "שדרוג", nameEn: "Upsell", icon: ArrowLeftRight, description: "גרסאות יקרות יותר", count: 67, auto: true },
];

const MOCK_RULES = [
  { id: "1", name: "טבעות → עגילים תואמים", type: "matching", productCount: 12, active: true },
  { id: "2", name: "שרשראות → תליונים", type: "complete-look", productCount: 8, active: true },
  { id: "3", name: "זהב צהוב → זהב צהוב", type: "similar", productCount: 45, active: true },
  { id: "4", name: "מחיר > ₪5000 → שדרוג ליהלום", type: "upsell", productCount: 15, active: false },
];

export default function RecommendationsAdmin() {
  const [rules, setRules] = useState(MOCK_RULES);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold flex items-center gap-2">
        <span className="text-base">🚧</span> עמוד זה בפיתוח — Coming Soon
      </div>
      <div>
        <h1 className="text-2xl font-medium text-white">מנוע המלצות</h1>
        <p className="text-sm text-white/40 mt-1">ניהול המלצות אוטומטיות וידניות</p>
      </div>

      {/* Types Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {RECOMMENDATION_TYPES.map((type, i) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-charcoal border border-white/5 rounded-lg p-5 hover:border-gold/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <type.icon size={20} className="text-gold/60 group-hover:text-gold transition-colors" />
              {type.auto && (
                <span className="flex items-center gap-1 text-[10px] text-green-400/60">
                  <Sparkles size={10} />
                  אוטומטי
                </span>
              )}
            </div>
            <h3 className="text-sm text-white/80 font-medium">{type.name}</h3>
            <p className="text-[10px] text-white/30 mt-0.5">{type.description}</p>
            <p className="text-lg font-medium text-white mt-3">{type.count} <span className="text-xs text-white/30 font-normal">קשרים</span></p>
          </motion.div>
        ))}
      </div>

      {/* Rules */}
      <div className="bg-charcoal border border-white/5 rounded-lg">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">כללי המלצה</h2>
          <button
            onClick={() => {
              const name = window.prompt("שם כלל המלצה חדש:");
              if (!name) return;
              setRules((items) => [
                {
                  id: `rule-${Date.now()}`,
                  name,
                  type: "similar",
                  productCount: 0,
                  active: true,
                },
                ...items,
              ]);
            }}
            className="text-xs text-gold/60 hover:text-gold transition-colors"
          >
            הוסף כלל
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {rules.map((rule) => (
            <div key={rule.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex-1">
                <p className="text-sm text-white/70">{rule.name}</p>
                <p className="text-[10px] text-white/30">{rule.productCount} מוצרים מושפעים</p>
              </div>
              <span className="text-[10px] text-white/20 px-2 py-0.5 rounded bg-white/5">
                {RECOMMENDATION_TYPES.find((t) => t.id === rule.type)?.name}
              </span>
              <button
                onClick={() =>
                  setRules((items) =>
                    items.map((item) =>
                      item.id === rule.id ? { ...item, active: !item.active } : item
                    )
                  )
                }
                className={cn(
                "w-8 h-4 rounded-full relative transition-colors cursor-pointer",
                rule.active ? "bg-gold/30" : "bg-white/10"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full transition-all",
                  rule.active ? "right-0.5 bg-gold" : "right-4 bg-white/30"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
