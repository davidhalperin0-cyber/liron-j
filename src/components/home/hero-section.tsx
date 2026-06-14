"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-end justify-center overflow-hidden bg-[#1a1714] pb-[12vh]">
      {/* Cinematic background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Legibility overlays — soft darkening so light text reads cleanly */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />

      {/* Content — bottom-weighted for luxury editorial feel */}
      <div className="relative z-20 text-center max-w-3xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="text-[#F3E9CF] text-[11px] tracking-[0.5em] uppercase mb-5"
        >
          New Collection
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide text-[#FBF8F3] mb-5 leading-[1.05] drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
        >
          <span className="block">האומנות</span>
          <span className="block text-gradient-gold">של היוקרה</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="text-[#FBF8F3]/85 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]"
        >
          תכשיטים יוקרתיים בעבודת יד.
          <br className="hidden sm:block" />
          כל פריט מספר סיפור של מלאכת יד, יופי ובלעדיות.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          <Link href="/collections/new">
            <Button variant="gold" size="lg">
              גלו את הקולקציה
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator — minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-8 bg-gradient-to-b from-transparent via-[#F3E9CF]/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
