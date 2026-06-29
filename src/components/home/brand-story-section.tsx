"use client";

import { motion } from "framer-motion";

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
            <div className="bg-smoke overflow-hidden">
              {/* Editorial moodboard collage — full 3-panel ratio */}
              <img
                src="/images/brand-story.jpg"
                alt="AURÉA — מלאכת יד יוקרתית"
                loading="lazy"
                className="block w-full h-auto image-dramatic"
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
              AURÉA נולדה מתוך אהבה אמיתית לאומנות עתיקה. כל תכשיט עובר תהליך קפדני של עיצוב, יציקה וליטוש — מתכת אחרי מתכת, אבן אחרי אבן.
            </p>
            <p className="text-white/50 text-lg leading-relaxed">
              אנחנו מאמינים שתכשיט צריך לספר סיפור. כל פריט בקולקציה שלנו מעוצב כך שילווה אתכם לכל חיים.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
