import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CarouselArrow from "./CarouselArrow";

/** Matches banner design size 1600×700 */
const BANNER_ASPECT = "1600 / 700";

function usePerView() {
  const get = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  };
  const [perView, setPerView] = useState(get);
  useEffect(() => {
    const onResize = () => setPerView(get());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return perView;
}

export default function HeroPromoCarousel({ banners }) {
  const list = Array.isArray(banners) ? banners : [];
  const perView = usePerView();
  const viewportRef = useRef(null);
  const rafRef = useRef(0);
  const [page, setPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const pages = useMemo(
    () => (list.length <= 0 ? 0 : Math.max(1, Math.ceil(list.length / perView))),
    [list.length, perView]
  );

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pages - 1)));
  }, [pages]);

  const scrollToPage = (nextPage) => {
    const el = viewportRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(nextPage, pages - 1));
    el.scrollTo({ left: el.clientWidth * clamped, behavior: "smooth" });
    setPage(clamped);
  };

  const onScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const next = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      setPage((p) => (p === next ? p : next));
    });
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  useEffect(() => {
    if (pages <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setPage((curr) => {
        const next = (curr + 1) % pages;
        const el = viewportRef.current;
        if (el) {
          el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [pages, isHovered]);

  if (list.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="px-1 sm:px-2 lg:px-4 pt-5 sm:pt-6 lg:pt-8">
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div
            ref={viewportRef}
            onScroll={onScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label="Promotional carousel"
          >
            <div className="flex w-full gap-4">
              {list.map((b, idx) => {
                const title = (b?.title || "").toString();
                const ctaText = (b?.ctaText || "Shop Now").toString();
                const ctaLink = (b?.ctaLink || "/categories").toString();
                const background = (b?.imageUrl || "").toString();

                return (
                  <article
                    key={b?.id ?? `${idx}-${title}`}
                    className="snap-start shrink-0"
                    style={{ flex: `0 0 calc((100% - (16px * ${perView - 1})) / ${perView})` }}
                  >
                    <Link
                      to={ctaLink}
                      className="relative block overflow-hidden rounded-2xl bg-[oklch(97%_0.015_340)] shadow-[0_18px_45px_rgba(15,23,42,0.10)] ring-1 ring-black/5"
                      style={{ aspectRatio: BANNER_ASPECT }}
                      aria-label={title ? `${title} — ${ctaText}` : ctaText}
                    >
                      {background ? (
                        <img
                          src={background}
                          alt={title || "Promotional banner"}
                          className="absolute inset-0 h-full w-full object-contain object-center"
                          decoding="async"
                          loading={idx < perView ? "eager" : "lazy"}
                          fetchPriority={idx < perView ? "high" : "auto"}
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(75% .20 330), oklch(78% .16 250), oklch(92% .04 340))",
                          }}
                        />
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToPage(i)}
                  className={[
                    "h-2 rounded-full transition-all duration-300",
                    i === page ? "w-6 bg-slate-900/80" : "w-2 bg-slate-300 hover:bg-slate-400",
                  ].join(" ")}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === page ? "true" : "false"}
                />
              ))}
            </div>
          )}

          {pages > 1 && (
            <>
              <CarouselArrow
                direction="left"
                onClick={() => scrollToPage(page - 1)}
                ariaLabel="Previous"
                size="md"
                className="absolute -left-3 top-1/2 hidden -translate-y-1/2 lg:grid"
              />
              <CarouselArrow
                direction="right"
                onClick={() => scrollToPage(page + 1)}
                ariaLabel="Next"
                size="md"
                className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:grid"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
