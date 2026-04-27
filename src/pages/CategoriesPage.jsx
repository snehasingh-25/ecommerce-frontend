import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { API } from "../api";
import { Link } from "react-router-dom";
import ProductListing from "../components/ProductListing";

export default function CategoriesPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const occasionFilter = searchParams.get("occasion") || "";
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const categoryScrollRef = useRef(null);
  const categoryAutoScrollIntervalRef = useRef(null);
  
  // Build initial filters for ProductListing
  const _initialFilters = useMemo(() => ({
    category: slug || undefined,
    occasion: occasionFilter || undefined,
    isTrending: searchParams.get("trending") === "true" || undefined,
  }), [slug, occasionFilter, searchParams]);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(categoriesData => {
        setCategories(categoriesData);
        if (slug) {
          const category = categoriesData.find(cat => cat.slug === slug);
          if (category) {
            setSelectedCategory(category);
          } else if (categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0]);
          }
        } else if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  }, [slug]);

  // Removed getCategoryEmoji - all categories use logo as fallback

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const scrollCategories = (direction) => {
    if (!categoryScrollRef.current) return;
    const scrollAmount =
      window.innerWidth >= 1024 ? 260 : window.innerWidth >= 640 ? 220 : 180;
    categoryScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Auto-scroll categories every 3s (loops by jumping back to start when near end)
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el || categories.length === 0) return;

    if (categoryAutoScrollIntervalRef.current) {
      clearInterval(categoryAutoScrollIntervalRef.current);
      categoryAutoScrollIntervalRef.current = null;
    }

    categoryAutoScrollIntervalRef.current = setInterval(() => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      const node = categoryScrollRef.current;
      if (!node) return;

      // If we're close to the end, smoothly restart
      const nearEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8;
      if (nearEnd) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollCategories("right");
      }
    }, 3000);

    return () => {
      if (categoryAutoScrollIntervalRef.current) {
        clearInterval(categoryAutoScrollIntervalRef.current);
        categoryAutoScrollIntervalRef.current = null;
      }
    };
  }, [categories.length]);

  // Build filters based on selected category - MUST be called unconditionally
  const currentFilters = useMemo(() => ({
    category: selectedCategory?.slug,
    occasion: occasionFilter || undefined,
    isTrending: searchParams.get("trending") === "true" || undefined,
  }), [selectedCategory, occasionFilter, searchParams]);
  
  if (loading && !selectedCategory) {
    return (
      <div className="min-h-screen bg-white py-4 sm:py-6">
        <style>{`@keyframes sk-sweep{0%{background-position:-600px 0}100%{background-position:600px 0}}.sk{background:linear-gradient(90deg,oklch(93% .03 340) 25%,oklch(96% .02 340) 50%,oklch(93% .03 340) 75%);background-size:1200px 100%;animation:sk-sweep 1.5s ease-in-out infinite}`}</style>
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="sk h-6 w-44 rounded mb-6" />
          {/* Category pills */}
          <div className="flex gap-4 overflow-hidden mb-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="sk w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full" />
                <div className="sk h-3 w-12 rounded" />
              </div>
            ))}
          </div>
          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <div className="sk aspect-[4/5] w-full rounded" />
                <div className="mt-2 space-y-2">
                  <div className="sk h-3 w-3/4 rounded" />
                  <div className="sk h-3 w-1/3 rounded" />
                  <div className="sk h-9 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'oklch(20% .02 340)' }}>
            Shop by Category
          </h2>
        </div>

        {/* Categories (horizontal scroll like Home) */}
        <div className="relative mb-6">
          <button
            onClick={() => scrollCategories("left")}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border active:scale-95"
            style={{ borderColor: "oklch(92% .04 340)" }}
            aria-label="Scroll categories left"
          >
            <svg className="w-5 h-5" style={{ color: "oklch(40% .02 340)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={categoryScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 px-1 sm:px-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                onClick={() => handleCategoryClick(category)}
                className="flex-shrink-0 flex flex-col items-center min-w-[64px] sm:min-w-[72px] lg:min-w-[86px] group"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden flex items-center justify-center border-2 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300"
                  style={{
                    backgroundColor: "oklch(92% .04 340)",
                    borderColor: "oklch(92% .04 340)",
                  }}
                >
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <img src="/logo.png" alt="Gift Choice Logo" className="w-3/4 h-3/4 object-contain" />
                  )}
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-center mt-2" style={{ color: "oklch(20% .02 340)" }}>
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scrollCategories("right")}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border active:scale-95"
            style={{ borderColor: "oklch(92% .04 340)" }}
            aria-label="Scroll categories right"
          >
            <svg className="w-5 h-5" style={{ color: "oklch(40% .02 340)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Products for Selected Category or All Products */}
        {(selectedCategory || !slug) && (
          <div className="mt-12">
            {selectedCategory && slug && (
              <div className="mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight" style={{ color: 'oklch(20% .02 340)' }}>
                  {selectedCategory.name}
                </h3>
                {selectedCategory.description && (
                  <p className="text-lg mb-4" style={{ color: 'oklch(60% .02 340)' }}>
                    {selectedCategory.description}
                  </p>
                )}
              </div>
            )}
            
            {!slug && (
              <div className="mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight" style={{ color: 'oklch(20% .02 340)' }}>
                  {searchParams.get("trending") === "true" ? "Trending Products" : "All Products"}
                </h3>
              </div>
            )}

            <ProductListing 
              initialFilters={currentFilters}
              showFilters={true}
              showSort={true}
              gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            />
          </div>
        )}

        {/* Show all categories if none selected */}
        {!selectedCategory && categories.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
              <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 object-contain" />
            </div>
            <p className="font-medium" style={{ color: 'oklch(60% .02 340)' }}>
              No categories available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
