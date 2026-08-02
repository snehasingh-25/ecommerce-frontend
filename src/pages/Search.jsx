import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { API } from "../api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { shuffleArray } from "../utils/shuffle";

function filterProductsClientSide(products, { query, categoryFilter, occasionFilter }) {
  let filtered = Array.isArray(products) ? products : [];
  if (categoryFilter) {
    filtered = filtered.filter((p) =>
      p.categories?.some((c) => (c.slug || c.category?.slug) === categoryFilter)
    );
  }
  if (occasionFilter) {
    filtered = filtered.filter((p) =>
      p.occasions?.some((o) => (o.slug || o.occasion?.slug) === occasionFilter)
    );
  }
  if (!query) return filtered;
  const fuse = new Fuse(filtered, {
    keys: ["name", "description", "keywords"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 1,
  });
  // Keep Fuse relevance order (do not shuffle search hits)
  return fuse.search(query).map((r) => r.item);
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const occasionFilter = searchParams.get("occasion") || "";
  // Forces re-fetch when submitting the same query again (from navbar state or local submit)
  const navSearchAt = location.state?.searchAt ?? 0;
  const [localSearchAt, setLocalSearchAt] = useState(0);

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch categories, occasions, and all products for client-side fallback
  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      fetch(`${API}/categories`, { signal: ac.signal }).then((res) => res.json()),
      fetch(`${API}/occasions`, { signal: ac.signal }).then((res) => res.json()),
      fetch(`${API}/products?shuffle=false`, { signal: ac.signal }).then((res) => res.json()),
    ])
      .then(([categoriesData, occasionsData, productsData]) => {
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setOccasions(Array.isArray(occasionsData) ? occasionsData : []);
        setAllProducts(Array.isArray(productsData) ? productsData : []);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        console.error("Error fetching data:", error);
      });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    const performSearch = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) {
        params.append("search", query);
        // Preserve relevance order for search results
        params.append("shuffle", "false");
      }
      if (categoryFilter) params.append("category", categoryFilter);
      if (occasionFilter) params.append("occasion", occasionFilter);

      const url = `${API}/products?${params.toString()}`;

      try {
        const res = await fetch(url, { signal: ac.signal });
        const data = await res.json();
        if (cancelled) return;

        let safeData = Array.isArray(data) ? data : [];

        if (safeData.length === 0 && query && Array.isArray(allProducts) && allProducts.length > 0) {
          safeData = filterProductsClientSide(allProducts, {
            query,
            categoryFilter,
            occasionFilter,
          });
        }

        if (cancelled) return;
        setProducts(safeData);

        // If no results and we have a query, fall back to filtered catalog
        if (safeData.length === 0 && query) {
          const fallbackParams = new URLSearchParams();
          if (categoryFilter) fallbackParams.append("category", categoryFilter);
          if (occasionFilter) fallbackParams.append("occasion", occasionFilter);
          fallbackParams.append("shuffle", "false");
          const fallbackUrl = `${API}/products?${fallbackParams.toString()}`;

          let fallbackProducts = [];
          if (categoryFilter || occasionFilter) {
            const fallbackRes = await fetch(fallbackUrl, { signal: ac.signal });
            const fallbackJson = await fallbackRes.json();
            if (cancelled) return;
            fallbackProducts = Array.isArray(fallbackJson) ? fallbackJson : [];
          } else {
            fallbackProducts = Array.isArray(allProducts) ? allProducts : [];
          }

          // Light shuffle only for "no match" discovery suggestions
          fallbackProducts = shuffleArray(fallbackProducts);
          if (cancelled) return;
          setSuggestedProducts(fallbackProducts);
          setShowSuggestions(fallbackProducts.length > 0);
        } else {
          setSuggestedProducts([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Error searching products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    performSearch();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [query, categoryFilter, occasionFilter, allProducts, navSearchAt, localSearchAt]);

  const applySearchQuery = (q) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    setSearchParams(params);
    // Re-run even when q is unchanged
    setLocalSearchAt(Date.now());
  };

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

  const handleOccasionChange = (e) => {
    const newOccasion = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (newOccasion) {
      params.set("occasion", newOccasion);
    } else {
      params.delete("occasion");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6">
      <div className="px-1 sm:px-2 lg:px-4">

        {/* Mobile search bar — hidden on desktop where Navbar already has one */}
        <div className="lg:hidden mb-5">
          <SearchBar
            initialValue={query}
            showTyped={false}
            onSearch={applySearchQuery}
          />
        </div>

        <div className="mb-8">
          <h2 className="gc-heading text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
            Search Results
          </h2>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold" style={{ color: 'oklch(40% .02 340)' }}>
                Category:
              </label>
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="px-4 py-2 rounded-lg border-2 text-sm transition-all duration-300 focus:outline-none"
                style={{
                  borderColor: 'oklch(92% .04 340)',
                  backgroundColor: 'white',
                  color: 'oklch(20% .02 340)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'oklch(88% .06 340)'}
                onBlur={(e) => e.target.style.borderColor = 'oklch(92% .04 340)'}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold" style={{ color: 'oklch(40% .02 340)' }}>
                Occasion:
              </label>
              <select
                value={occasionFilter}
                onChange={handleOccasionChange}
                className="px-4 py-2 rounded-lg border-2 text-sm transition-all duration-300 focus:outline-none"
                style={{
                  borderColor: 'oklch(92% .04 340)',
                  backgroundColor: 'white',
                  color: 'oklch(20% .02 340)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'oklch(88% .06 340)'}
                onBlur={(e) => e.target.style.borderColor = 'oklch(92% .04 340)'}
              >
                <option value="">All Occasions</option>
                {occasions.map((occ) => (
                  <option key={occ.id} value={occ.slug}>
                    {occ.name}
                  </option>
                ))}
              </select>
            </div>

            {(categoryFilter || occasionFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                style={{
                  backgroundColor: 'oklch(92% .04 340)',
                  color: 'oklch(20% .02 340)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
              >
                Clear Filters
              </button>
            )}
          </div>

          {(query || categoryFilter || occasionFilter) && (
            <p className="text-lg mb-4" style={{ color: 'oklch(60% .02 340)' }}>
              {loading
                ? "Searching…"
                : products.length > 0 
                ? `Found ${products.length} product${products.length !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}${categoryFilter ? ` in ${categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}` : ''}${occasionFilter ? ` for ${occasions.find(o => o.slug === occasionFilter)?.name || occasionFilter}` : ''}`
                : `No products found${query ? ` for "${query}"` : ''}${categoryFilter ? ` in ${categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}` : ''}${occasionFilter ? ` for ${occasions.find(o => o.slug === occasionFilter)?.name || occasionFilter}` : ''}`
              }
            </p>
          )}
        </div>

        {!query && !categoryFilter && !occasionFilter ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
              <span className="text-4xl">🔍</span>
            </div>
            <p className="font-medium" style={{ color: 'oklch(60% .02 340)' }}>
              Enter a search term or select filters to find products
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <p className="font-medium" style={{ color: 'oklch(60% .02 340)' }}>
              Searching…
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-1">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : showSuggestions && suggestedProducts.length > 0 ? (
          <div>
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
              <p className="font-semibold mb-2" style={{ color: 'oklch(20% .02 340)' }}>
                No exact matches found for "{query}"
              </p>
              <p className="text-sm" style={{ color: 'oklch(60% .02 340)' }}>
                Showing {categoryFilter ? "all products in this category" : "all products"}:
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-1">
              {suggestedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
              <span className="text-4xl">😔</span>
            </div>
            <p className="font-medium mb-2" style={{ color: 'oklch(60% .02 340)' }}>
              No products found
            </p>
            <p className="text-sm" style={{ color: 'oklch(60% .02 340)' }}>
              Try searching with different keywords or adjust your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
