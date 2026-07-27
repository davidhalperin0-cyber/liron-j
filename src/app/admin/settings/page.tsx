"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Store, Truck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifyAction, notifyError } from "@/lib/ui-actions";

interface StoreSettings {
  store: { name: string; email: string; phone: string; address: string };
  shipping: { freeAbove: number; standard: number; express: number };
  social: { instagram: string; facebook: string; whatsapp: string };
}

const SECTIONS = [
  { id: "store", icon: Store, title: "פרטי החנות", description: "שם, אימייל, טלפון, כתובת" },
  { id: "shipping", icon: Truck, title: "משלוחים", description: "ספי מחיר ומשלוח חינם" },
  { id: "social", icon: Share2, title: "רשתות חברתיות", description: "אינסטגרם, פייסבוק, וואטסאפ" },
] as const;

type Field = { key: string; label: string; type?: string; hint?: string };

const SECTION_FIELDS: Record<string, Field[]> = {
  store: [
    { key: "store.name", label: "שם החנות" },
    { key: "store.email", label: "אימייל", type: "email" },
    { key: "store.phone", label: "טלפון", type: "tel" },
    { key: "store.address", label: "כתובת" },
  ],
  shipping: [
    { key: "shipping.freeAbove", label: "משלוח חינם מעל (₪)", type: "number", hint: "מעל סכום זה המשלוח הרגיל חינם" },
    { key: "shipping.standard", label: "משלוח רגיל (₪)", type: "number" },
    { key: "shipping.express", label: "משלוח אקספרס (₪)", type: "number" },
  ],
  social: [
    { key: "social.instagram", label: "אינסטגרם (קישור מלא)", hint: "https://instagram.com/..." },
    { key: "social.facebook", label: "פייסבוק (קישור מלא)", hint: "https://facebook.com/..." },
    { key: "social.whatsapp", label: "וואטסאפ (מספר בינלאומי)", hint: "לדוגמה 972507816577" },
  ],
};

function getPath(obj: StoreSettings, path: string): string {
  const [a, b] = path.split(".");
  // @ts-expect-error dynamic access
  return String(obj[a][b] ?? "");
}

export default function SettingsAdmin() {
  const [activeSection, setActiveSection] = useState("store");
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (res.ok) setSettings(data.settings);
        else notifyError(data.error ?? "שגיאה בטעינת ההגדרות");
      } catch {
        notifyError("שגיאה בטעינת ההגדרות");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setPath = (path: string, value: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const [a, b] = path.split(".");
      return { ...prev, [a]: { ...prev[a as keyof StoreSettings], [b]: value } };
    });
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        notifyAction("ההגדרות נשמרו בהצלחה");
      } else {
        notifyError(data.error ?? "שמירה נכשלה");
      }
    } catch {
      notifyError("שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  };

  const fields = SECTION_FIELDS[activeSection] ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-white">הגדרות</h1>
        <p className="text-sm text-white/40 mt-1">הגדרות כלליות של החנות — נשמרות ומשפיעות על האתר</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {SECTIONS.map((section) => (
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
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-charcoal border border-white/5 rounded-lg"
          >
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-sm font-medium text-white">
                {SECTIONS.find((s) => s.id === activeSection)?.title}
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {loading || !settings ? (
                <p className="text-sm text-white/30">טוען…</p>
              ) : (
                <>
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-white/40 mb-1.5">{field.label}</label>
                      <input
                        type={field.type ?? "text"}
                        value={getPath(settings, field.key)}
                        onChange={(e) => setPath(field.key, e.target.value)}
                        className="w-full px-4 py-2.5 bg-smoke border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
                        dir={field.type === "number" || field.key.startsWith("social") ? "ltr" : "rtl"}
                      />
                      {field.hint && <p className="text-[10px] text-white/25 mt-1">{field.hint}</p>}
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/5">
                    <Button variant="gold" size="md" onClick={save} loading={saving}>
                      שמור שינויים
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
