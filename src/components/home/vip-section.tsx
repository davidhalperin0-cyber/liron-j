"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Sparkles, Star } from "lucide-react";

const PERKS = [
  { icon: Crown, title: "גישה מוקדמת", desc: "לקולקציות חדשות לפני כולם" },
  { icon: Gift, title: "מתנות יום הולדת", desc: "הפתעה מיוחדת בכל שנה" },
  { icon: Sparkles, title: "הנחות בלעדיות", desc: "עד 20% הנחה לחברי מועדון" },
  { icon: Star, title: "אירועים פרטיים", desc: "הזמנה לאירועי השקה" },
];

export function VipSection() {
  return (
    <section className="py-24 sm:py-32 bg-black relative overflow-hidden">
      {/* Gold gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gold/[0.03] to-black" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold/60 text-xs tracking-[0.5em] uppercase mb-4">
              הצטרפו למועדון
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide text-white mb-6">
              Liron J <span className="text-gradient-gold">VIP</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-12 max-w-xl mx-auto">
              הצטרפו למועדון הלקוחות הבלעדי שלנו ותיהנו מהטבות מיוחדות, גישה מוקדמת ומתנות.
            </p>
          </motion.div>

          {/* Perks Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {PERKS.map((perk, index) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-light p-6 text-center"
              >
                <perk.icon size={24} className="text-gold mx-auto mb-3" />
                <h3 className="text-sm font-medium text-white mb-1">{perk.title}</h3>
                <p className="text-xs text-white/40">{perk.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="כתובת אימייל"
              className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
            <Button variant="gold" size="lg">
              הצטרפות
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
