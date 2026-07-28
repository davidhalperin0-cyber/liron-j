"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// ─── לזכר אופק ז״ל ──────────────────────────────────────────────
// A compact memorial tribute on the homepage, in the site's light
// (cream) palette. All proceeds from the dedicated piece are donated.
// NOTE: this theme remaps the `white`/`black` Tailwind tokens, so we use
// literal color values here to stay in full control of the contrast.

const PHOTO = "/images/ofek.jpg";
const NECKLACE_IMG = "/images/ofek-necklace.png";
const NECKLACE_SLUG = "ofek"; // dedicated necklace product

const GOLD = "#B89B5E";
const PAPER = "#F7F3EC"; // site cream background
const INK = "rgb(28,25,21)"; // site dark ink (headings)
const TXT = "rgba(28,25,21,0.66)"; // body text
const TXT_SOFT = "rgba(28,25,21,0.48)"; // captions

const PARAGRAPHS = [
  "אופק היה חיוך וקסם. שמח, מלא חיים, כזה שידע להפוך כל רגע לכיף. בחור של ים, של טבע, של שרשראות חרוזים וצמידים — עם סטייל שהיה פשוט חלק ממנו.",
  "אבל יותר מהכול, אופק היה איש של אנשים. עם לב ענק. אם מישהו הרגיש לבד או התקשה — אופק היה הראשון לעצור הכול ולהיות שם, ולהעניק לכל מי שסביבו תחושה שהוא חשוב.",
  "אופק שירת כלוחם בצנחנים, אהב את האופנוע שלו ואת בית״ר ירושלים. ב־7 באוקטובר 2023 נרצח במסיבת הנובה. לפי בני משפחתו, ברגעי האימה פעל באומץ כדי להגן על שתי צעירות שהיו איתו — גם ברגעים הקשים ביותר, בחר לחשוב קודם על אחרים.",
];

export function OfekTributeSection() {
  return (
    <section
      className="border-y py-16 sm:py-20 px-4 sm:px-6"
      style={{ backgroundColor: PAPER, borderColor: "rgba(28,25,21,0.08)" }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Eyebrow + quote */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: GOLD }}>
            לזכרו
          </p>
          <p className="font-display text-xl sm:text-2xl leading-snug max-w-2xl mx-auto" style={{ color: INK }}>
            „יש אנשים שנכנסים לחדר, ויש אנשים שנכנסים ללב.
            <span style={{ color: GOLD }}> אופק היה שניהם.”</span>
          </p>
        </motion.div>

        {/* Photo (left) + text (right) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row-reverse gap-6 sm:gap-8 items-center sm:items-start"
        >
          {/* Portrait — left (row-reverse in the RTL page puts the first child on the left) */}
          <div className="shrink-0 w-full sm:w-[240px] max-w-[280px]">
            <div
              className="relative aspect-[4/5] rounded-xl overflow-hidden border"
              style={{ borderColor: "rgba(184,155,94,0.35)" }}
            >
              <Image src={PHOTO} alt="אופק ז״ל" fill sizes="280px" className="object-cover" />
            </div>
            <div className="text-center mt-3">
              <h3 className="font-display text-2xl tracking-wide" style={{ color: INK }}>
                אופק
              </h3>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: TXT_SOFT }}>
                הי״ד · נרצח במסיבת הנובה · 7.10.2023
              </p>
            </div>
          </div>

          {/* Text — right */}
          <div className="flex-1 space-y-4">
            {PARAGRAPHS.map((p, i) => (
              <p key={i} className="text-[14px] sm:text-[15px] leading-[1.85]" style={{ color: TXT }}>
                {p}
              </p>
            ))}
            <p className="text-[14px] sm:text-[15px] leading-[1.85]" style={{ color: "rgba(28,25,21,0.72)" }}>
              החיוך שלו והלב הענק שלו ממשיכים לחיות בלב כל מי שהכיר אותו.
            </p>
          </div>
        </motion.div>

        {/* Dedicated piece — all proceeds donated */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-xl border p-4 sm:p-5 flex items-center gap-4 sm:gap-5"
          style={{ borderColor: "rgba(184,155,94,0.35)", backgroundColor: "rgba(255,255,255,0.5)" }}
        >
          <Link
            href={NECKLACE_SLUG ? `/products/${NECKLACE_SLUG}` : "#"}
            className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-white block"
            aria-label="לעמוד השרשרת של אופק"
          >
            <Image
              src={NECKLACE_IMG}
              alt="השרשרת של אופק — תליון זנב לוויתן"
              width={192}
              height={192}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: GOLD }}>
              השרשרת של אופק
            </p>
            <h4 className="font-display text-base sm:text-lg leading-snug" style={{ color: INK }}>
              כל ההכנסות מוקדשות לתרומה לזכרו
            </h4>
          </div>
          {NECKLACE_SLUG ? (
            <Link
              href={`/products/${NECKLACE_SLUG}`}
              className="shrink-0 inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD, color: "#fff" }}
            >
              לשרשרת
            </Link>
          ) : (
            <span
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full border text-xs sm:text-sm"
              style={{ borderColor: "rgba(184,155,94,0.5)", color: GOLD }}
            >
              בקרוב
            </span>
          )}
        </motion.div>

        {/* Closing */}
        <p className="text-center mt-10 text-sm tracking-[0.2em]" style={{ color: "rgba(28,25,21,0.55)" }}>
          יהי זכרו ברוך 🕯️
        </p>
      </div>
    </section>
  );
}
