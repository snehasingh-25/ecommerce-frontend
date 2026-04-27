import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

function usePerView() {
  const get = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w >= 1024) return 3; // desktop
    if (w >= 640) return 2; // tablet
    return 1; // mobile
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

  const pages = useMemo(() => {
    const n = list.length;
    if (n <= 0) return 0;
    return Math.max(1, Math.ceil(n / perView));
  }, [list.length, perView]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pages - 1)));
  }, [pages]);

  const scrollToPage = (nextPage) => {
    const el = viewportRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(nextPage, Math.max(0, pages - 1)));
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

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8">
        <div className="relative">
          <div
            ref={viewportRef}
            onScroll={onScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollPaddingLeft: "16px",
              scrollPaddingRight: "16px",
            }}
            aria-label="Promotional carousel"
          >
            <div className="flex gap-4 w-full pr-4">
              {list.map((b, idx) => {
                const title = (b?.title || "").toString();
                const subtitle = (b?.subtitle || "").toString();
                const ctaText = (b?.ctaText || "Shop Now").toString();
                const ctaLink = (b?.ctaLink || "/categories").toString();
                const background = (b?.imageUrl || "").toString();
                const logo = (b?.logoUrl || "/logo.png").toString();
                const product = (b?.productImageUrl || b?.imageUrl || "").toString();

                // Mobile: shorter headlines + bigger CTA
                const mobileTitle = title.length > 44 ? `${title.slice(0, 44)}…` : title;

                return (
                  <article
                    key={b?.id ?? `${idx}-${title}`}
                    className="snap-start shrink-0"
                    style={{
                      flex: `0 0 calc((100% - (16px * ${perView - 1})) / ${perView})`,
                    }}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.10)] ring-1 ring-black/5">
                      {/* Background */}
                      <div className="absolute inset-0">
                        {background ? (
                          <img
                            src={background}
                            alt=""
                            className="w-full h-full object-cover object-center"
                            decoding="async"
                            loading={idx < perView ? "eager" : "lazy"}
                            fetchPriority={idx < perView ? "high" : "auto"}
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(75% .20 330), oklch(78% .16 250), oklch(92% .04 340))",
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </div>

                      {/* Layout (adaptive aspect ratio) */}
                      <div className="relative grid grid-cols-12 items-center min-h-[220px] sm:min-h-[260px] lg:aspect-[16/9] lg:min-h-0">
                        <div className="col-span-12 lg:col-span-7 p-5 sm:p-6 lg:p-7">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm ring-1 ring-black/5 overflow-hidden">
                              <img src={logo} alt="Brand logo" className="h-6 w-6 object-contain" />
                            </div>
                            <div className="h-px flex-1 bg-white/25" />
                          </div>

                          <h2 className="text-white font-semibold tracking-tight text-[22px] sm:text-[24px] lg:text-[28px] leading-tight drop-shadow-sm">
                            <span className="sm:hidden">{mobileTitle || "Premium picks, curated for you"}</span>
                            <span className="hidden sm:inline">{title || "Premium picks, curated for you"}</span>
                          </h2>

                          {subtitle ? (
                            <p className="mt-2 text-white/85 text-sm sm:text-[15px] leading-relaxed max-w-[44ch]">
                              {subtitle}
                            </p>
                          ) : (
                            <p className="mt-2 text-white/80 text-sm sm:text-[15px] leading-relaxed max-w-[44ch]">
                              Limited-time offers with a clean, minimal aesthetic.
                            </p>
                          )}

                          <div className="mt-4 sm:mt-5 flex items-center gap-3">
                            <Link
                              to={ctaLink}
                              className="inline-flex items-center justify-center rounded-xl font-semibold shadow-sm active:scale-[0.98] transition-transform
                                bg-white text-slate-900 hover:bg-white/95
                                px-4 py-3 sm:px-4 sm:py-3 lg:px-4 lg:py-2.5
                                text-[15px] sm:text-[15px] lg:text-sm
                              "
                              aria-label={ctaText}
                            >
                              {ctaText}
                            </Link>

                            <span className="hidden lg:inline text-white/75 text-sm">
                              Free shipping on select items
                            </span>
                          </div>
                        </div>

                        {/* Product visual */}
                        <div className="hidden sm:block col-span-12 lg:col-span-5 px-5 sm:px-6 lg:px-7 pb-5 sm:pb-6 lg:pb-0">
                          <div className="relative h-[160px] sm:h-[180px] lg:h-[220px]">
                            <div className="absolute -inset-6 bg-white/10 blur-2xl rounded-[40px]" />
                            {product ? (
                              <img
                                src={product}
                                alt=""
                                className="relative w-full h-full object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.35)]"
                                decoding="async"
                                loading={idx < perView ? "eager" : "lazy"}
                              />
                            ) : (
                              <div className="relative w-full h-full rounded-2xl bg-white/10 ring-1 ring-white/15" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Pagination dots */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pb-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToPage(i)}
                  className={[
                    "h-2.5 rounded-full transition-all duration-300",
                    i === page ? "w-7 bg-slate-900/80" : "w-2.5 bg-slate-300 hover:bg-slate-400",
                  ].join(" ")}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === page ? "true" : "false"}
                />
              ))}
            </div>
          )}

          {/* Subtle desktop controls (optional, premium) */}
          {pages > 1 && (
            <div className="hidden lg:block pointer-events-none">
              <button
                type="button"
                onClick={() => scrollToPage(page - 1)}
                className="pointer-events-auto absolute -left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 hover:bg-white shadow-lg ring-1 ring-black/5 grid place-items-center transition active:scale-95"
                aria-label="Previous"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollToPage(page + 1)}
                className="pointer-events-auto absolute -right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 hover:bg-white shadow-lg ring-1 ring-black/5 grid place-items-center transition active:scale-95"
                aria-label="Next"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

