import { useCallback, useRef, useState } from "react";
import InstagramThumbnail from "../InstagramThumbnail";
import OptimizedProductImage from "../OptimizedProductImage";
import { getVariantUrl, IMAGE_SIZES } from "../../utils/imageUrl";

function getInstagramEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const reelMatch = trimmed.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
  const postMatch = trimmed.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  const postId = reelMatch?.[1] || postMatch?.[1];
  if (!postId) return null;
  return `https://www.instagram.com/p/${postId}/embed/`;
}

function MediaThumbnail({ item, productName, idx, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(idx)}
      className={[
        "shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300",
        "w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20",
        active
          ? "border-[oklch(88%_.06_340)] shadow-md scale-[1.02]"
          : "border-[oklch(92%_.04_340)] opacity-80 hover:opacity-100 active:scale-95",
      ].join(" ")}
      aria-label={`View image ${idx + 1}`}
      aria-current={active ? "true" : undefined}
    >
      <div className="w-full h-full bg-white">
        {item.type === "instagram" ? (
          <InstagramThumbnail url={item.url} onClick={() => onSelect(idx)} />
        ) : item.type === "video" ? (
          <video src={item.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
        ) : item.meta ? (
          <OptimizedProductImage
            meta={item.meta}
            variant="thumb"
            sizes={IMAGE_SIZES.galleryThumb}
            alt={`${productName} ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
            width={80}
            height={80}
          />
        ) : (
          <img
            src={item.url}
            alt={`${productName} ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            width={80}
            height={80}
          />
        )}
      </div>
    </button>
  );
}

function ZoomableImage({ src, alt, onTap, className = "" }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pinchRef = useRef({ dist: 0, scale: 1 });
  const panRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const lastTapRef = useRef(0);

  const reset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    pinchRef.current = { dist: 0, scale: 1 };
  }, []);

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: getDistance(e.touches), scale };
    } else if (e.touches.length === 1 && scale > 1) {
      panRef.current = {
        x: translate.x,
        y: translate.y,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches);
      if (pinchRef.current.dist > 0) {
        const next = Math.min(4, Math.max(1, pinchRef.current.scale * (dist / pinchRef.current.dist)));
        setScale(next);
      }
    } else if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      setTranslate({ x: panRef.current.x + dx, y: panRef.current.y + dy });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      pinchRef.current.scale = scale;
      if (scale <= 1.05) reset();

      const now = Date.now();
      if (scale <= 1.05 && now - lastTapRef.current < 300) {
        onTap?.();
      }
      lastTapRef.current = now;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden touch-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => scale <= 1 && onTap?.()}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out select-none"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
        draggable={false}
        decoding="async"
        loading="eager"
      />
      {scale <= 1 && (
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-medium backdrop-blur-sm pointer-events-none">
          Tap to preview
        </div>
      )}
    </div>
  );
}

function ImageLightbox({ src, alt, onClose }) {
  const [scale, setScale] = useState(1);
  const pinchRef = useRef({ dist: 0, scale: 1 });

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: getDistance(e.touches), scale };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches);
      if (pinchRef.current.dist > 0) {
        setScale(Math.min(5, Math.max(1, pinchRef.current.scale * (dist / pinchRef.current.dist))));
      }
    }
  };

  const handleTouchEnd = () => {
    pinchRef.current.scale = scale;
    if (scale < 1.05) setScale(1);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 pd-lightbox-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
        aria-label="Close preview"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[95vw] max-h-[90vh] object-contain transition-transform duration-200 select-none"
        style={{ transform: `scale(${scale})` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        draggable={false}
      />
    </div>
  );
}

export default function ProductGallery({
  media,
  productName,
  badges,
  activeIndex,
  onIndexChange,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeMedia = media[activeIndex] || media[0] || null;
  const activeImage = activeMedia?.type === "image" ? activeMedia.url : null;
  const activeZoomUrl =
    activeMedia?.type === "image"
      ? activeMedia.zoomUrl || getVariantUrl(activeMedia.meta, "original") || activeImage
      : null;
  const activeInstagram = activeMedia?.type === "instagram" ? activeMedia.url : null;
  const activeInstagramEmbedUrl = activeInstagram ? getInstagramEmbedUrl(activeInstagram) : null;

  const aspectRatio =
    activeMedia?.type === "instagram" ? "125%" : activeMedia?.type === "video" ? "56.25%" : "100%";

  const goToPrev = () => onIndexChange((activeIndex - 1 + media.length) % media.length);
  const goToNext = () => onIndexChange((activeIndex + 1) % media.length);

  return (
    <div>
      <div>
        {/* Main viewer */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(17,24,39,0.06)]">
          <div className="relative w-full" style={{ paddingBottom: aspectRatio }}>
            <div key={activeIndex} className="absolute inset-0 pd-gallery-fade">
              {activeMedia?.type === "instagram" ? (
                <div className="absolute inset-0 w-full h-full bg-gray-50 flex items-center justify-center p-4">
                  {activeInstagramEmbedUrl ? (
                    <iframe
                      title="Instagram embed"
                      src={activeInstagramEmbedUrl}
                      className="w-full h-full rounded-xl"
                      frameBorder="0"
                      scrolling="no"
                      allow="encrypted-media"
                      loading="lazy"
                      style={{ maxWidth: "540px" }}
                    />
                  ) : (
                    <a
                      href={activeInstagram || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold underline"
                      style={{ color: "oklch(40% .02 340)" }}
                    >
                      Open Instagram post
                    </a>
                  )}
                </div>
              ) : activeMedia?.type === "video" ? (
                <video
                  src={activeMedia.url}
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : activeImage ? (
                <ZoomableImage
                  src={activeImage}
                  alt={productName}
                  onTap={() => setLightboxOpen(true)}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "oklch(96% .02 340)" }}
                >
                  <img src="/logo.png" alt="Gift Choice Logo" className="w-24 h-24 object-contain opacity-50" />
                </div>
              )}
            </div>

            {/* Product badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
              {badges?.isReadySameDay && (
                <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-800 shadow-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                  Same Day Ready
                </span>
              )}
              {badges?.isFestival && (
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/95 shadow-sm" style={{ color: "oklch(20% .02 340)" }}>
                  Festival
                </span>
              )}
              {badges?.isNew && (
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/95 shadow-sm" style={{ color: "oklch(20% .02 340)" }}>
                  New
                </span>
              )}
              {badges?.badge && (
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-pink-500 text-white shadow-sm">
                  {badges.badge}
                </span>
              )}
            </div>

            {/* Carousel prev / next arrows */}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white transition-colors backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white transition-colors backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnails below main image */}
        {media.length > 1 && (
          <div
            className="mt-3 flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {media.slice(0, 10).map((item, idx) => (
              <MediaThumbnail
                key={idx}
                item={item}
                productName={productName}
                idx={idx}
                active={idx === activeIndex}
                onSelect={onIndexChange}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && activeZoomUrl && (
        <ImageLightbox src={activeZoomUrl} alt={productName} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
