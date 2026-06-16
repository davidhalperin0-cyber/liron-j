"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function Instagram({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const HANDLE = "aurea_jewelry_il";
const PROFILE = `https://www.instagram.com/${HANDLE}`;

interface Post {
  id: string;
  image: string;
  permalink: string;
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]));
  }, []);

  return (
    <section className="py-24 sm:py-32 bg-[#F7F3EC]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4">Instagram</p>
          <a
            href={PROFILE}
            target="_blank"
            rel="noreferrer"
            className="font-display text-3xl sm:text-4xl text-white/90 hover:text-gold transition-colors"
          >
            @{HANDLE}
          </a>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {posts.map((p, i) => (
              <motion.a
                key={p.id}
                href={p.permalink}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-square overflow-hidden bg-cream"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt="Instagram"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Instagram size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))}
          </div>
        ) : (
          // Graceful fallback — elegant follow CTA (shown until a token is set)
          <div className="text-center">
            <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-8">
              עקבו אחרינו לרגעים מאחורי הקלעים, השראה, וקולקציות חדשות לפני כולם.
            </p>
            <a
              href={PROFILE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-gold/30 text-gold text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-black transition-colors duration-300"
            >
              <Instagram size={16} />
              עקבו באינסטגרם
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
