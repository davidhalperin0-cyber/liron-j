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
  tagline?: string;
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
  media?: ProductMedia;
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

export type ProductPresentationMode =
  | "real-3d"
  | "image-360"
  | "enhanced-image";

export type ProductMediaQualityLabel =
  | "Real 3D model"
  | "360 sequence"
  | "Enhanced interactive image viewer";

export interface ProductMedia {
  model3dUrl?: string;
  model3dKind?: Product3DModelKind;
  sequence360?: string[];
  sprite360?: Product360Sprite;
  images: string[];
}

export type Product3DModelKind = "ring" | "earrings" | "necklace" | "bracelet";

export interface Product360Sprite {
  url: string;
  columns: number;
  rows: number;
  frames: number;
  startFrame?: number;
  frameZoom?: number;
  frameOffsetX?: number;
  frameOffsetY?: number;
}
