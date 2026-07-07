"use client";

import { useEffect, useState, useCallback } from "react";
import { Accessibility, X, Plus, Minus, RotateCcw } from "lucide-react";
import Link from "next/link";

// Israeli accessibility regulations (תקנות שוויון זכויות לאנשים עם מוגבלות,
// standard IS 5568 ≈ WCAG 2.0 AA) expect an on-page adjustments menu plus a
// published accessibility statement. This is a lightweight, self-hosted menu.

type Settings = {
  fontStep: number; // 0..4  → 100%..160%
  contrast: boolean;
  links: boolean;
  readable: boolean;
  grayscale: boolean;
  noAnim: boolean;
};

const DEFAULT: Settings = {
  fontStep: 0,
  contrast: false,
  links: false,
  readable: false,
  grayscale: false,
  noAnim: false,
};

const STORAGE_KEY = "aurea-a11y";
const FONT_SCALES = [100, 110, 125, 140, 160];

function apply(s: Settings) {
  const el = document.documentElement;
  el.style.fontSize = `${FONT_SCALES[s.fontStep] ?? 100}%`;
  el.classList.toggle("a11y-contrast", s.contrast);
  el.classList.toggle("a11y-links", s.links);
  el.classList.toggle("a11y-readable", s.readable);
  el.classList.toggle("a11y-grayscale", s.grayscale);
  el.classList.toggle("a11y-noanim", s.noAnim);
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT);

  // Load saved settings once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULT, ...JSON.parse(raw) } as Settings;
        setSettings(parsed);
        apply(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      apply(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT);
    apply(DEFAULT);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const skipToContent = () => {
    const main = document.querySelector("main");
    if (main) {
      (main as HTMLElement).setAttribute("tabindex", "-1");
      (main as HTMLElement).focus();
      main.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  const Toggle = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
        active
          ? "border-gold bg-gold/10 text-white"
          : "border-white/10 text-white/70 hover:border-gold/40"
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full ${
          active ? "bg-gold text-black" : "bg-white/5 text-white/40"
        }`}
      >
        {active ? "פעיל" : "כבוי"}
      </span>
    </button>
  );

  return (
    <>
      {/* Trigger — fixed, left side, above the concierge bar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתיחת תפריט נגישות"
        className="fixed z-[60] bottom-24 left-4 sm:bottom-28 sm:left-6 w-12 h-12 rounded-full bg-charcoal border border-gold/40 text-gold flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-gold hover:text-black transition-colors"
      >
        <Accessibility size={22} strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-start sm:justify-start"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט נגישות"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:w-[360px] sm:ml-6 max-h-[85vh] overflow-y-auto bg-charcoal border border-white/10 rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <Accessibility size={18} className="text-gold" />
                נגישות
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="סגירת תפריט נגישות"
                className="p-2 -m-2 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Font size */}
            <div className="mb-3">
              <p className="text-xs text-white/40 mb-2">גודל טקסט</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update({ fontStep: Math.max(0, settings.fontStep - 1) })}
                  aria-label="הקטנת טקסט"
                  className="w-10 h-10 rounded-lg border border-white/10 text-white/70 flex items-center justify-center hover:border-gold/40"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 text-center text-sm text-white/70">
                  {FONT_SCALES[settings.fontStep]}%
                </div>
                <button
                  type="button"
                  onClick={() => update({ fontStep: Math.min(FONT_SCALES.length - 1, settings.fontStep + 1) })}
                  aria-label="הגדלת טקסט"
                  className="w-10 h-10 rounded-lg border border-white/10 text-white/70 flex items-center justify-center hover:border-gold/40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Toggle label="ניגודיות גבוהה" active={settings.contrast} onClick={() => update({ contrast: !settings.contrast })} />
              <Toggle label="הדגשת קישורים" active={settings.links} onClick={() => update({ links: !settings.links })} />
              <Toggle label="גופן קריא" active={settings.readable} onClick={() => update({ readable: !settings.readable })} />
              <Toggle label="גווני אפור" active={settings.grayscale} onClick={() => update({ grayscale: !settings.grayscale })} />
              <Toggle label="עצירת אנימציות" active={settings.noAnim} onClick={() => update({ noAnim: !settings.noAnim })} />
            </div>

            <button
              type="button"
              onClick={skipToContent}
              className="w-full mt-3 px-4 py-3 rounded-lg border border-white/10 text-sm text-white/70 hover:border-gold/40 transition-colors"
            >
              דילוג לתוכן הראשי
            </button>

            <button
              type="button"
              onClick={reset}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 text-sm text-white/60 hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
              איפוס הגדרות
            </button>

            <Link
              href="/accessibility"
              onClick={() => setOpen(false)}
              className="block text-center mt-4 text-xs text-gold/70 hover:text-gold underline underline-offset-4"
            >
              הצהרת הנגישות המלאה
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
