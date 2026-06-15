"use client";

import { useRef } from "react";

// AURÉA wordmark where each letter is its own window into the brand film —
// and every letter plays the video from a different time offset, so the word
// shimmers with different fragments at once. Falls back to the poster frame.

const VIDEO_SRC = "/videos/hero.mp4";
const POSTER = "/videos/hero-poster.jpg";

// char + a desynced start time (seconds) so no two letters match.
const LETTERS: { char: string; offset: number }[] = [
  { char: "A", offset: 0.4 },
  { char: "U", offset: 2.6 },
  { char: "R", offset: 5.0 },
  { char: "É", offset: 7.3 },
  { char: "A", offset: 9.6 },
];

function letterMask(ch: string) {
  const c = encodeURIComponent(ch);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 130'%3E%3Ctext x='50' y='70' text-anchor='middle' dominant-baseline='central' font-family='Georgia,%20Cormorant%20Garamond,serif' font-weight='600' font-size='118' fill='white'%3E${c}%3C/text%3E%3C/svg%3E")`;
}

function Letter({ char, offset }: { char: string; offset: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const seeded = useRef(false);
  const mask = letterMask(char);

  // Seed this letter's playback to its own moment in the film. Re-apply each
  // loop so the letters never drift back into sync.
  const seed = () => {
    const v = ref.current;
    if (!v) return;
    try {
      if (!seeded.current) {
        v.currentTime = offset;
        seeded.current = true;
        v.play().catch(() => {});
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <span className="relative block h-full aspect-[100/130]">
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
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
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
    </span>
  );
}

export function VideoWordmark() {
  return (
    <span
      dir="ltr"
      aria-label="AURÉA"
      className="flex items-center gap-[0.12em] h-[22px] sm:h-[28px] select-none [filter:drop-shadow(0_1px_2px_rgba(28,25,21,0.28))]"
    >
      {LETTERS.map((l, i) => (
        <Letter key={i} char={l.char} offset={l.offset} />
      ))}
    </span>
  );
}
