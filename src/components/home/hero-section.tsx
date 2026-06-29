"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Keep the hero video running at all times — resume after tab switches,
  // browser throttling, iOS Low Power Mode, or blocked autoplay.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        /* autoplay blocked — will retry on next event / user gesture */
      });
    };

    // Any pause that isn't us → immediately resume.
    const onPause = () => tryPlay();
    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    // Fallback for browsers that block autoplay until a user gesture.
    const onFirstInteraction = () => {
      tryPlay();
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("scroll", onFirstInteraction);
    };

    tryPlay();
    video.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("touchstart", onFirstInteraction, { passive: true });
    window.addEventListener("click", onFirstInteraction);
    window.addEventListener("scroll", onFirstInteraction, { passive: true });

    return () => {
      video.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("scroll", onFirstInteraction);
    };
  }, []);

  return (
    <section className="relative h-screen flex items-end justify-center overflow-hidden bg-[#1a1714] pb-[12vh]">
      {/* Cinematic background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/hero-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Legibility overlays — soft darkening so light text reads cleanly */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/85 z-10 pointer-events-none" />
      {/* Focused scrim anchored to the bottom text block */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/75 via-black/35 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-black/[0.08] z-10 pointer-events-none" />

      {/* Content — bottom-weighted for luxury editorial feel */}
      <div className="relative z-20 text-center max-w-3xl mx-auto px-6">
        {/* Eyebrow — gold rule flanking a single line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#D9BE84]/70" />
          <p className="text-[#F3E9CF] text-[10px] sm:text-[11px] tracking-[0.55em] uppercase">
            New Collection
          </p>
          <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#D9BE84]/70" />
        </motion.div>

        {/* Headline — line-by-line reveal (opacity-safe: never hides the title) */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide text-[#FBF8F3] mb-6 leading-[1.02] drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
          {["האומנות", "של היוקרה"].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.7 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={i === 1 ? "block text-gradient-gold pb-[0.08em]" : "block"}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.25 }}
          className="text-[#FBF8F3]/85 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]"
        >
          תכשיטים יוקרתיים בעבודת יד.
          <br className="hidden sm:block" />
          כל פריט מספר סיפור של מלאכת יד, יופי ובלעדיות.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.55 }}
        >
          <Link href="/collections/new">
            <Button variant="gold" size="lg" className="btn-shimmer">
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
