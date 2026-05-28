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

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-32 lg:py-48 overflow-hidden bg-black"
    >
      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center image-dramatic"
          style={{
            backgroundImage: "url(/images/products/collection-hero.webp)",
            backgroundColor: "#1a1a1a",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </motion.div>

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
            className="font-display text-4xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-8"
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
            className="text-white/50 text-lg leading-relaxed mb-10 max-w-lg"
          >
            כל תכשיט נוצר בעבודת יד קפדנית, מזהב טהור ויהלומים שנבחרו בקפידה. אנחנו לא מתפשרים על שום פרט.
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
