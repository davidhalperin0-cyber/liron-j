// Editorial running-text band — slow infinite marquee of brand promises,
// separated by gold diamond marks. Pure CSS animation, no JS.

const VALUES = [
  "משלוח חינם מעל ₪500",
  "אחריות לכל החיים",
  "תעודת אותנטיות",
  "אריזת מתנה יוקרתית",
  "14 יום להחזרה",
];

function Row() {
  return (
    <div className="flex items-center gap-10 px-5 shrink-0">
      {VALUES.map((v) => (
        <span key={v} className="flex items-center gap-10 shrink-0">
          <span className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-white/55 whitespace-nowrap">
            {v}
          </span>
          <span className="text-gold/50 text-[10px]" aria-hidden>
            ◇
          </span>
        </span>
      ))}
    </div>
  );
}

export function ValueMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-gold/10 bg-cream/40 py-5">
      <div className="flex w-max luxe-marquee">
        <Row />
        <Row />
        <Row />
        <Row />
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-r from-[#F7F3EC] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-l from-[#F7F3EC] to-transparent" />
    </section>
  );
}
