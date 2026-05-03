import { useEffect, useMemo, useState } from "react";
import { API } from "../api";
import { Link } from "react-router-dom";
import HeroPromoCarousel from "../components/HeroPromoCarousel";
import { MemoReelCarousel as ReelCarousel } from "../components/ReelCarousel";
import HorizontalProductCarousel from "../components/HorizontalProductCarousel";
import InfiniteScrollCarousel from "../components/InfiniteScrollCarousel";
import { INFINITE_SCROLL_CAROUSEL_UI } from "../components/infiniteScrollCarouselPresets";
import OccasionProductsSection from "../components/OccasionProductsSection/OccasionProductsSection";
import { shuffleArray } from "../utils/shuffle";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relations, setRelations] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [reels, setReels] = useState([]);
  const [primaryBanners, setPrimaryBanners] = useState([]);
  const [secondaryBanners, setSecondaryBanners] = useState([]);
  const [visibleProductsCount, setVisibleProductsCount] = useState(10);
  const [loading, setLoading] = useState({
    categories: true,
    relations: true,
    occasions: true,
    products: true,
    reels: true,
    banners: true,
  });

  useEffect(() => {
    const ac = new AbortController();

    // Fetch categories
    fetch(`${API}/categories`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, categories: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, categories: false }));
      });

    // Fetch relations
    fetch(`${API}/relations`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setRelations(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, relations: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, relations: false }));
      });

    // Fetch occasions
    fetch(`${API}/occasions`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setOccasions(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, occasions: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, occasions: false }));
      });

    // Fetch products
    fetch(`${API}/products`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        const list = shuffleArray(Array.isArray(data) ? data : []);
        setProducts(list);
        setTrendingProducts(list.filter((p) => p.isTrending));
        setLoading((prev) => ({ ...prev, products: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, products: false }));
      });

    // Fetch reels
    fetch(`${API}/reels`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setReels(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, reels: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, reels: false }));
      });

    // Fetch primary banners for hero section
    fetch(`${API}/banners?type=primary`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setPrimaryBanners(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, banners: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, banners: false }));
      });

    // Fetch secondary banners for mid-page promos
    fetch(`${API}/banners?type=secondary`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setSecondaryBanners(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => {
      ac.abort();
    };
  }, []);

  // After initial content is visible, progressively render more product cards
  useEffect(() => {
    if (!products.length) return;
    if (visibleProductsCount >= Math.min(products.length, 25)) return;
    const t = setTimeout(() => setVisibleProductsCount((c) => Math.min(c + 5, 25)), 600);
    return () => clearTimeout(t);
  }, [products.length, visibleProductsCount]);

  const visibleProducts = useMemo(
    () => (Array.isArray(products) ? products.slice(0, visibleProductsCount) : []),
    [products, visibleProductsCount]
  );

  // Check if any data is still loading
  const isInitialLoad = loading.categories || loading.relations || loading.occasions || loading.products || loading.reels || loading.banners;

  return (
    <div className="min-h-screen bg-white fade-in">
      <style>{`
        @keyframes home-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .hm-sk {
          background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
          background-size: 1200px 100%;
          animation: home-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Skeleton — shown while any section is still loading */}
      {isInitialLoad && (
        <div>
          {/* Hero banner */}
          <div className="hm-sk w-full" style={{ height: "clamp(180px, 40vw, 420px)" }} />

          <div className="px-1 sm:px-2 lg:px-4">
            {/* Shop By Category */}
            <div className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="hm-sk h-6 w-40 rounded" />
                <div className="hm-sk h-4 w-16 rounded" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="hm-sk w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
                    <div className="hm-sk h-3 w-12 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Products */}
            <div className="pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="hm-sk h-6 w-44 rounded" />
                <div className="hm-sk h-4 w-16 rounded" />
              </div>
              <div className="flex gap-3 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="shrink-0 basis-[calc((100%-0.5rem)/2)] lg:basis-[calc((100%-2rem)/5)]">
                    <div className="hm-sk aspect-[4/5] w-full" />
                    <div className="mt-2 space-y-2 px-1">
                      <div className="hm-sk h-3 w-3/4 rounded" />
                      <div className="hm-sk h-3 w-1/3 rounded" />
                      <div className="hm-sk h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop By Relation */}
            <div className="pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="hm-sk h-6 w-36 rounded" />
                <div className="hm-sk h-4 w-16 rounded" />
              </div>
              <div className="flex gap-5 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="hm-sk w-32 h-32 sm:w-36 sm:h-36 rounded-lg" />
                    <div className="hm-sk h-3 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Shop By Occasion */}
            <div className="pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="hm-sk h-6 w-36 rounded" />
                <div className="hm-sk h-4 w-16 rounded" />
              </div>
              <div className="flex gap-5 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="hm-sk w-32 h-32 sm:w-36 sm:h-36 rounded-lg" />
                    <div className="hm-sk h-3 w-20 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Gifts */}
            <div className="pb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="hm-sk h-6 w-16 rounded" />
                <div className="hm-sk h-4 w-16 rounded" />
              </div>
              <div className="flex gap-3 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="shrink-0 basis-[calc((100%-0.5rem)/2)] lg:basis-[calc((100%-2rem)/5)]">
                    <div className="hm-sk aspect-[4/5] w-full" />
                    <div className="mt-2 space-y-2 px-1">
                      <div className="hm-sk h-3 w-3/4 rounded" />
                      <div className="hm-sk h-3 w-1/3 rounded" />
                      <div className="hm-sk h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!isInitialLoad && (
        <>
      {/* Hero promo carousel (3/2/1 cards per view) */}
      <HeroPromoCarousel banners={primaryBanners} />

      <div className="px-1 sm:px-2 lg:px-4">
      {/* Shop By Category Section */}
      <InfiniteScrollCarousel
        items={categories}
        variant="category"
        autoScroll={false}
        rows={2}
        desktopRows={1}
        ui={INFINITE_SCROLL_CAROUSEL_UI.category}
        showViewAll={true}
        viewAllTo="/categories"
      />

      {/* Trending Products Section */}
      <HorizontalProductCarousel
        title="Trending Products"
        products={trendingProducts}
        isLoading={loading.products}
        sectionClassName="mt-6 lg:mt-8"
      />

      {/* Shop By Relation Section (above Occasions) */}
      <InfiniteScrollCarousel
        variant="relation"
        items={relations}
        ui={INFINITE_SCROLL_CAROUSEL_UI.relation}
        autoScroll={true}
        showViewAll={true}
        viewAllTo="/relation"
      />

      {/* Shop By Occasion (dynamic selector + live preview slider) */}
      {occasions.length > 0 ? (
        <OccasionProductsSection
          occasions={occasions}
          variant="slider"
          title="Tailored For Your Occasions"
          linkPrefix="/occasion"
          className="mt-6 lg:mt-8"
          badgeTextBySlug={{
            "mothers-day": "Celebrate Mom",
            birthday: "Make a Wish",
            anniversary: "Celebrate Love",
            "love-n-romance": "Love Notes",
          }}
        />
      ) : null}

      {/* Gifts Section */}
      <HorizontalProductCarousel
        title="Gifts"
        products={visibleProducts}
        isLoading={loading.products}
        sectionClassName="mt-6 lg:mt-8"
      />

      </div>

      {/* Secondary Banner Section - Between Gifts and Reels */}
      {!isInitialLoad && <HeroPromoCarousel banners={secondaryBanners} />}

      {/* Reels Section */}
      {reels.length > 0 && (
          <div className="py-6 bg-white">
            <div className="px-1 sm:px-2 lg:px-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center tracking-tight" style={{ color: 'oklch(20% .02 340)' }}>
              Follow Us{" "}
              <a
                href="https://www.instagram.com/giftchoicebhl"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
                style={{ color: 'oklch(92% .04 340)' }}
              >
                @giftchoicebhl
              </a>
            </h2>
            <ReelCarousel reels={reels} />
            </div>
          </div>
      )}
        </>
      )}
    </div>
  );
}
