import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "ILS", locale = "he-IL") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDiscountPercentage(price: number, compareAt: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Normalize text for search: strip Hebrew niqqud/cantillation marks and lower-case.
 * Product names are stored with niqqud (e.g. "נוֹגַהּ") but users type without it
 * ("נוגה"), so a plain substring match fails. Stripping the combining marks
 * (U+0591–U+05C7) from both sides makes the comparison work.
 */
export function normalizeSearch(text: string): string {
  return (text ?? "")
    .normalize("NFC")
    .replace(/[֑-ׇ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * A "skeleton" of a Hebrew word: niqqud stripped AND the optional vowel-letters
 * vav/yod removed, so full spelling ("הילה") and defective spelling ("הלה")
 * collapse to the same string. Used as a lenient fallback match.
 */
function hebrewSkeleton(text: string): string {
  return normalizeSearch(text).replace(/[וי]/g, "");
}

/** True if `haystack` contains `needle`, ignoring niqqud, case and full/defective spelling. */
export function matchesSearch(haystack: string, needle: string): boolean {
  const h = normalizeSearch(haystack);
  const n = normalizeSearch(needle);
  if (!n) return true;
  if (h.includes(n)) return true;
  // Fallback: ignore matres lectionis (vav/yod) on both sides.
  const ns = hebrewSkeleton(needle);
  return ns.length > 0 && hebrewSkeleton(haystack).includes(ns);
}
