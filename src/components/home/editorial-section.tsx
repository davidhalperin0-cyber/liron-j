"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EditorialSection() {
  return (
    <section className="relative overflow-hidden bg-[#EFE6DA] py-16 sm:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
        >
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold/80">הסיפור שלנו</p>
          <h2 className="mb-8 font-display text-4xl leading-[1.1] text-white sm:text-6xl lg:text-7xl">
            מלאכת יד
            <br />
            <span className="text-gradient-gold">ללא פשרות</span>
          </h2>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-white/65">
            כל תכשיט מעוצב בקפידה — ציפוי זהב עמיד, כסף 925 וזרקונים שנבחרו אחד-אחד. אנחנו לא מתפשרים על שום פרט.
          </p>
          <Link href="/about">
            <Button variant="outline" size="lg">
              גלו עוד
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="relative mx-auto aspect-[4/5] w-full max-w-[480px] overflow-hidden rounded-[2px]"
        >
          <Image
            src="/images/display/aurea-0170D983.webp"
            alt="צמיד LUZ — זרקונים שנבחרו אחד-אחד"
            fill
            sizes="(max-width: 1024px) 90vw, 480px"
            className="object-cover"
          />
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
