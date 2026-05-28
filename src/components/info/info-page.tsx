import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

interface InfoPageProps {
  eyebrow: string;
  title: string;
  description: string;
  sections: { title: string; body: string }[];
}

export function InfoPage({ eyebrow, title, description, sections }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-5">
            {title}
          </h1>
          <p className="text-white/45 leading-relaxed mb-12">{description}</p>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-lg border border-white/5 bg-charcoal p-6"
              >
                <h2 className="text-lg text-white mb-2">{section.title}</h2>
                <p className="text-sm text-white/45 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
