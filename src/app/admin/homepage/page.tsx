"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Eye, EyeOff, Edit, Plus, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOCK_SECTIONS = [
  { id: "hero", name: "הירו ראשי", type: "hero", visible: true, order: 1, description: "באנר ראשי עם סצנת 3D" },
  { id: "new-drop", name: "חדש בחנות", type: "product-grid", visible: true, order: 2, description: "מוצרים חדשים שנוספו לאחרונה" },
  { id: "trending", name: "פופולרי עכשיו", type: "product-grid", visible: true, order: 3, description: "מוצרים הכי נמכרים" },
  { id: "editorial", name: "אדיטוריאל", type: "editorial", visible: true, order: 4, description: "תוכן עיצובי מגזיני" },
  { id: "categories", name: "קטגוריות", type: "categories", visible: true, order: 5, description: "רשת קטגוריות ראשיות" },
  { id: "brand-story", name: "סיפור המותג", type: "content", visible: true, order: 6, description: "אודות המותג ותמונה" },
  { id: "vip", name: "מועדון VIP", type: "cta", visible: true, order: 7, description: "הרשמה למועדון לקוחות" },
  { id: "instagram", name: "אינסטגרם פיד", type: "social", visible: false, order: 8, description: "פיד תמונות מאינסטגרם" },
];

const TYPE_LABELS: Record<string, string> = {
  hero: "הירו",
  "product-grid": "רשת מוצרים",
  editorial: "אדיטוריאל",
  categories: "קטגוריות",
  content: "תוכן",
  cta: "קריאה לפעולה",
  social: "סושיאל",
};

export default function HomepageAdmin() {
  const [sections, setSections] = useState(MOCK_SECTIONS);

  const toggleVisibility = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold flex items-center gap-2">
        <span className="text-base">🚧</span> עמוד זה בפיתוח — Coming Soon
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">עריכת דף הבית</h1>
          <p className="text-sm text-white/40 mt-1">גרור לשינוי סדר, לחץ לעריכה</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-charcoal border border-white/5 rounded-lg text-sm text-white/50 hover:text-white transition-colors">
            <Monitor size={14} />
            תצוגה מקדימה
          </a>
          <Button
            variant="gold"
            size="md"
            onClick={() => {
              const name = window.prompt("שם סקשן חדש:");
              if (!name) return;
              setSections((items) => [
                ...items,
                {
                  id: `section-${Date.now()}`,
                  name,
                  type: "content",
                  visible: true,
                  order: items.length + 1,
                  description: "סקשן מותאם אישית",
                },
              ]);
            }}
          >
            <Plus size={16} className="ml-2" />
            הוסף סקשן
          </Button>
        </div>
      </div>

      <div className="bg-charcoal border border-white/5 rounded-lg overflow-hidden">
        <div className="divide-y divide-white/5">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex items-center gap-4 px-5 py-4 transition-colors group",
                section.visible ? "hover:bg-white/[0.02]" : "opacity-40"
              )}
            >
              <GripVertical size={16} className="text-white/10 cursor-grab shrink-0" />
              <span className="text-xs text-white/20 w-6 shrink-0">{section.order}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">{section.name}</p>
                <p className="text-[10px] text-white/30">{section.description}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/30">
                {TYPE_LABELS[section.type]}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisibility(section.id)}
                  className="p-1.5 text-white/30 hover:text-white transition-colors"
                >
                  {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => {
                    const name = window.prompt("שם סקשן:", section.name);
                    if (!name) return;
                    setSections((items) =>
                      items.map((item) =>
                        item.id === section.id ? { ...item, name } : item
                      )
                    );
                  }}
                  className="p-1.5 text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
