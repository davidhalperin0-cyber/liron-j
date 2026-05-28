"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl text-white mb-4">שגיאה</h1>
        <p className="text-white/40 mb-8">
          משהו השתבש. נסי לרענן את הדף או לחזור לדף הבית.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-gold text-black text-sm font-medium hover:bg-gold-light transition-colors"
          >
            נסי שוב
          </button>
          <a
            href="/"
            className="px-6 py-2.5 border border-white/10 text-white/60 text-sm hover:border-white/30 transition-colors"
          >
            דף הבית
          </a>
        </div>
      </div>
    </div>
  );
}
