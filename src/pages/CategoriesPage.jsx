import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { API } from "../api";
import { Link } from "react-router-dom";
import ProductListing from "../components/ProductListing";
import GiftBoxLoader from "../components/GiftBoxLoader";
import { useProductLoader } from "../hooks/useProductLoader";

export default function CategoriesPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const occasionFilter = searchParams.get("occasion") || "";
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const categoryScrollRef = useRef(null);
  
  // Build initial filters for ProductListing
  const initialFilters = useMemo(() => ({
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
    const scrollAmount = 320;
    categoryScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Time-based loader for initial categories load
  const { showLoader: showInitialLoader } = useProductLoader(loading && !selectedCategory);
  
  // Build filters based on selected category - MUST be called unconditionally
  const currentFilters = useMemo(() => ({
    category: selectedCategory?.slug,
    occasion: occasionFilter || undefined,
    isTrending: searchParams.get("trending") === "true" || undefined,
  }), [selectedCategory, occasionFilter, searchParams]);

  // Time-based loader for product loading
  const { showLoader: showProductLoader } = useProductLoader(loading && selectedCategory !== null);
  
  if (loading && !selectedCategory) {
    return (
      <>
        <GiftBoxLoader 
          isLoading={loading && !selectedCategory} 
          showLoader={showInitialLoader}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      {/* Gift Box Loading Animation - Only shows if product loading takes >= 1 second */}
      <GiftBoxLoader 
        isLoading={loading && selectedCategory !== null} 
        showLoader={showProductLoader}
      />
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'oklch(20% .02 340)' }}>
            Shop by Category
          </h2>
          <p className="text-lg" style={{ color: 'oklch(60% .02 340)' }}>
            Browse our wide range of gift categories
          </p>
        </div>

        {/* Categories (horizontal scroll like Home) */}
        <div className="relative mb-12">
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
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-thin pb-4 px-1 sm:px-10"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                onClick={() => handleCategoryClick(category)}
                className="flex-shrink-0 flex flex-col items-center min-w-[100px] sm:min-w-[120px] group"
              >
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden flex items-center justify-center border-2 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300"
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
                <h3 className="font-semibold text-sm text-center mt-2" style={{ color: "oklch(20% .02 340)" }}>
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
                <h3 className="text-3xl font-bold mb-2" style={{ color: 'oklch(20% .02 340)' }}>
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
                <h3 className="text-3xl font-bold mb-2" style={{ color: 'oklch(20% .02 340)' }}>
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
