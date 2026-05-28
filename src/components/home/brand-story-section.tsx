"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "14K-18K", label: "זהב טהור" },
  { value: "100%", label: "עבודת יד" },
  { value: "GIA", label: "יהלומים מוסמכים" },
  { value: "∞", label: "אחריות לכל החיים" },
];

export function BrandStorySection() {
  return (
    <section className="py-24 sm:py-32 bg-charcoal relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-smoke overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center image-dramatic"
                style={{
                  backgroundImage: "url(/images/products/collection-hero.webp)",
                  backgroundColor: "#2a2a2a",
                }}
              />
            </div>
            {/* Gold frame accent */}
            <div className="absolute -bottom-4 -left-4 w-full h-full border border-gold/20 -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-6">
              הסיפור שלנו
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-[1.2] mb-8">
              כל תכשיט הוא
              <br />
              <span className="text-gradient-gold">יצירת אמנות</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-6">
              Liron J נולדה מתוך אהבה אמיתית לאומנות עתיקה. כל תכשיט עובר תהליך קפדני של עיצוב, יציקה וליטוש — מתכת אחרי מתכת, אבן אחרי אבן.
            </p>
            <p className="text-white/50 text-lg leading-relaxed mb-12">
              אנחנו מאמינים שתכשיט צריך לספר סיפור. כל פריט בקולקציה שלנו מעוצב כך שילווה אתכם לכל חיים.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl text-gold mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/40 tracking-wider uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
