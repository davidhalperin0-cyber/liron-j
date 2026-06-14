// Oversized kinetic brand statement — giant outlined serif scrolling across
// the viewport. Pure CSS, RTL-aware, reduced-motion safe.

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
  return (
    <section className="relative overflow-hidden bg-[#F4EFE6] py-12 sm:py-20">
      <div className="flex w-max luxe-kinetic">
        <Track />
        <Track />
      </div>
    </section>
  );
}
