export type Locale = "he" | "en";
export type Direction = "rtl" | "ltr";

export interface LocalizedField {
  en: string;
  he: string;
}

export interface ProductCard {
  id: string;
  slug: string;
  name: LocalizedField;
  price: number;
  compareAtPrice?: number;
  image: string;
  hoverImage?: string;
  category?: string;
  material?: string;
  color?: string;
  isNew?: boolean;
  isLimited?: boolean;
  isFeatured?: boolean;
  trendingScore?: number;
  variants?: {
    id: string;
    color?: string;
    name: string;
  }[];
}

export interface CartItemType {
  id: string;
  product: ProductCard;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
}

export interface HomepageSectionData {
  id: string;
  type: string;
  title?: LocalizedField;
  data?: Record<string, unknown>;
  position: number;
  isActive: boolean;
}
