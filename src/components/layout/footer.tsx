import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const FOOTER_LINKS = {
  shop: {
    title: "חנות",
    links: [
      { label: "טבעות", href: "/collections/rings" },
      { label: "עגילים", href: "/collections/earrings" },
      { label: "שרשראות", href: "/collections/necklaces" },
      { label: "צמידים", href: "/collections/bracelets" },
      { label: "חדש באתר", href: "/collections/new" },
      { label: "בסט סלרס", href: "/collections/bestsellers" },
    ],
  },
  info: {
    title: "מידע",
    links: [
      { label: "אודות", href: "/about" },
      { label: "צור קשר", href: "/contact" },
      { label: "מדיניות משלוחים", href: "/shipping" },
      { label: "מדיניות החזרות", href: "/returns" },
      { label: "מדיניות פרטיות", href: "/privacy" },
      { label: "תקנון", href: "/terms" },
      { label: "הצהרת נגישות", href: "/accessibility" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-charcoal border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl tracking-[0.3em] uppercase text-gradient-gold mb-4">
              AURÉA
            </h2>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              תכשיטי אופנה יוקרתיים. ציפוי זהב, כסף 925, זרקונים ואבנים טבעיות — עוצבו עבור אלו שדורשים את המיוחד.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/aurea_jewelry_il"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-white/40 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-white/40 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-medium tracking-widest uppercase text-white/80 mb-5">
              {FOOTER_LINKS.shop.title}
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.shop.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-sm font-medium tracking-widest uppercase text-white/80 mb-5">
              {FOOTER_LINKS.info.title}
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.info.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-medium tracking-widest uppercase text-white/80 mb-5">
              צור קשר
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Phone size={16} className="text-gold/60 shrink-0" />
                <span dir="ltr">+972-3-123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Mail size={16} className="text-gold/60 shrink-0" />
                <span>info@aurea.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/40">
                <MapPin size={16} className="text-gold/60 shrink-0 mt-0.5" />
                <span>ישראל</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} AURÉA. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/30">🔒 תשלום מאובטח</span>
            <span className="text-xs text-white/30">📦 משלוח חינם מעל ₪500</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
