import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getAllActiveProducts, getFeaturedProducts, getProductsByCategory } from "@/lib/db/products";
import type { ProductCard } from "@/types";

// ─── Intent Detection ─────────────────────────────────────

type Intent =
  | "greeting"
  | "search"
  | "category_browse"
  | "price_range"
  | "recommendation"
  | "gift"
  | "size_help"
  | "shipping"
  | "returns"
  | "material_info"
  | "care"
  | "unknown";

interface DetectedIntent {
  intent: Intent;
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

const GREETING_PATTERNS = /^(היי|הי|שלום|בוקר טוב|ערב טוב|אהלן|מה קורה|הלו|hello|hi|hey)/i;

const CATEGORY_MAP: Record<string, string> = {
  טבעת: "rings", טבעות: "rings", ring: "rings", rings: "rings",
  עגיל: "earrings", עגילים: "earrings", earring: "earrings", earrings: "earrings",
  שרשרת: "necklaces", שרשראות: "necklaces", necklace: "necklaces", necklaces: "necklaces",
  צמיד: "bracelets", צמידים: "bracelets", bracelet: "bracelets", bracelets: "bracelets",
  פירסינג: "piercings", piercings: "piercings",
};

const GIFT_PATTERNS = /מתנה|gift|יום הולדת|birthday|חג|אירוע|anniversary|יום נישואין|הפתעה/i;
const SIZE_PATTERNS = /מידה|מידות|size|guide|איזה מידה|מידה שלי/i;
const SHIPPING_PATTERNS = /משלוח|shipping|delivery|הגעה|כמה זמן|מתי יגיע|עולה משלוח/i;
const RETURNS_PATTERNS = /החזרה|החלפה|return|exchange|להחזיר|להחליף/i;
const MATERIAL_PATTERNS = /חומר|זהב|כסף|gold|silver|יהלום|diamond|אבן|gemstone|קראט|karat/i;
const CARE_PATTERNS = /טיפול|לנקות|clean|care|שמירה|maintain|תחזוקה/i;
const PRICE_PATTERNS = /מחיר|עולה|כמה|price|cost|budget|תקציב|זול|יקר|cheap|expensive/i;
const BROWSE_PATTERNS = /מעניין|יפה|מיוחד|ייחודי|אחר|שונה|חדש|מה יש|תראה|תראי|הראה|הראי|להתרשם|לראות|interesting|unique|special|browse|show me|something/i;
const RECOMMENDATION_PATTERNS = /מומלץ|recommend|הכי טוב|best|popular|פופולרי|אהוב|מומלצת|מומלץ|מה כדאי|מה את ממליצה|מה אתה ממליץ|מה ממליצים/i;

function extractPriceRange(message: string): { min?: number; max?: number } {
  const upTo = message.match(/עד\s*(\d[\d,]*)/);
  const from = message.match(/מ[- ]?(\d[\d,]*)/);
  const between = message.match(/(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)/);

  if (between) {
    return { min: parseInt(between[1].replace(/,/g, "")), max: parseInt(between[2].replace(/,/g, "")) };
  }
  return {
    min: from ? parseInt(from[1].replace(/,/g, "")) : undefined,
    max: upTo ? parseInt(upTo[1].replace(/,/g, "")) : undefined,
  };
}

function detectIntent(message: string): DetectedIntent {
  const lower = message.trim().toLowerCase();

  if (GREETING_PATTERNS.test(lower)) return { intent: "greeting" };
  if (CARE_PATTERNS.test(lower)) return { intent: "care" };
  if (SIZE_PATTERNS.test(lower)) return { intent: "size_help" };
  if (SHIPPING_PATTERNS.test(lower)) return { intent: "shipping" };
  if (RETURNS_PATTERNS.test(lower)) return { intent: "returns" };
  if (GIFT_PATTERNS.test(lower)) return { intent: "gift", query: lower };

  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) {
      return { intent: "category_browse", category };
    }
  }

  if (BROWSE_PATTERNS.test(lower)) return { intent: "recommendation" };
  if (RECOMMENDATION_PATTERNS.test(lower)) return { intent: "recommendation" };

  if (PRICE_PATTERNS.test(lower)) {
    const { min, max } = extractPriceRange(lower);
    return { intent: "price_range", minPrice: min, maxPrice: max, query: lower };
  }

  if (MATERIAL_PATTERNS.test(lower)) return { intent: "search", query: lower };

  if (lower.length > 1) return { intent: "search", query: lower };

  return { intent: "unknown" };
}

// ─── Response Generation ──────────────────────────────────
// Tone: quiet, concise, confident. No emojis. No exclamation marks.
// Think: luxury boutique advisor, not customer support chatbot.

function formatPrice(price: number): string {
  return `₪${price.toLocaleString("he-IL")}`;
}

function productToResponse(p: ProductCard) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name.he,
    nameEn: p.name.en,
    price: p.price,
    priceFormatted: formatPrice(p.price),
    compareAtPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
    image: p.image,
    material: p.material,
    isNew: p.isNew,
    isLimited: p.isLimited,
  };
}

