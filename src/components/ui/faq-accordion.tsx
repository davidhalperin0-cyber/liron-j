"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <div key={category.title}>
          <h2 className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-6">
            {category.title}
          </h2>
          <div className="space-y-2">
            {category.items.map((item) => {
              const id = `${category.title}-${item.question}`;
              const isOpen = openItem === id;

              return (
                <div
                  key={id}
                  className={`rounded-lg border transition-colors duration-300 ${
                    isOpen
                      ? "border-gold/20 bg-charcoal"
                      : "border-white/5 bg-charcoal/50"
                  }`}
                >
                  <button
                    onClick={() => toggle(id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isOpen ? "text-gold" : "text-white/80"
                      }`}
                    >
                      {item.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "rotate-180 text-gold"
                          : "rotate-0 text-white/30"
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm text-white/50 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
