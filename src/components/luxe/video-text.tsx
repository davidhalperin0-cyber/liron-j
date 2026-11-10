"use client";

// Showcase finale: the giant word LUZ, each letter a window onto a close-up of a real piece.

const LETTERS: { char: string; src: string; origin: string }[] = [
  { char: "L", src: "/images/display/aurea-647CAE30.webp", origin: "50% 58%" },
  { char: "U", src: "/images/display/aurea-EB688B32.webp", origin: "50% 56%" },
  { char: "Z", src: "/images/display/aurea-8932B791.webp", origin: "50% 38%" },
];

function letterMask(ch: string) {
  const c = encodeURIComponent(ch);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 130'%3E%3Ctext x='50' y='70' text-anchor='middle' dominant-baseline='central' font-family='Georgia,%20Cormorant%20Garamond,serif' font-weight='600' font-size='118' fill='white'%3E${c}%3C/text%3E%3C/svg%3E")`;
}

function Letter({ char, src, origin }: { char: string; src: string; origin: string }) {
  const mask = letterMask(char);
  return (
    <span
      className="relative block aspect-[100/130] min-w-0 flex-1 overflow-hidden"
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scale(2.3)", transformOrigin: origin }}
      />
    </span>
  );
}

export function VideoText() {
  return (
    <section className="relative overflow-hidden bg-[#F7F3EC] py-20 sm:py-28">
      <div className="mb-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.5em] text-gold/60">The Maison</p>
      </div>

      <div dir="ltr" className="mx-auto flex w-full max-w-[840px] items-center justify-center gap-[1.2vw] px-6">
        {LETTERS.map((l) => (
          <Letter key={l.char} {...l} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-white/40">Fine Jewelry · Handcrafted in Israel</p>
      </div>
    </section>
  );
}
