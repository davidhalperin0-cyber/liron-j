"use client";

import { useRef } from "react";

// Showcase finale — the giant word AURÉA, where EACH letter is its own window
// into the brand films. Letters alternate between both videos and each is
// seeded to a different time offset, so the word is a living mosaic of frames.

const HERO = { src: "/videos/hero.mp4", poster: "/videos/hero-poster.jpg" };
const EDIT = { src: "/videos/editorial.mp4", poster: "/videos/editorial-poster.jpg" };

const LETTERS: { char: string; v: typeof HERO; offset: number }[] = [
  { char: "A", v: HERO, offset: 0.6 },
  { char: "U", v: EDIT, offset: 3.4 },
  { char: "R", v: HERO, offset: 6.7 },
  { char: "É", v: EDIT, offset: 9.5 },
  { char: "A", v: HERO, offset: 10.9 },
];

function letterMask(ch: string) {
  const c = encodeURIComponent(ch);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 130'%3E%3Ctext x='50' y='70' text-anchor='middle' dominant-baseline='central' font-family='Georgia,%20Cormorant%20Garamond,serif' font-weight='600' font-size='118' fill='white'%3E${c}%3C/text%3E%3C/svg%3E")`;
}

function Letter({ char, v, offset }: { char: string; v: typeof HERO; offset: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const seeded = useRef(false);
  const mask = letterMask(char);

  const seed = () => {
    const el = ref.current;
    if (!el || seeded.current) return;
    try {
      el.currentTime = offset;
      seeded.current = true;
      el.play().catch(() => {});
    } catch {
      /* ignore */
    }
  };

  return (
    <span className="relative block flex-1 min-w-0 aspect-[100/130]">
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={v.poster}
        onLoadedMetadata={seed}
        onLoadedData={seed}
        onCanPlay={seed}
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      >
        <source src={v.src} type="video/mp4" />
      </video>
    </span>
  );
}

export function VideoText() {
  return (
    <section className="relative bg-[#F7F3EC] py-20 sm:py-28 overflow-hidden">
      <div className="text-center mb-8">
        <p className="text-gold/60 text-[11px] tracking-[0.5em] uppercase">The Maison</p>
      </div>

      <div
        dir="ltr"
        className="mx-auto flex w-full max-w-[840px] items-center justify-center gap-[1.2vw] px-6"
      >
        {LETTERS.map((l, i) => (
          <Letter key={i} char={l.char} v={l.v} offset={l.offset} />
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-white/40 text-sm tracking-[0.25em] uppercase">
          Fine Jewelry · Handcrafted in Israel
        </p>
      </div>
    </section>
  );
}
