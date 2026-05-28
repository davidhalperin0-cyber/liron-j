import type { ProductCard, ProductMedia } from "@/types";

export interface ProductDetail extends ProductCard {
  description: string;
  story: string;
  gemstone: string;
  weight: string;
  images: string[];
  media: ProductMedia;
  options: {
    colors: { id: string; name: string; value: string }[];
    sizes: string[];
  };
}

const SHARED_COLORS = [
  { id: "yellow", name: "זהב צהוב", value: "yellow" },
  { id: "white", name: "זהב לבן", value: "white" },
  { id: "rose", name: "זהב ורוד", value: "rose" },
];

const RING_360 = {
  url: "/images/products/dark-gold-ring-360-sheet.png",
  columns: 6,
  rows: 4,
  frames: 24,
  frameZoom: 1.16,
  frameOffsetY: -3,
};

export const PRODUCTS: ProductDetail[] = [
  {
    id: "celestial-diamond-ring",
    slug: "celestial-diamond-ring",
    name: { en: "Celestial Diamond Ring", he: "טבעת יהלום סלסטיאל" },
    description:
      "טבעת יהלום מרהיבה בהשראת כוכבי הלילה, עם מרכז נוצץ וכתר עדין של יהלומים קטנים.",
    story:
      "הטבעת הזו נולדה מתוך רגע של השראה בלילה חשוך על גג הסטודיו. כל זווית נבנתה כדי לתפוס אור אחר, כמו כוכב שנע בשמיים.",
    price: 6800,
    compareAtPrice: 7800,
    image: "/images/products/diamond-halo-ring.webp",
    images: [
      "/images/products/diamond-halo-ring.webp",
      "/images/products/emerald-pendant-necklace.webp",
      "/images/products/diamond-chandelier-earrings.webp",
      "/images/products/gold-diamond-cuff.webp",
    ],
    media: {
      sprite360: RING_360,
      images: [
        "/images/products/diamond-halo-ring.webp",
        "/images/products/emerald-pendant-necklace.webp",
        "/images/products/diamond-chandelier-earrings.webp",
        "/images/products/gold-diamond-cuff.webp",
      ],
    },
    material: "18K Gold",
    color: "yellow",
    gemstone: "Diamond 0.5ct",
    weight: "4.2g",
    isNew: true,
    options: { colors: SHARED_COLORS, sizes: ["5", "6", "7", "8", "9", "10"] },
  },
  {
    id: "diamond-huggie-earrings",
    slug: "diamond-huggie-earrings",
    name: { en: "Diamond Huggie Earrings", he: "עגילי חישוק יהלומים" },
    description: "עגילי חישוק מזהב לבן עם שיבוץ יהלומים נקי ונוכחות יומיומית יוקרתית.",
    story: "עיצוב מינימלי שנבנה סביב משחק אור קרוב לפנים, עם פרופורציה שמתאימה גם לערב וגם ליום.",
    price: 4500,
    image: "/images/products/diamond-chandelier-earrings.webp",
    images: ["/images/products/diamond-chandelier-earrings.webp", "/images/products/diamond-halo-ring.webp"],
    media: {
      model3dKind: "earrings",
      images: ["/images/products/diamond-chandelier-earrings.webp"],
    },
    material: "18K Gold",
    color: "white",
    gemstone: "Diamond pavé",
    weight: "3.1g",
    isFeatured: true,
    options: { colors: SHARED_COLORS, sizes: ["One Size"] },
  },
  {
    id: "north-star-ring",
    slug: "north-star-ring",
    name: { en: "North Star Ring", he: "טבעת כוכב הצפון" },
    description: "טבעת זהב עדינה עם יהלום מרכזי שמרגישה כמו סימן דרך אישי.",
    story: "השראה ממצפן עתיק: תכשיט קטן שמסמן כיוון, זיכרון וכוונה.",
    price: 2800,
    compareAtPrice: 3200,
    image: "/images/products/diamond-halo-ring.webp",
    images: ["/images/products/diamond-halo-ring.webp", "/images/products/gold-diamond-cuff.webp"],
    media: { model3dKind: "ring", images: ["/images/products/diamond-halo-ring.webp", "/images/products/gold-diamond-cuff.webp"] },
    material: "14K Gold",
    color: "yellow",
    gemstone: "Diamond",
    weight: "2.8g",
    isNew: true,
    options: { colors: SHARED_COLORS, sizes: ["5", "6", "7", "8", "9"] },
  },
  {
    id: "serpent-chain-necklace",
    slug: "serpent-chain-necklace",
    name: { en: "Serpent Chain Necklace", he: "שרשרת נחש" },
    description: "שרשרת זהב ורוד במרקם נחש רך, עם נפילה אלגנטית על הצוואר.",
    story: "נבנתה סביב תנועה: שרשרת שמחזירה אור גם כשהגוף כמעט לא זז.",
    price: 3900,
    image: "/images/products/emerald-pendant-necklace.webp",
    images: ["/images/products/emerald-pendant-necklace.webp", "/images/products/diamond-halo-ring.webp"],
    media: { model3dKind: "necklace", images: ["/images/products/emerald-pendant-necklace.webp", "/images/products/diamond-halo-ring.webp"] },
    material: "14K Gold",
    color: "rose",
    gemstone: "Emerald accent",
    weight: "5.6g",
    isLimited: true,
    options: { colors: SHARED_COLORS, sizes: ["40cm", "45cm", "50cm"] },
  },
  {
    id: "infinity-cuff",
    slug: "infinity-cuff",
    name: { en: "Infinity Cuff Bracelet", he: "צמיד אינפיניטי" },
    description: "צמיד קשיח מזהב צהוב עם יהלומים קטנים ומבנה פתוח ונקי.",
    story: "פריט הצהרה שקט: נוכחות חזקה בלי רעש, עם קווים עגולים וחמים.",
    price: 5100,
    image: "/images/products/gold-diamond-cuff.webp",
    images: ["/images/products/gold-diamond-cuff.webp", "/images/products/diamond-chandelier-earrings.webp"],
    media: { model3dKind: "bracelet", images: ["/images/products/gold-diamond-cuff.webp", "/images/products/diamond-chandelier-earrings.webp"] },
    material: "18K Gold",
    color: "yellow",
    gemstone: "Diamond accents",
    weight: "8.4g",
    isLimited: true,
    options: { colors: SHARED_COLORS, sizes: ["S", "M", "L"] },
  },
  {
    id: "cascade-earrings",
    slug: "cascade-earrings",
    name: { en: "Cascade Drop Earrings", he: "עגילי קסקייד" },
    description: "עגילים תלויים עם קצב של יהלומים, בנויים לתנועה ונצנוץ בערב.",
    story: "כל חוליה בעגיל זזה מעט אחרת, כדי ליצור תחושת זרימה כמו מפל אור.",
    price: 3400,
    image: "/images/products/diamond-chandelier-earrings.webp",
    images: ["/images/products/diamond-chandelier-earrings.webp", "/images/products/emerald-pendant-necklace.webp"],
    media: { images: ["/images/products/diamond-chandelier-earrings.webp", "/images/products/emerald-pendant-necklace.webp"] },
    material: "14K Gold",
    color: "rose",
    gemstone: "Diamond",
    weight: "4.7g",
    isNew: true,
    options: { colors: SHARED_COLORS, sizes: ["One Size"] },
  },
  {
    id: "luna-pendant",
    slug: "luna-pendant",
    name: { en: "Luna Pendant Necklace", he: "תליון לונה" },
    description: "תליון אבן חן במסגרת זהב לבן, עדין אך עם מוקד צבע חזק.",
    story: "נוצר סביב הרעיון של אור ירח על אבן, עם מסגרת שמחזיקה את הצבע בשקט.",
    price: 4200,
    image: "/images/products/emerald-pendant-necklace.webp",
    images: ["/images/products/emerald-pendant-necklace.webp", "/images/products/gold-diamond-cuff.webp"],
    media: { images: ["/images/products/emerald-pendant-necklace.webp", "/images/products/gold-diamond-cuff.webp"] },
    material: "14K Gold",
    color: "white",
    gemstone: "Emerald",
    weight: "3.8g",
    isNew: true,
    options: { colors: SHARED_COLORS, sizes: ["40cm", "45cm"] },
  },
  {
    id: "eternity-band",
    slug: "eternity-band",
    name: { en: "Eternity Band", he: "טבעת נצח" },
    description: "טבעת שיבוץ עדינה סביב כל ההיקף, קלאסית ונקייה.",
    story: "עיצוב שמחזיק משמעות בלי להכביד על היד, מיועד לענידה יומיומית.",
    price: 5200,
    image: "/images/products/diamond-halo-ring.webp",
    images: ["/images/products/diamond-halo-ring.webp", "/images/products/emerald-pendant-necklace.webp"],
    media: { images: ["/images/products/diamond-halo-ring.webp", "/images/products/emerald-pendant-necklace.webp"] },
    material: "18K Gold",
    color: "yellow",
    gemstone: "Diamond pavé",
    weight: "3.5g",
    options: { colors: SHARED_COLORS, sizes: ["5", "6", "7", "8", "9", "10"] },
  },
];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((product) => product.slug === slug) ?? PRODUCTS[0];
}

export function getProductsByIds(ids: string[]) {
  return PRODUCTS.filter((product) => ids.includes(product.id));
}

export function getFeaturedProducts(limit = 4) {
  return PRODUCTS.slice(0, limit);
}

export function getNewProducts(limit = 4) {
  return PRODUCTS.filter((product) => product.isNew).slice(0, limit);
}

export function searchProducts(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return PRODUCTS.filter((product) => {
    return (
      product.name.he.includes(query) ||
      product.name.en.toLowerCase().includes(normalized) ||
      product.material?.toLowerCase().includes(normalized) ||
      product.gemstone.toLowerCase().includes(normalized)
    );
  });
}
