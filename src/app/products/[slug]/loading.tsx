export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header skeleton */}
      <div className="h-16 bg-charcoal/50 border-b border-white/5" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image skeleton */}
          <div className="aspect-square bg-charcoal animate-pulse rounded-sm" />

          {/* Info skeleton */}
          <div className="space-y-6 pt-4">
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-20 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-px bg-white/5" />
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-24 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-14 bg-gold/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
