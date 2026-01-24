import { memo, useEffect, useMemo, useRef, useState } from "react";
import { API } from "../api";

function getLowestAndHighestPrice(product) {
  const sizes = product?.sizes || [];
  if (!Array.isArray(sizes) || sizes.length === 0) return { low: null, high: null };
  const prices = sizes.map((s) => Number(s.price)).filter((n) => Number.isFinite(n));
  if (!prices.length) return { low: null, high: null };
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

function formatINR(n) {
  if (!Number.isFinite(n)) return "";
  return `₹${Math.round(n)}`;
}

export default function ReelCarousel({ reels }) {
  const scrollerRef = useRef(null);
  const rafRef = useRef(null);
  const cardWidthRef = useRef(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0); // index within base reels
  const [mutedById, setMutedById] = useState(() => new Map());
  const [viewedIds, setViewedIds] = useState(() => new Set());

  const base = Array.isArray(reels) ? reels : [];
  const loop = useMemo(() => {
    if (base.length === 0) return [];
    // 3 copies so we can "teleport" to keep infinite illusion
    return [...base, ...base, ...base];
  }, [base]);

  const baseCount = base.length;
  const middleStart = baseCount; // start of middle copy

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const measure = () => {
      const firstCard = el.querySelector("[data-reel-card='1']");
      if (!firstCard) return;
      const w = firstCard.getBoundingClientRect().width;
      if (w > 0) cardWidthRef.current = w;
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || baseCount === 0) return;

    // Jump to middle copy on mount so you can scroll both directions.
    // Use rAF so layout has measured widths.
    requestAnimationFrame(() => {
      const cardWidth = cardWidthRef.current || el.querySelector("[data-reel-card='1']")?.getBoundingClientRect().width || 0;
      if (!cardWidth) return;
      el.scrollLeft = middleStart * cardWidth;
      setActiveIndex(0);
    });
  }, [baseCount, middleStart]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || baseCount === 0) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const cardWidth = cardWidthRef.current || el.querySelector("[data-reel-card='1']")?.getBoundingClientRect().width || 0;
        if (!cardWidth) return;
        const center = el.scrollLeft + el.clientWidth / 2;
        const rawIndex = Math.round(center / cardWidth - 0.5);

        // Map to base index
        const normalized = ((rawIndex % baseCount) + baseCount) % baseCount;
        if (normalized !== activeIndexRef.current) {
          activeIndexRef.current = normalized;
          setActiveIndex(normalized);
        }

        // Teleport when user scrolls too close to the ends
        const min = cardWidth * (baseCount * 0.5);
        const max = cardWidth * (baseCount * 2.5);
        if (el.scrollLeft < min) {
          el.scrollLeft += cardWidth * baseCount;
        } else if (el.scrollLeft > max) {
          el.scrollLeft -= cardWidth * baseCount;
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [baseCount]);

  const setMutedFor = (id, nextMuted) => {
    setMutedById((prev) => {
      const m = new Map(prev);
      m.set(id, nextMuted);
      return m;
    });
  };

  const isMuted = (id) => (mutedById.has(id) ? mutedById.get(id) : true);

  const markViewed = async (id) => {
    if (viewedIds.has(id)) return;
    setViewedIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`${API}/reels/${id}/view`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  if (baseCount === 0) return null;

  return (
    <div className="w-full">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {loop.map((reel, i) => {
          const baseIndex = ((i % baseCount) + baseCount) % baseCount;
          const isActive = baseIndex === activeIndex;
          const shouldPlay =
            baseCount <= 2 ||
            isActive ||
            baseIndex === ((activeIndex + 1) % baseCount) ||
            baseIndex === ((activeIndex - 1 + baseCount) % baseCount);
          const product = reel.product || null;
          const productImg =
            (product?.images && Array.isArray(product.images) && product.images[0]) ||
            (typeof product?.images === "string" ? (() => {
              try {
                const arr = JSON.parse(product.images);
                return Array.isArray(arr) ? arr[0] : null;
              } catch {
                return null;
              }
            })() : null) ||
            reel.thumbnail ||
            null;

          const { low, high } = getLowestAndHighestPrice(product);
          const discountPct = Number.isFinite(Number(reel.discountPct)) ? Number(reel.discountPct) : null;
          const original = discountPct && low ? Math.round((low * 100) / (100 - discountPct)) : null;

          return (
            <div
              key={`${reel.id}-${i}`}
              data-reel-card="1"
              className={[
                // Mobile: ~1 centered + peeking sides
                "shrink-0 snap-center",
                "basis-[72%] sm:basis-[34%] lg:basis-[22%] xl:basis-[18%]",
                "transition-transform duration-300",
                isActive ? "scale-[1.04]" : "scale-[0.94] opacity-90",
              ].join(" ")}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-md bg-black">
                {/* 9:16 */}
                <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                  {reel.videoUrl || reel.url ? (
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      // Avoid downloading/playing every reel immediately on scroll:
                      // Only the center (and adjacent) reels get a src.
                      src={shouldPlay ? (reel.videoUrl || reel.url) : undefined}
                      poster={productImg || undefined}
                      playsInline
                      loop
                      muted={isMuted(reel.id)}
                      autoPlay={shouldPlay}
                      preload={shouldPlay ? "metadata" : "none"}
                      onPlay={() => markViewed(reel.id)}
                      onClick={() => setMutedFor(reel.id, !isMuted(reel.id))}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <div className="text-center px-6">
                        <div className="text-5xl mb-3">🎬</div>
                        <div className="text-white/90 font-semibold">Reel video missing</div>
                        <div className="text-white/70 text-sm mt-1">Add a reel video URL in Admin</div>
                      </div>
                    </div>
                  )}

                  {/* Top overlays */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {reel.isTrending && (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-white/90 text-gray-900 shadow">
                        Trending
                      </span>
                    )}
                    {discountPct ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-pink-500 text-white shadow">
                        {discountPct}% OFF
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                    <span aria-hidden>👁️</span>
                    <span>{reel.viewCount ?? 0}</span>
                  </div>

                  {/* Bottom overlays */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div className="flex items-end gap-3">
                      {productImg && (
                        <img
                          src={productImg}
                          alt={product?.name || reel.title || "Product"}
                          className="w-12 h-12 rounded-xl object-cover shadow bg-white"
                          loading="lazy"
                          decoding="async"
                          width={48}
                          height={48}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm line-clamp-1">
                          {product?.name || reel.title || "Reel"}
                        </div>
                        {(low || original) && (
                          <div className="flex items-baseline gap-2">
                            {low ? (
                              <div className="text-white font-bold text-base">{formatINR(low)}</div>
                            ) : null}
                            {original ? (
                              <div className="text-white/70 text-sm line-through">{formatINR(original)}</div>
                            ) : null}
                            {high && low && high !== low ? (
                              <div className="text-white/70 text-xs">onwards</div>
                            ) : null}
                          </div>
                        )}
                        <div className="text-white/70 text-[11px] mt-1">
                          Tap to {isMuted(reel.id) ? "unmute" : "mute"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const MemoReelCarousel = memo(ReelCarousel);

