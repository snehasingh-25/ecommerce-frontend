import { useEffect, useMemo, useState } from "react";
import { API } from "../api";
import HeroPromoCarousel from "../components/HeroPromoCarousel";
import { MemoReelCarousel as ReelCarousel } from "../components/ReelCarousel";
import HorizontalProductCarousel from "../components/HorizontalProductCarousel";
import InfiniteScrollCarousel from "../components/InfiniteScrollCarousel";
import { INFINITE_SCROLL_CAROUSEL_UI } from "../components/infiniteScrollCarouselPresets";
import OccasionProductsSection from "../components/OccasionProductsSection/OccasionProductsSection";
import { HERO_BANNERS } from "../constants/heroBanners";
import { useInView } from "../hooks/useInView";
import { shuffleArray } from "../utils/shuffle";

const HOME_PRODUCT_LIMIT = 25;
const HOME_TRENDING_LIMIT = 20;

function SectionSkeleton({ variant = "category" }) {
  if (variant === "products") {
    return (
      <div className="pb-6 mt-6 lg:mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="hm-sk h-6 w-44 rounded" />
          <div className="hm-sk h-4 w-16 rounded" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 basis-[calc((100%-0.5rem)/2)] lg:basis-[calc((100%-2rem)/5)]"
            >
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
    );
  }

  if (variant === "relation") {
    return (
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
    );
  }

  if (variant === "reels") {
    return (
      <div className="py-6">
        <div className="hm-sk mx-auto mb-6 h-7 w-48 rounded" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="hm-sk h-64 w-40 shrink-0 rounded-xl sm:w-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
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
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relations, setRelations] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    relations: false,
    occasions: false,
    products: false,
    reels: false,
  });
  const [loaded, setLoaded] = useState({
    categories: false,
    relations: false,
    occasions: false,
    products: false,
    reels: false,
  });

  const categoriesZone = useInView({ rootMargin: "320px 0px" });
  const productsZone = useInView({ rootMargin: "360px 0px" });
  const relationsZone = useInView({ rootMargin: "360px 0px" });
  const occasionsZone = useInView({ rootMargin: "360px 0px" });
  const reelsZone = useInView({ rootMargin: "400px 0px" });

  // Categories — first below-fold section
  useEffect(() => {
    if (!categoriesZone.inView || loaded.categories) return;
    const ac = new AbortController();
    setLoading((prev) => ({ ...prev, categories: true }));
    fetch(`${API}/categories`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoaded((prev) => ({ ...prev, categories: true }));
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoaded((prev) => ({ ...prev, categories: true }));
      })
      .finally(() => setLoading((prev) => ({ ...prev, categories: false })));
    return () => ac.abort();
  }, [categoriesZone.inView, loaded.categories]);

  // Products — limited page (not full catalog)
  useEffect(() => {
    if (!productsZone.inView || loaded.products) return;
    const ac = new AbortController();
    setLoading((prev) => ({ ...prev, products: true }));

    const giftsUrl = `${API}/products?limit=${HOME_PRODUCT_LIMIT}&offset=0&shuffle=false`;
    const trendingUrl = `${API}/products?isTrending=true&limit=${HOME_TRENDING_LIMIT}&offset=0&shuffle=false`;

    Promise.all([
      fetch(giftsUrl, { signal: ac.signal }).then((res) => res.json()),
      fetch(trendingUrl, { signal: ac.signal }).then((res) => res.json()),
    ])
      .then(([giftsData, trendingData]) => {
        const gifts = shuffleArray(Array.isArray(giftsData) ? giftsData : []);
        const trending = shuffleArray(Array.isArray(trendingData) ? trendingData : []);
        setProducts(gifts);
        setTrendingProducts(trending);
        setLoaded((prev) => ({ ...prev, products: true }));
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoaded((prev) => ({ ...prev, products: true }));
      })
      .finally(() => setLoading((prev) => ({ ...prev, products: false })));

    return () => ac.abort();
  }, [productsZone.inView, loaded.products]);

  // Relations
  useEffect(() => {
    if (!relationsZone.inView || loaded.relations) return;
    const ac = new AbortController();
    setLoading((prev) => ({ ...prev, relations: true }));
    fetch(`${API}/relations`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setRelations(Array.isArray(data) ? data : []);
        setLoaded((prev) => ({ ...prev, relations: true }));
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoaded((prev) => ({ ...prev, relations: true }));
      })
      .finally(() => setLoading((prev) => ({ ...prev, relations: false })));
    return () => ac.abort();
  }, [relationsZone.inView, loaded.relations]);

  // Occasions
  useEffect(() => {
    if (!occasionsZone.inView || loaded.occasions) return;
    const ac = new AbortController();
    setLoading((prev) => ({ ...prev, occasions: true }));
    fetch(`${API}/occasions`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setOccasions(Array.isArray(data) ? data : []);
        setLoaded((prev) => ({ ...prev, occasions: true }));
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoaded((prev) => ({ ...prev, occasions: true }));
      })
      .finally(() => setLoading((prev) => ({ ...prev, occasions: false })));
    return () => ac.abort();
  }, [occasionsZone.inView, loaded.occasions]);

  // Reels — furthest below the fold
  useEffect(() => {
    if (!reelsZone.inView || loaded.reels) return;
    const ac = new AbortController();
    setLoading((prev) => ({ ...prev, reels: true }));
    fetch(`${API}/reels`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setReels(Array.isArray(data) ? data : []);
        setLoaded((prev) => ({ ...prev, reels: true }));
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoaded((prev) => ({ ...prev, reels: true }));
      })
      .finally(() => setLoading((prev) => ({ ...prev, reels: false })));
    return () => ac.abort();
  }, [reelsZone.inView, loaded.reels]);

  const showCategoriesSkeleton = !loaded.categories || loading.categories;
  const showProductsSkeleton = !loaded.products || loading.products;
  const showRelationsSkeleton = !loaded.relations || loading.relations;
  const showOccasionsSkeleton = !loaded.occasions || loading.occasions;
  const showReelsSkeleton = !loaded.reels || loading.reels;

  const giftsProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products],
  );

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

      <HeroPromoCarousel banners={HERO_BANNERS} />

      <div className="px-1 sm:px-2 lg:px-4">
        <div ref={categoriesZone.ref}>
          {showCategoriesSkeleton ? (
            <SectionSkeleton variant="category" />
          ) : (
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
          )}
        </div>

        <div ref={productsZone.ref}>
          {showProductsSkeleton ? (
            <SectionSkeleton variant="products" />
          ) : (
            <HorizontalProductCarousel
              title="Trending Products"
              products={trendingProducts}
              isLoading={false}
              sectionClassName="mt-6 lg:mt-8"
            />
          )}
        </div>

        <div ref={relationsZone.ref}>
          {showRelationsSkeleton ? (
            <SectionSkeleton variant="relation" />
          ) : (
            <InfiniteScrollCarousel
              variant="relation"
              items={relations}
              ui={INFINITE_SCROLL_CAROUSEL_UI.relation}
              autoScroll={false}
              showViewAll={true}
              viewAllTo="/relation"
              infinite={false}
            />
          )}
        </div>

        <div ref={occasionsZone.ref}>
          {showOccasionsSkeleton ? (
            <SectionSkeleton variant="relation" />
          ) : occasions.length > 0 ? (
            <OccasionProductsSection
              occasions={occasions}
              variant="slider"
              title="Tailored For Your Occasions"
              linkPrefix="/occasion"
              className=""
              badgeTextBySlug={{
                "mothers-day": "Celebrate Mom",
                birthday: "Make a Wish",
                anniversary: "Celebrate Love",
                "love-n-romance": "Love Notes",
              }}
            />
          ) : null}
        </div>

        {!showProductsSkeleton && (
          <HorizontalProductCarousel
            title="Gifts"
            products={giftsProducts}
            isLoading={false}
            sectionClassName="mt-6 lg:mt-8"
          />
        )}
        {showProductsSkeleton && (
          <SectionSkeleton variant="products" />
        )}
      </div>

      <div ref={reelsZone.ref} className="py-6 bg-white">
        <div className="px-1 sm:px-2 lg:px-4">
          {showReelsSkeleton ? (
            <SectionSkeleton variant="reels" />
          ) : reels.length > 0 ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center tracking-tight">
                <span className="gc-heading">Follow Us</span>{" "}
                <a
                  href="https://www.instagram.com/giftchoicebhl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                  style={{ color: "oklch(55% .06 340)" }}
                >
                  @giftchoicebhl
                </a>
              </h2>
              <ReelCarousel reels={reels} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
