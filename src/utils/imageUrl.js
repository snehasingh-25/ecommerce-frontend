import { API } from "../api";

export const IMAGE_SIZES = {
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px",
  galleryMain: "(max-width: 1024px) 100vw, 60vw",
  galleryThumb: "80px",
  cart: "64px",
  search: "48px",
  admin: "48px",
};

/**
 * Resolve a stored path or absolute URL to a full fetchable URL.
 */
export function resolveAssetUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API}${url}`;
  return url;
}

export function parseProductImagesMeta(imagesMeta) {
  if (!imagesMeta) return [];
  if (Array.isArray(imagesMeta)) return imagesMeta;
  try {
    const parsed = JSON.parse(imagesMeta);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseLegacyImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Unified image list: prefers imagesMeta, falls back to legacy URL strings.
 */
export function getProductImageList(product) {
  const metas = parseProductImagesMeta(product?.imagesMeta);
  if (metas.length > 0) return metas;

  const legacy = parseLegacyImages(product?.images);
  return legacy.map((url) => ({
    legacy: true,
    legacyUrl: url,
    canonical: url,
    variants: { thumb: url, medium: url, large: url, original: url },
    width: null,
    height: null,
  }));
}

export function getVariantUrl(metaOrUrl, variant = "medium") {
  if (!metaOrUrl) return "";
  if (typeof metaOrUrl === "string") return resolveAssetUrl(metaOrUrl);
  if (metaOrUrl.variants?.[variant]) return resolveAssetUrl(metaOrUrl.variants[variant]);
  if (metaOrUrl.legacyUrl) return resolveAssetUrl(metaOrUrl.legacyUrl);
  if (metaOrUrl.canonical) return resolveAssetUrl(metaOrUrl.canonical);
  return "";
}

export function getProductImageSrcSet(meta) {
  if (!meta?.variants || meta.legacy || meta.format === "legacy") return undefined;

  const widths = { thumb: 320, medium: 800, large: 1200, original: 2000 };
  const parts = [];

  for (const [name, w] of Object.entries(widths)) {
    if (meta.variants[name]) {
      parts.push(`${resolveAssetUrl(meta.variants[name])} ${w}w`);
    }
  }

  return parts.length > 1 ? parts.join(", ") : undefined;
}

export function getImageDimensions(meta, fallback = 320) {
  if (meta?.width && meta?.height) {
    return { width: meta.width, height: meta.height };
  }
  return { width: fallback, height: fallback };
}

/**
 * Primary cart / card thumbnail URL.
 */
export function getProductThumbnailUrl(product) {
  const list = getProductImageList(product);
  if (list.length === 0) return null;
  return getVariantUrl(list[0], "medium");
}
