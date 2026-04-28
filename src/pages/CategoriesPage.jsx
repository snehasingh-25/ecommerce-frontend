import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { API } from "../api";
import InfiniteScrollCarousel from "../components/InfiniteScrollCarousel";
import { INFINITE_SCROLL_CAROUSEL_UI } from "../components/infiniteScrollCarouselPresets";
import ProductListing from "../components/ProductListing";

export default function CategoriesPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const occasionFilter = searchParams.get("occasion") || "";
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
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

        <InfiniteScrollCarousel
          items={categories}
          variant="category"
          ui={INFINITE_SCROLL_CAROUSEL_UI.category}
          showViewAll={false}
          onItemClick={handleCategoryClick}
        />

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
