import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FaqAccordion } from "@/components/ui/faq-accordion";

export const metadata: Metadata = {
  title: "שאלות נפוצות | AURÉA",
  description:
    "תשובות לשאלות הנפוצות ביותר על תכשיטי AURÉA - משלוחים, החזרות, מוצרים ותשלום.",
};

const FAQ_CATEGORIES = [
  {
    title: "משלוחים",
    items: [
      {
        question: "כמה זמן לוקח משלוח?",
        answer:
          "משלוח רגיל 3-5 ימי עסקים, משלוח אקספרס 1-2 ימי עסקים.",
      },
      {
        question: "כמה עולה משלוח?",
        answer:
          "משלוח חינם בהזמנות מעל ₪500, אחרת ₪30.",
      },
      {
        question: "האם אתם שולחים לחו״ל?",
        answer:
          "כן, משלוח בינלאומי זמין. זמן אספקה 7-14 ימי עסקים.",
      },
    ],
  },
  {
    title: "החזרות והחלפות",
    items: [
      {
        question: "מה מדיניות ההחזרה?",
        answer:
          "14 יום להחזרה מלאה, המוצר חייב להיות במצב מקורי.",
      },
      {
        question: "איך מחזירים מוצר?",
        answer:
          "צרי קשר עם שירות הלקוחות ונשלח תווית החזרה.",
      },
      {
        question: "תוך כמה זמן אקבל החזר כספי?",
        answer:
          "עד 14 ימי עסקים מרגע קבלת המוצר בחזרה.",
      },
    ],
  },
  {
    title: "מוצרים",
    items: [
      {
        question: "מאיזה חומרים התכשיטים?",
        answer:
          "ציפוי זהב וציפוי רוז גולד איכותיים, כסף 925 וזרקונים נוצצים. בקו הגברים — אבנים טבעיות (אוניקס, עין הנמר, לבה ועוד), צדף טבעי ופלדת אל-חלד.",
      },
      {
        question: "האם יש אחריות?",
        answer: "כן — אחריות על פגמי ייצור, ובנוסף 14 יום להחזרה על כל פריט.",
      },
      {
        question: "איך אני יודעת את המידה שלי?",
        answer:
          "ניתן להשתמש במדריך המידות באתר או לפנות לייעוץ אישי.",
      },
    ],
  },
  {
    title: "תשלום",
    items: [
      {
        question: "אילו אמצעי תשלום מקבלים?",
        answer: "כרטיסי אשראי, Apple Pay, Google Pay.",
      },
      {
        question: "האם אפשר לשלם בתשלומים?",
        answer: "כן, עד 3 תשלומים ללא ריבית.",
      },
      {
        question: "האם האתר מאובטח?",
        answer: "כן, כל העסקאות מוצפנות בתקן SSL.",
      },
    ],
  },
];

function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
  };
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartDrawer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }}
      />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">
              שאלות נפוצות
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              איך נוכל לעזור?
            </h1>
          </div>

          <FaqAccordion categories={FAQ_CATEGORIES} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
