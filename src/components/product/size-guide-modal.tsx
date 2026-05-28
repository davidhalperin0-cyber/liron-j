"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ open, onClose }: SizeGuideModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{
        animation: "fadeIn 200ms ease-out",
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className="relative w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-charcoal border border-white/10 p-6 sm:p-8"
        style={{ animation: "slideUp 250ms ease-out" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-white/40 hover:text-white transition-colors"
          aria-label="סגור"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-2">
            LIRON J
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-white">
            מדריך מידות
          </h2>
        </div>

        {/* Rings */}
        <section className="mb-8">
          <h3 className="text-gold font-display text-lg mb-4">
            טבעות
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-gold text-right py-3 px-3 font-medium">מידה ישראלית</th>
                  <th className="text-gold text-right py-3 px-3 font-medium">קוטר (מ&quot;מ)</th>
                  <th className="text-gold text-right py-3 px-3 font-medium">היקף (מ&quot;מ)</th>
                  <th className="text-gold text-right py-3 px-3 font-medium">US Size</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { il: "6", diameter: "16.5", circ: "51.8", us: "6" },
                  { il: "7", diameter: "17.3", circ: "54.4", us: "7" },
                  { il: "8", diameter: "18.1", circ: "57.0", us: "8" },
                  { il: "9", diameter: "19.0", circ: "59.5", us: "9" },
                  { il: "10", diameter: "19.8", circ: "62.1", us: "10" },
                ].map((row) => (
                  <tr
                    key={row.il}
                    className="border-b border-white/10 even:bg-white/[0.02]"
                  >
                    <td className="text-white/70 py-3 px-3">{row.il}</td>
                    <td className="text-white/70 py-3 px-3">{row.diameter}</td>
                    <td className="text-white/70 py-3 px-3">{row.circ}</td>
                    <td className="text-white/70 py-3 px-3">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bracelets */}
        <section className="mb-8">
          <h3 className="text-gold font-display text-lg mb-4">
            צמידים
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-gold text-right py-3 px-3 font-medium">מידה</th>
                  <th className="text-gold text-right py-3 px-3 font-medium">היקף (ס&quot;מ)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "S", circ: "15-16" },
                  { size: "M", circ: "16.5-17.5" },
                  { size: "L", circ: "18-19" },
                ].map((row) => (
                  <tr
                    key={row.size}
                    className="border-b border-white/10 even:bg-white/[0.02]"
                  >
                    <td className="text-white/70 py-3 px-3">{row.size}</td>
                    <td className="text-white/70 py-3 px-3">{row.circ}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Necklaces */}
        <section className="mb-8">
          <h3 className="text-gold font-display text-lg mb-4">
            שרשראות
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-gold text-right py-3 px-3 font-medium">אורך</th>
                  <th className="text-gold text-right py-3 px-3 font-medium">תיאור</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { length: "40 ס\"מ", desc: "צמוד לצוואר (choker)" },
                  { length: "45 ס\"מ", desc: "קלאסי" },
                  { length: "50 ס\"מ", desc: "ארוך" },
                  { length: "60 ס\"מ", desc: "ארוך extra" },
                ].map((row) => (
                  <tr
                    key={row.length}
                    className="border-b border-white/10 even:bg-white/[0.02]"
                  >
                    <td className="text-white/70 py-3 px-3">{row.length}</td>
                    <td className="text-white/70 py-3 px-3">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How to measure */}
        <section className="border-t border-white/10 pt-6">
          <h3 className="text-gold font-display text-lg mb-4">
            איך למדוד?
          </h3>
          <ul className="space-y-3 text-white/50 text-sm leading-relaxed">
            <li className="flex gap-2">
              <span className="text-gold/60 shrink-0">1.</span>
              <span>
                <strong className="text-white/70">טבעות:</strong> כרכו חוט סביב האצבע, סמנו את נקודת המפגש ומדדו את האורך במילימטרים. השוו לטבלה.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold/60 shrink-0">2.</span>
              <span>
                <strong className="text-white/70">צמידים:</strong> מדדו את היקף כף היד במקום הרחב ביותר בעזרת סרט מדידה גמיש.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold/60 shrink-0">3.</span>
              <span>
                <strong className="text-white/70">שרשראות:</strong> מדדו שרשרת קיימת שנוחה לכם מקצה לקצה, או השתמשו בסרט מדידה סביב הצוואר.
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/30">
            לא בטוחים? צרו איתנו קשר ונשמח לעזור בבחירת המידה המושלמת.
          </p>
        </section>
      </div>
    </div>
  );
}
