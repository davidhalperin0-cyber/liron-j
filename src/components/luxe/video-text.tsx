"use client";

// Showcase finale — the cinematic video plays INSIDE the giant word "AURÉA".
// The video is alpha-masked by an SVG of the word; everything outside the
// letters is the ivory page. Pure CSS mask, no WebGL.

const TEXT_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Ctext x='600' y='205' text-anchor='middle' dominant-baseline='central' font-family='Georgia,%20Cormorant%20Garamond,serif' font-weight='600' font-size='300' letter-spacing='10' fill='white'%3EAUR%C3%89A%3C/text%3E%3C/svg%3E\")";

export function VideoText() {
  return (
    <section className="relative bg-[#F7F3EC] py-20 sm:py-28 overflow-hidden">
      <div className="text-center mb-8">
        <p className="text-gold/60 text-[11px] tracking-[0.5em] uppercase">
          The Maison
        </p>
      </div>

      <div className="relative mx-auto h-[32vw] min-h-[200px] max-h-[540px] w-full max-w-[1300px]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/hero-poster.jpg"
          style={{
            WebkitMaskImage: TEXT_MASK,
            maskImage: TEXT_MASK,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        >
          <source src="/videos/editorial.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="text-center mt-8">
        <p className="text-white/40 text-sm tracking-[0.25em] uppercase">
          Fine Jewelry · Handcrafted in Israel
        </p>
      </div>
    </section>
  );
}
