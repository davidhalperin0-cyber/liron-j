"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Desktop-only magnetic gold halo that trails the cursor and swells over
// interactive elements. Additive (the real cursor stays), pointer-events none.
export function LuxeCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 350, damping: 30, mass: 0.4 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setActive(!!el?.closest("a, button, input, [role='button']"));
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[55] hidden lg:block"
      style={{
        left: sx,
        top: sy,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        animate={{ scale: active ? 2.1 : 1, opacity: active ? 0.5 : 0.32 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="h-40 w-40 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(154,123,60,0.55) 0%, rgba(154,123,60,0.12) 40%, transparent 70%)",
          mixBlendMode: "multiply",
          filter: "blur(8px)",
        }}
      />
    </motion.div>
  );
}
