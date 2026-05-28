import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-sm text-gold tracking-widest uppercase mb-6">
            404
          </p>

          <h1 className="font-display text-3xl md:text-4xl text-white mb-4">
            הדף לא נמצא
          </h1>

          <p className="text-white/50 text-sm leading-relaxed mb-10">
            הדף שחיפשת אינו קיים או שהוסר.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="border border-gold text-gold px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-black transition-colors duration-300"
            >
              עמוד הבית
            </Link>
            <Link
              href="/collections"
              className="border border-white/20 text-white/50 px-8 py-3 text-xs tracking-widest uppercase hover:border-white/40 hover:text-white transition-colors duration-300"
            >
              הקולקציות
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
