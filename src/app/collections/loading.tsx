export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header skeleton */}
      <div className="h-16 bg-charcoal/50 border-b border-white/5" />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title skeleton */}
          <div className="text-center mb-16">
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse mx-auto mb-4" />
            <div className="h-10 w-64 bg-white/5 rounded animate-pulse mx-auto" />
          </div>

          {/* Grid skeleton */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-charcoal rounded-sm animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
