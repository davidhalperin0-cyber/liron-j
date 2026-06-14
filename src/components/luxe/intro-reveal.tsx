"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// One-time cinematic brand reveal — ivory curtain, the AURÉA wordmark draws in
// on a growing gold hairline, then the curtain lifts. Once per session.
export function IntroReveal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("aurea-intro")) return;
    sessionStorage.setItem("aurea-intro", "1");
    setShow(true);
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F3EC]"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-col items-center">
            <motion.h1
              className="font-display text-4xl sm:text-6xl tracking-[0.35em] uppercase text-gradient-gold ps-[0.35em]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              AURÉA
            </motion.h1>
            <motion.div
              className="mt-5 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "11rem", opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            />
            <motion.p
              className="mt-4 text-[10px] tracking-[0.5em] uppercase text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.7 }}
            >
              Fine Jewelry
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
