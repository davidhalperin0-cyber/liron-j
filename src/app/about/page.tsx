"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import Link from "next/link";

const VALUES = [
  { title: "אומנות", description: "כל תכשיט נוצר בעבודת יד מדוקדקת, עם תשומת לב לכל פרט ופרט" },
  { title: "איכות", description: "אנחנו משתמשים רק בחומרים מהאיכות הגבוהה ביותר — זהב אמיתי ויהלומים טבעיים" },
  { title: "ייחודיות", description: "כל עיצוב הוא ייחודי ומקורי, נוצר כדי לספר סיפור אישי" },
  { title: "קיימות", description: "מחויבים לייצור אחראי ולשקיפות מלאה בשרשרת האספקה" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4"
          >
            הסיפור שלנו
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl text-white leading-tight"
          >
            האומנות של היוקרה
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            AURÉA נולד מתוך אהבה עמוקה לאומנות התכשיטים ורצון ליצור חוויית יוקרה שנגישה לכל אישה שמחפשת את המיוחד
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/5] bg-charcoal rounded-sm" />
          <div>
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">מי אנחנו</p>
            <h2 className="font-display text-3xl text-white mb-6">יצירת יופי שנשאר</h2>
            <div className="space-y-4 text-white/50 leading-relaxed">
              <p>
                אנחנו מאמינים שתכשיט הוא יותר מאקססורי — הוא ביטוי של אישיות, זיכרון שנשאר על העור, סיפור שעובר מדור לדור.
              </p>
              <p>
                כל תכשיט שלנו עובר תהליך עיצוב מדוקדק, מהשראה ראשונית דרך סקיצות ועד לייצור סופי בעבודת יד. אנחנו לא מתפשרים על איכות, כי אנחנו יודעים שהלקוחות שלנו מחפשות את הטוב ביותר.
              </p>
              <p>
                הצוות שלנו מורכב מעצבים, צורפים ומומחי אבני חן שחולקים חזון משותף — ליצור תכשיטים שגורמים לכל אישה להרגיש מיוחדת.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-charcoal/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">הערכים שלנו</p>
            <h2 className="font-display text-3xl text-white">מה מוביל אותנו</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <h3 className="font-display text-xl text-gold mb-3">{value.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl text-white mb-4">מוזמנת לגלות</h2>
          <p className="text-white/40 mb-8">גלי את הקולקציות שלנו ומצאי את התכשיט שמספר את הסיפור שלך</p>
          <Link
            href="/collections/all"
            className="inline-block px-8 py-3 bg-gold text-black text-sm font-medium tracking-wider uppercase hover:bg-gold/90 transition-colors"
          >
            לקולקציות
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
