"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroScene = dynamic(
  () => import("@/components/3d/hero-scene").then((mod) => ({ default: mod.HeroScene })),
  { ssr: false }
);

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-end justify-center overflow-hidden bg-black pb-[12vh]">
      {/* 3D Scene */}
      <HeroScene />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] z-10 pointer-events-none" />

      {/* Content — bottom-weighted for luxury editorial feel */}
      <div className="relative z-20 text-center max-w-3xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="text-gold/50 text-[11px] tracking-[0.5em] uppercase mb-5"
        >
          New Collection
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide text-white mb-5 leading-[1.05]"
        >
          <span className="block">האומנות</span>
          <span className="block text-gradient-gold">של היוקרה</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5 }}
          className="text-white/35 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed"
        >
          תכשיטים יוקרתיים בעבודת יד.
          <br className="hidden sm:block" />
          כל פריט מספר סיפור של מלאכת יד, יופי ובלעדיות.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.0 }}
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
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-8 bg-gradient-to-b from-transparent via-gold/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
