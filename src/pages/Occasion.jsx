import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { API } from "../api";
import OccasionProductsSection from "../components/OccasionProductsSection/OccasionProductsSection";

export default function Occasion() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [occasions, setOccasions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch all occasions and categories
    Promise.all([
      fetch(`${API}/occasions`).then(res => res.json()),
      fetch(`${API}/categories`).then(res => res.json())
    ])
      .then(([occasionsData, categoriesData]) => {
        if (!isMounted) return;
        
        setOccasions(occasionsData);
        setCategories(categoriesData);
        
        setLoading(false);
      })
      .catch(error => {
        if (!isMounted) return;
        console.error("Error fetching data:", error);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const clearCategoryFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-4 sm:py-6">
        <style>{`@keyframes sk-sweep{0%{background-position:-600px 0}100%{background-position:600px 0}}.sk{background:linear-gradient(90deg,oklch(93% .03 340) 25%,oklch(96% .02 340) 50%,oklch(93% .03 340) 75%);background-size:1200px 100%;animation:sk-sweep 1.5s ease-in-out infinite}`}</style>
        <div className="">
          <div className="sk h-6 w-44 rounded mb-6" />
          {/* Occasion tiles */}
          <div className="flex gap-5 overflow-hidden mb-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="sk w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-lg" />
                <div className="sk h-3 w-20 rounded" />
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
      <div className="px-1 sm:px-2 lg:px-4">
      <div className="text-left mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'oklch(20% .02 340)' }}>
            Shop by Occasion
          </h2>
        </div>
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold" style={{ color: "oklch(40% .02 340)" }}>
              Filter by Category:
            </label>
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="px-4 py-2 rounded-lg border-2 text-sm transition-all duration-300 focus:outline-none"
              style={{
                borderColor: "oklch(92% .04 340)",
                backgroundColor: "white",
                color: "oklch(20% .02 340)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "oklch(88% .06 340)")}
              onBlur={(e) => (e.target.style.borderColor = "oklch(92% .04 340)")}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {categoryFilter ? (
            <button
              onClick={clearCategoryFilter}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{
                backgroundColor: "oklch(92% .04 340)",
                color: "oklch(20% .02 340)",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "oklch(88% .06 340)")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "oklch(92% .04 340)")}
            >
              Clear Filter
            </button>
          ) : null}
        </div>

        {categoryFilter ? (
          <p className="text-sm mt-3" style={{ color: "oklch(60% .02 340)" }}>
            Showing products in {categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter} category
          </p>
        ) : null}

        <OccasionProductsSection
          occasions={occasions}
          variant="grid"
          defaultSlug={slug}
          asLinks={true}
          linkPrefix="/occasion"
          category={categoryFilter || undefined}
          badgeTextBySlug={{
            "mothers-day": "Celebrate Mom",
            birthday: "Make a Wish",
            anniversary: "Celebrate Love",
            "love-n-romance": "Love Notes",
          }}
          className="mt-6"
        />
      </div>
    </div>
  );
}
