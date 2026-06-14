"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Globe, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifyAction } from "@/lib/ui-actions";

const SETTINGS_SECTIONS = [
  {
    id: "store",
    icon: Store,
    title: "פרטי החנות",
    description: "שם, לוגו, כתובת",
    fields: [
      { label: "שם החנות", value: "AURÉA", type: "text" },
      { label: "אימייל", value: "info@aurea.com", type: "email" },
      { label: "טלפון", value: "03-1234567", type: "tel" },
      { label: "כתובת", value: "תל אביב, ישראל", type: "text" },
    ],
  },
  {
    id: "locale",
    icon: Globe,
    title: "שפה ומטבע",
    description: "הגדרות אזוריות",
    fields: [
      { label: "שפה ראשית", value: "עברית", type: "select" },
      { label: "שפה משנית", value: "English", type: "select" },
      { label: "מטבע", value: "ILS (₪)", type: "select" },
      { label: "אזור זמן", value: "Asia/Jerusalem", type: "select" },
    ],
  },
  {
    id: "shipping",
    icon: Truck,
    title: "משלוחים",
    description: "אפשרויות ומחירים",
    fields: [
      { label: "משלוח חינם מעל", value: "500", type: "number" },
      { label: "משלוח רגיל", value: "29", type: "number" },
      { label: "משלוח אקספרס", value: "49", type: "number" },
      { label: "איסוף עצמי", value: "כן", type: "select" },
    ],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "תשלומים",
    description: "ספקי סליקה",
    fields: [
      { label: "ספק סליקה", value: "לא הוגדר", type: "select" },
      { label: "תשלומים", value: "עד 12 תשלומים", type: "select" },
      { label: "PayPal", value: "לא פעיל", type: "toggle" },
      { label: "Apple Pay", value: "לא פעיל", type: "toggle" },
    ],
  },
];

export default function SettingsAdmin() {
  const [activeSection, setActiveSection] = useState("store");
  const current = SETTINGS_SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold flex items-center gap-2">
        <span className="text-base">🚧</span> עמוד זה בפיתוח — Coming Soon
      </div>
      <div>
        <h1 className="text-2xl font-medium text-white">הגדרות</h1>
        <p className="text-sm text-white/40 mt-1">הגדרות כלליות של החנות</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-right",
                activeSection === section.id
                  ? "bg-gold/5 text-gold border border-gold/10"
                  : "text-white/50 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <section.icon size={18} />
              <div>
                <p>{section.title}</p>
                <p className="text-[10px] opacity-50">{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-charcoal border border-white/5 rounded-lg"
            >
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-sm font-medium text-white">{current.title}</h2>
                <p className="text-[10px] text-white/30 mt-0.5">{current.description}</p>
              </div>
              <div className="p-6 space-y-5">
                {current.fields.map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs text-white/40 mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full px-4 py-2.5 bg-smoke border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
                    />
                  </div>
                ))}
                <div className="pt-4 border-t border-white/5">
                  <Button
                    variant="gold"
                    size="md"
                    onClick={() => notifyAction("שמירת הגדרות תהיה זמינה בקרוב")}
                  >
                    שמור שינויים
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
