"use client";

import { useScroll, useVelocity, useTransform, useSpring, motion } from "framer-motion";

// Oversized kinetic brand statement — giant outlined serif that idles in a
// marquee and skews with scroll velocity (Awwwards-style reactive type).
function Track() {
  const phrase = "AURÉA — FINE JEWELRY — ";
  return (
    <span
      className="luxe-kinetic-text whitespace-nowrap font-display uppercase shrink-0 pe-[0.15em]"
      aria-hidden
    >
      {phrase.repeat(4)}
    </span>
  );
}

export function KineticBand() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 200, damping: 50 });
  const skew = useTransform(smooth, [-2000, 0, 2000], [-7, 0, 7], { clamp: true });

  return (
    <section className="relative overflow-hidden bg-[#F4EFE6] py-12 sm:py-20">
      <motion.div style={{ skewX: skew }} className="flex w-max luxe-kinetic">
        <Track />
        <Track />
      </motion.div>
    </section>
  );
}