function filterByPrice(products: ProductCard[], min?: number, max?: number) {
  return products.filter((p) => {
    if (min && p.price < min) return false;
    if (max && p.price > max) return false;
    return true;
  });
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const detected = detectIntent(message);
    let reply = "";
    let products: ProductCard[] = [];

    switch (detected.intent) {
      case "greeting":
        reply = "שלום. איך אוכל לסייע לך היום?";
        break;

      case "category_browse":
        if (detected.category) {
          products = await getProductsByCategory(detected.category);
          const catNames: Record<string, string> = {
            rings: "טבעות", earrings: "עגילים", necklaces: "שרשראות",
            bracelets: "צמידים", piercings: "פירסינג",
          };
          const name = catNames[detected.category] || detected.category;
          if (products.length > 0) {
            reply = `בחרתי כמה מה${name} שכדאי לראות.`;
          } else {
            reply = `הקולקציה של ה${name} מתעדכנת בקרוב. יש כיוון אחר שמעניין?`;
          }
        }
        break;

      case "price_range":
        products = await getAllActiveProducts();
        products = filterByPrice(products, detected.minPrice, detected.maxPrice);
        if (products.length > 0) {
          const rangeText = detected.maxPrice
            ? `עד ${formatPrice(detected.maxPrice)}`
            : detected.minPrice
            ? `מ-${formatPrice(detected.minPrice)}`
            : "";
          reply = `הנה מבחר מדויק ${rangeText}. כל פריט נבחר בקפידה.`;
        } else {
          reply = "לא מצאתי התאמה בטווח הזה. אפשר לספר עוד על מה שמחפשים ואמצא את הפריט הנכון.";
        }
        break;

      case "recommendation":
        products = await getFeaturedProducts(4);
        reply = "הנה כמה פריטים שכדאי לראות.";
        break;

      case "gift":
        products = await getFeaturedProducts(4);
        reply = "לאיזה אירוע? בינתיים, הנה הפריטים שנבחרים הכי הרבה כמתנה.";
        break;

      case "size_help":
        reply = `טבלת מידות מהירה לטבעות:

מידה 6 — קוטר 16.5 מ״מ
מידה 7 — קוטר 17.3 מ״מ
מידה 8 — קוטר 18.1 מ״מ
מידה 9 — קוטר 19.0 מ״מ

הדרך הפשוטה למדוד — לכרוך חוט דק סביב האצבע ולמדוד את האורך. בין שתי מידות? עדיף הגדולה.

צריך עזרה למצוא פריט במידה ספציפית?`;
        break;

      case "shipping":
        reply = `משלוח חינם מעל ₪500.

רגיל: 3–5 ימי עסקים
אקספרס: 1–2 ימי עסקים
בינלאומי: 7–14 ימי עסקים

כל הזמנה מגיעה באריזת מתנה.`;
        break;

      case "returns":
        reply = `14 יום להחזרה, ללא שאלות.

המוצר צריך להגיע במצב מקורי. ההחזר הכספי מתבצע תוך 14 ימי עסקים. החלפות — ללא עלות נוספת.`;
        break;

      case "material_info":
        reply = `אנחנו עובדים עם זהב 14K ו-18K בשלושה גוונים — צהוב, לבן ורוזה. כסף סטרלינג 925. אבני חן אמיתיות בלבד — יהלומים, ספירים, אמרלדים.

כל תכשיט מגיע עם תעודת אותנטיות ואחריות לכל החיים.

יש חומר מסוים שמעניין אותך?`;
        break;

      case "care":
        reply = `כמה כללים פשוטים לשמירה על התכשיט:

להסיר לפני מקלחת, שינה ופעילות גופנית. להימנע ממגע עם בשמים וקרמים. לנקות עם מטלית רכה ויבשה. לאחסן כל תכשיט בנפרד.

זהב אפשר לנקות גם עם מים פושרים וסבון עדין.`;
        break;

      case "search":
        if (detected.query) {
          products = await searchProducts(detected.query);
          if (products.length > 0) {
            reply = "הנה מה שמצאתי.";
          } else {
            // No exact match — show curated picks instead of a dead end
            products = await getFeaturedProducts(3);
            reply = products.length > 0
              ? "לא מצאתי התאמה מדויקת, אבל הנה כמה פריטים שאולי יעניינו. אפשר לפרט יותר ואכוון טוב יותר."
              : "לא מצאתי התאמה מדויקת. אפשר לפרט יותר ואכוון טוב יותר.";
          }
        }
        break;

      default:
        reply = "אפשר לשאול על תכשיטים, מידות, חומרים, משלוח, או לבקש המלצה.";
        break;
    }

    return NextResponse.json({
      reply,
      products: products.slice(0, 3).map(productToResponse), // curated: max 3, not 6
    });
  } catch (error) {
    console.error("[chat] error:", error);
    return NextResponse.json(
      { reply: "משהו לא עבד כרגע. אפשר לנסות שוב בעוד רגע.", products: [] },
      { status: 500 }
    );
  }
}
