import { useState, useEffect, useMemo } from "react";
import { API } from "../api";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import SortDropdown from "./SortDropdown";
import GiftBoxLoader from "./GiftBoxLoader";
import { useProductLoader } from "../hooks/useProductLoader";

export default function ProductListing({ 
  initialFilters = {},
  showFilters = true,
  showSort = true,
  gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  
  const { showLoader: showProductLoader } = useProductLoader(loading);

  // Build API URL with filters and sort
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.category) params.append("category", filters.category);
    if (filters.occasion) params.append("occasion", filters.occasion);
    if (filters.search) params.append("search", filters.search);
    if (filters.isNew) params.append("isNew", "true");
    if (filters.isTrending) params.append("isTrending", "true");
    if (filters.isFestival) params.append("isFestival", "true");
    if (filters.isReady60Min) params.append("isReady60Min", "true");
    if (filters.badge) params.append("badge", filters.badge);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.size && filters.size.length > 0) {
      filters.size.forEach(s => params.append("size", s));
    }
    
    // Add sort (disable shuffle when sorting)
    if (sort && sort !== "relevance") {
      params.append("sort", sort);
      params.append("shuffle", "false");
    }
    
    return `${API}/products?${params.toString()}`;
  }, [filters, sort]);

  useEffect(() => {
    setLoading(true);
    const ac = new AbortController();
    
    fetch(apiUrl, { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching products:", error);
          setProducts([]);
        }
        setLoading(false);
      });

    return () => ac.abort();
  }, [apiUrl]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  const selectedSortOption = useMemo(() => {
    const sortOptions = [
      { value: "relevance", label: "Relevance" },
      { value: "price_low", label: "Price: Low to High" },
      { value: "price_high", label: "Price: High to Low" },
      { value: "newest", label: "Newest First" },
      { value: "popularity", label: "Popularity" },
    ];
    return sortOptions.find(opt => opt.value === (sort || "relevance")) || sortOptions[0];
  }, [sort]);

  return (
    <>
      <GiftBoxLoader isLoading={loading} showLoader={showProductLoader} />
      
      <div className="flex gap-6 lg:gap-8">
        {/* Desktop: Filters Sidebar */}
        {showFilters && (
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile: Filter and Sort Buttons */}
          {showFilters && (
            <div className="lg:hidden mb-4 flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex-1 px-4 py-2.5 border rounded-md text-sm font-medium flex items-center justify-center gap-2"
                style={{ borderColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              {showSort && (
                <button
                  onClick={() => setSortOpen(true)}
                  className="flex-1 px-4 py-2.5 border rounded-md text-sm font-medium flex items-center justify-center gap-2"
                  style={{ borderColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sort: {selectedSortOption.label}
                </button>
              )}
            </div>
          )}

          {/* Desktop: Header with Sort */}
          <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="text-sm font-medium" style={{ color: "oklch(55% .02 340)" }}>
              {products.length} {products.length === 1 ? "product" : "products"} found
            </div>
            {showSort && (
              <SortDropdown 
                sort={sort} 
                onSortChange={handleSortChange}
                isMobile={false}
              />
            )}
          </div>

          {/* Mobile: Filters Bottom Sheet */}
          {showFilters && (
            <div className="lg:hidden">
              <ProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={filtersOpen}
                onToggle={() => setFiltersOpen(false)}
                onApply={() => setFiltersOpen(false)}
                onClear={() => {}}
              />
            </div>
          )}

          {/* Mobile: Sort Bottom Sheet */}
          {showSort && (
            <SortDropdown
              sort={sort}
              onSortChange={handleSortChange}
              isMobile={true}
              isOpen={sortOpen}
              onToggle={() => setSortOpen(!sortOpen)}
            />
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-sm" style={{ color: "oklch(55% .02 340)" }}>
                Loading products...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-base font-medium mb-2" style={{ color: "oklch(20% .02 340)" }}>
                No products found
              </div>
              <div className="text-sm" style={{ color: "oklch(55% .02 340)" }}>
                Try adjusting your filters
              </div>
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
