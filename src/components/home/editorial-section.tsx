"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EditorialSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-32 lg:py-48 overflow-hidden bg-[#1a1714]"
    >
      {/* Cinematic background video */}
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/editorial-poster.jpg"
        >
          <source src="/videos/editorial.mp4" type="video/mp4" />
        </video>
        {/* Legibility — darken the start (RTL right) side where the text sits */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-gold/80 text-xs tracking-[0.5em] uppercase mb-6"
          >
            הסיפור שלנו
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#FBF8F3] leading-[1.1] mb-8 drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]"
          >
            מלאכת יד
            <br />
            <span className="text-gradient-gold">ללא פשרות</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#FBF8F3]/80 text-lg leading-relaxed mb-10 max-w-lg drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]"
          >
            כל תכשיט מעוצב בקפידה — ציפוי זהב עמיד, כסף 925 וזרקונים שנבחרו אחד-אחד. אנחנו לא מתפשרים על שום פרט.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="/about">
              <Button variant="outline" size="lg">
                גלו עוד
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
