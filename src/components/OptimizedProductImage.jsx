import {
  getVariantUrl,
  getProductImageSrcSet,
  getImageDimensions,
  IMAGE_SIZES,
} from "../utils/imageUrl";

/**
 * Responsive product image with srcSet support and legacy URL fallback.
 */
export default function OptimizedProductImage({
  meta,
  variant = "medium",
  sizes = IMAGE_SIZES.card,
  alt = "",
  className = "",
  loading = "lazy",
  fetchPriority,
  width,
  height,
  onClick,
}) {
  const src = getVariantUrl(meta, variant);
  const srcSet = getProductImageSrcSet(meta);
  const dims = getImageDimensions(meta, width || 320);

  if (!src) return null;

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      width={width ?? dims.width}
      height={height ?? dims.height}
      onClick={onClick}
      draggable={false}
    />
  );
}
