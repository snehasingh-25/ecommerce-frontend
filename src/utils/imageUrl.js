import { API } from "../api";

export const IMAGE_SIZES = {
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px",
  galleryMain: "(max-width: 1024px) 100vw, 60vw",
  galleryThumb: "80px",
  cart: "64px",
  search: "48px",
  admin: "48px",
};

const VARIANT_WIDTHS = {
  thumb: 320,
  medium: 800,
  large: 1200,
  original: 1200,
};

/**
 * Inject Cloudinary delivery transforms: f_auto, q_auto, w_*, c_fill
 */
export function injectCloudinaryTransforms(url, width = 600) {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const marker = "/image/upload/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return url;

  const prefix = url.slice(0, markerIndex + marker.length);
  const rest = url.slice(markerIndex + marker.length);
  const slashIndex = rest.indexOf("/");
  const firstSegment = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
  const afterFirstSegment = slashIndex === -1 ? "" : rest.slice(slashIndex + 1);

  if (firstSegment.includes("f_auto")) return url;

  const transform = `f_auto,q_auto,w_${width},c_fill`;

  if (firstSegment.includes(",")) {
    return `${prefix}${transform}${afterFirstSegment ? `/${afterFirstSegment}` : ""}`;
  }

  return `${prefix}${transform}/${rest}`;
}

/**
 * Resolve a stored path or absolute URL to a full fetchable URL.
 */
export function resolveAssetUrl(url, { width } = {}) {
  if (!url) return "";

  let resolved = url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    resolved = url;
  } else if (url.startsWith("/")) {
    resolved = `${API}${url}`;
  }

  if (resolved.includes("res.cloudinary.com")) {
    return injectCloudinaryTransforms(resolved, width ?? 600);
  }

  return resolved;
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
  const width = VARIANT_WIDTHS[variant] || VARIANT_WIDTHS.medium;

  if (!metaOrUrl) return "";
  if (typeof metaOrUrl === "string") {
    return injectCloudinaryTransforms(resolveAssetUrl(metaOrUrl), width);
  }
  if (metaOrUrl.variants?.[variant]) {
    return resolveAssetUrl(metaOrUrl.variants[variant]);
  }
  if (metaOrUrl.legacyUrl) {
    return injectCloudinaryTransforms(resolveAssetUrl(metaOrUrl.legacyUrl), width);
  }
  if (metaOrUrl.canonical) {
    return injectCloudinaryTransforms(resolveAssetUrl(metaOrUrl.canonical), width);
  }
  return "";
}

export function getProductImageSrcSet(meta) {
  if (!meta?.variants || meta.legacy || meta.format === "legacy") return undefined;

  const parts = [];

  for (const [name, w] of Object.entries(VARIANT_WIDTHS)) {
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
