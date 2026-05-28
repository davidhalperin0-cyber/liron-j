import type {
  ProductMedia,
  ProductMediaQualityLabel,
  ProductPresentationMode,
} from "@/types";

export interface ProductPresentationDecision {
  mode: ProductPresentationMode;
  label: ProductMediaQualityLabel;
}

export function getProductPresentationDecision(
  media?: ProductMedia
): ProductPresentationDecision {
  if (media?.model3dUrl || media?.model3dKind) {
    return {
      mode: "real-3d",
      label: "Real 3D model",
    };
  }

  if (media?.sequence360?.length) {
    return {
      mode: "image-360",
      label: "360 sequence",
    };
  }

  if (media?.sprite360?.url) {
    return {
      mode: "image-360",
      label: "360 sequence",
    };
  }

  return {
    mode: "enhanced-image",
    label: "Enhanced interactive image viewer",
  };
}

export function getPresentationImages(media?: ProductMedia, fallback?: string) {
  if (media?.images.length) return media.images;
  if (fallback) return [fallback];
  return [];
}
