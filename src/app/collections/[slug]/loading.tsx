export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header skeleton */}
      <div className="h-16 bg-charcoal/50 border-b border-white/5" />

      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Collection header skeleton */}
          <div className="text-center mb-12">
            <div className="h-3 w-24 bg-white/5 rounded animate-pulse mx-auto mb-4" />
            <div className="h-10 w-48 bg-white/5 rounded animate-pulse mx-auto mb-3" />
            <div className="h-4 w-72 bg-white/5 rounded animate-pulse mx-auto" />
          </div>

          {/* Products grid skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-charcoal rounded-sm animate-pulse" />
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
