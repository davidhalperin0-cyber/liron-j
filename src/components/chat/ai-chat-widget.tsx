"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────

interface ConciergeProduct {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  price: number;
  priceFormatted: string;
  compareAtPrice?: string;
  image: string;
  material?: string;
  isNew?: boolean;
  isLimited?: boolean;
}

interface ConciergeMessage {
  id: string;
  role: "user" | "concierge";
  text: string;
  products?: ConciergeProduct[];
  timestamp: Date;
}

// ─── Curated suggestion prompts ───────────────────────────

const SUGGESTIONS = [
  "אני מחפשת טבעת",
  "המלצה למתנה",
  "באיזה חומרים אתם עובדים",
];

// ─── Product Card — editorial, not catalog ────────────────

function ProductRecommendation({ product }: { product: ConciergeProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div className="flex gap-4 py-3">
        <div className="w-16 h-20 shrink-0 bg-charcoal overflow-hidden relative">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p className="text-[13px] text-white/80 leading-snug group-hover:text-white transition-colors">
            {product.name}
          </p>
          {product.material && (
            <p className="text-[11px] text-white/30 mt-0.5">{product.material}</p>
          )}
          <p className="text-[13px] text-gold/80 mt-1 font-light tracking-wide">
            {product.priceFormatted}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Message rendering — typography-first ─────────────────

function Message({ message }: { message: ConciergeMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "concierge-message",
        isUser ? "flex justify-start" : "flex justify-end"
      )}
    >
      <div className={cn("max-w-[88%] space-y-3")}>
        <p
          className={cn(
            "text-[13px] leading-[1.7] whitespace-pre-line",
            isUser
              ? "text-white/60 font-light"
              : "text-white/90"
          )}
        >
          {message.text}
        </p>

        {/* Product recommendations — curated, not listed */}
        {message.products && message.products.length > 0 && (
          <div className="divide-y divide-white/[0.04]">
            {message.products.map((product) => (
              <ProductRecommendation key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quiet entrance — fade in after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to latest
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen) {
      const width = window.innerWidth;
      if (width < 640) {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
      }
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ConciergeMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim() }),
        });

        const data = await res.json();

        const conciergeMsg: ConciergeMessage = {
          id: `c-${Date.now()}`,
          role: "concierge",
          text: data.reply || "אנא נסי שוב.",
          products: data.products,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, conciergeMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "concierge",
            text: "לא הצלחתי להתחבר כרגע. אפשר לנסות שוב.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  if (!visible) return null;

  return (
    <>
      {/* ── Jewelry Concierge Panel ──────────────────────────────── */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen
            ? "inset-0 sm:inset-auto sm:bottom-6 sm:end-6 sm:w-[400px] sm:h-[600px] opacity-100"
            : "pointer-events-none opacity-0 translate-y-3 sm:bottom-6 sm:end-6 sm:w-[400px] sm:h-[600px]"
        )}
      >
        <div className="flex flex-col h-full bg-[#0c0c0c] sm:border sm:border-white/[0.06] overflow-hidden">

          {/* Header — minimal, architectural */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/25">
                Jewelry Concierge
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 -m-2 text-white/25 hover:text-white/60 transition-colors duration-300"
              aria-label="סגירה"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              /* Empty state — editorial, not chatbot-y */
              <div className="h-full flex flex-col justify-end">
                <div className="space-y-8">
                  <div>
                    <p className="text-[13px] text-white/70 leading-[1.8]">
                      שלום. אפשר לעזור למצוא תכשיט, להמליץ על מתנה, או לייעץ בנוגע לחומרים ומידות.
                    </p>
                  </div>

                  {/* Suggestions — quiet, not pushy */}
                  <div className="space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="block w-full text-start px-4 py-3 text-[12px] text-white/40 border border-white/[0.06] hover:border-white/[0.12] hover:text-white/60 transition-all duration-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <Message key={msg.id} message={msg} />
                ))}

                {/* Loading — subtle, not bouncing dots */}
                {isLoading && (
                  <div className="flex justify-end">
                    <div className="h-5 w-12 flex items-center justify-center gap-[3px]">
                      <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
                      <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse [animation-delay:200ms]" />
                      <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse [animation-delay:400ms]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input — clean, minimal */}
          <div className="px-6 py-4 border-t border-white/[0.04]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="איך אוכל לעזור?"
                className="flex-1 bg-transparent text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300",
                  input.trim()
                    ? "bg-white/10 text-white/70 hover:bg-white/15"
                    : "text-white/10"
                )}
                aria-label="שליחה"
              >
                <ArrowUp size={14} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Entry Point — architectural, not chatbot bubble ── */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-40 bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-auto sm:end-6",
          "sm:w-auto",
          "flex items-center justify-center gap-3",
          "px-6 py-3.5 sm:py-3",
          "bg-[#0c0c0c]/95 backdrop-blur-sm",
          "sm:border sm:border-white/[0.06]",
          "border-t border-white/[0.04] sm:border-t-0",
          "transition-all duration-500",
          "hover:border-white/[0.1]",
          "group",
          isOpen && "opacity-0 pointer-events-none translate-y-2"
        )}
        aria-label="Jewelry Concierge"
      >
        {/* Diamond icon — subtle, geometric */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="text-gold/50 group-hover:text-gold/70 transition-colors duration-300"
        >
          <path
            d="M7 0.5L13.5 7L7 13.5L0.5 7L7 0.5Z"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </svg>
        <span className="text-[11px] tracking-[0.2em] uppercase text-white/35 group-hover:text-white/55 transition-colors duration-300">
          Jewelry Concierge
        </span>
      </button>
    </>
  );
}
