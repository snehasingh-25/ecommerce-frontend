import { useState, useEffect } from "react";
import { API } from "../api";

function FilterSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "oklch(20% .02 340)" }}>
          {title}
        </h4>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "oklch(55% .02 340)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function ProductFilters({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle,
  onApply,
  onClear
}) {
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempFilters, setTempFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || "",
    max: filters.maxPrice || ""
  });

  // Sync tempFilters when filters change externally
  useEffect(() => {
    setTempFilters(filters);
    setPriceRange({
      min: filters.minPrice || "",
      max: filters.maxPrice || ""
    });
  }, [filters]);

  useEffect(() => {
    // Fetch filter options
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.occasion) params.append("occasion", filters.occasion);
    
    fetch(`${API}/products/filters?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setFilterOptions(data);
        if (data.priceRange && !filters.minPrice && !filters.maxPrice) {
          setPriceRange({
            min: data.priceRange.min,
            max: data.priceRange.max
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters.category, filters.occasion]);

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    const updatedFilters = {
      ...tempFilters,
      minPrice: newRange.min || undefined,
      maxPrice: newRange.max || undefined
    };
    setTempFilters(updatedFilters);
    // Desktop: apply immediately
    if (window.innerWidth >= 1024) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleSizeToggle = (size) => {
    const currentSizes = tempFilters.size || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    const updatedFilters = {
      ...tempFilters,
      size: newSizes.length > 0 ? newSizes : undefined
    };
    setTempFilters(updatedFilters);
    // Desktop: apply immediately
    if (window.innerWidth >= 1024) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleBadgeToggle = (badge) => {
    const updatedFilters = {
      ...tempFilters,
      badge: tempFilters.badge === badge ? undefined : badge
    };
    setTempFilters(updatedFilters);
    // Desktop: apply immediately
    if (window.innerWidth >= 1024) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleAvailabilityToggle = (key) => {
    const updatedFilters = {
      ...tempFilters,
      [key]: tempFilters[key] ? undefined : true
    };
    setTempFilters(updatedFilters);
    // Desktop: apply immediately
    if (window.innerWidth >= 1024) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    if (onApply) onApply();
    if (window.innerWidth < 1024) {
      onToggle(); // Close mobile panel
    }
  };

  const handleClear = () => {
    const clearedFilters = {
      category: filters.category,
      occasion: filters.occasion,
      search: filters.search
    };
    setTempFilters(clearedFilters);
    if (filterOptions?.priceRange) {
      setPriceRange({
        min: filterOptions.priceRange.min,
        max: filterOptions.priceRange.max
      });
    }
    onFiltersChange(clearedFilters);
    if (onClear) onClear();
  };

  const hasActiveFilters = tempFilters.minPrice || tempFilters.maxPrice || 
    (tempFilters.size && tempFilters.size.length > 0) || tempFilters.badge ||
    tempFilters.isNew || tempFilters.isTrending || tempFilters.isFestival || tempFilters.isReady60Min ||
    (tempFilters.category && tempFilters.category !== filters.category) ||
    (tempFilters.occasion && tempFilters.occasion !== filters.occasion);

  if (loading) {
    return (
      <div className="p-4 lg:p-0">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!filterOptions) return null;

  const handleCategoryToggle = (categorySlug) => {
    const updatedFilters = {
      ...tempFilters,
      category: tempFilters.category === categorySlug ? undefined : categorySlug
    };
    setTempFilters(updatedFilters);
    // Desktop: apply immediately
    if (window.innerWidth >= 1024) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleOccasionToggle = (occasionSlug) => {
    const updatedFilters = {
      ...tempFilters,
      occasion: tempFilters.occasion === occasionSlug ? undefined : occasionSlug
    };
    setTempFilters(updatedFilters);
    // Desktop: apply immediately
    if (window.innerWidth >= 1024) {
      onFiltersChange(updatedFilters);
    }
  };

  const FilterContent = () => (
    <div className="p-4 lg:p-0">
      {/* Categories */}
      {filterOptions.categories && filterOptions.categories.length > 0 && (
        <FilterSection title="Category" defaultOpen={true}>
          <div className="space-y-2">
            {filterOptions.categories.map(category => (
              <label key={category.id} className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="radio"
                  name="category"
                  checked={tempFilters.category === category.slug}
                  onChange={() => handleCategoryToggle(category.slug)}
                  className="w-4 h-4 text-gray-900"
                />
                <span className="text-sm" style={{ color: "oklch(20% .02 340)" }}>
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Occasions */}
      {filterOptions.occasions && filterOptions.occasions.length > 0 && (
        <FilterSection title="Occasion" defaultOpen={true}>
          <div className="space-y-2">
            {filterOptions.occasions.map(occasion => (
              <label key={occasion.id} className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="radio"
                  name="occasion"
                  checked={tempFilters.occasion === occasion.slug}
                  onChange={() => handleOccasionToggle(occasion.slug)}
                  className="w-4 h-4 text-gray-900"
                />
                <span className="text-sm" style={{ color: "oklch(20% .02 340)" }}>
                  {occasion.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      {filterOptions.priceRange && (
        <FilterSection title="Price" defaultOpen={true}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                style={{ borderColor: "oklch(92% .04 340)" }}
                min={filterOptions.priceRange.min}
                max={filterOptions.priceRange.max}
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                style={{ borderColor: "oklch(92% .04 340)" }}
                min={filterOptions.priceRange.min}
                max={filterOptions.priceRange.max}
              />
            </div>
            <div className="text-xs" style={{ color: "oklch(55% .02 340)" }}>
              ₹{filterOptions.priceRange.min} - ₹{filterOptions.priceRange.max}
            </div>
          </div>
        </FilterSection>
      )}

      {/* Sizes */}
      {filterOptions.sizes && filterOptions.sizes.length > 0 && (
        <FilterSection title="Size" defaultOpen={true}>
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map(size => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`
                  px-4 py-2 rounded border text-sm font-medium transition-all
                  ${(tempFilters.size || []).includes(size)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Badges */}
      {filterOptions.badges && filterOptions.badges.length > 0 && (
        <FilterSection title="Badge" defaultOpen={true}>
          <div className="space-y-2">
            {filterOptions.badges.map(badge => (
              <label key={badge} className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="radio"
                  name="badge"
                  checked={tempFilters.badge === badge}
                  onChange={() => handleBadgeToggle(badge)}
                  className="w-4 h-4 text-gray-900"
                />
                <span className="text-sm" style={{ color: "oklch(20% .02 340)" }}>
                  {badge}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Availability */}
      {filterOptions.availability && (
        <FilterSection title="Availability" defaultOpen={true}>
          <div className="space-y-2">
            {filterOptions.availability.isNew && (
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={tempFilters.isNew || false}
                  onChange={() => handleAvailabilityToggle("isNew")}
                  className="w-4 h-4 text-gray-900 rounded"
                />
                <span className="text-sm" style={{ color: "oklch(20% .02 340)" }}>
                  New Arrivals
                </span>
              </label>
            )}
            {filterOptions.availability.isTrending && (
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={tempFilters.isTrending || false}
                  onChange={() => handleAvailabilityToggle("isTrending")}
                  className="w-4 h-4 text-gray-900 rounded"
                />
                <span className="text-sm" style={{ color: "oklch(20% .02 340)" }}>
                  Trending
                </span>
              </label>
            )}
            {filterOptions.availability.isFestival && (
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={tempFilters.isFestival || false}
                  onChange={() => handleAvailabilityToggle("isFestival")}
                  className="w-4 h-4 text-gray-900 rounded"
                />
                <span className="text-sm" style={{ color: "oklch(20% .02 340)" }}>
                  Festival
                </span>
              </label>
            )}
            {filterOptions.availability.isReady60Min && (
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={tempFilters.isReady60Min || false}
                  onChange={() => handleAvailabilityToggle("isReady60Min")}
                  className="w-4 h-4 text-gray-900 rounded"
                />
                <span className="text-sm" style={{ color: "oklch(20% .02 340)" }}>
                  60 Min Ready
                </span>
              </label>
            )}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Desktop: Sticky Sidebar */}
      <aside className={`
        hidden lg:block lg:sticky lg:top-6
        w-64 shrink-0
        h-fit
        bg-white
        border border-gray-200
        rounded-lg
        shadow-sm
        overflow-hidden
      `}>
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: "oklch(20% .02 340)" }}>
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile: Bottom Sheet */}
      <div className={`
        fixed lg:hidden
        bottom-0 left-0 right-0
        bg-white
        rounded-t-2xl
        shadow-2xl
        z-50
        transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
        max-h-[85vh]
        flex flex-col
      `}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: "oklch(20% .02 340)" }}>
            Filters
          </h3>
          <button
            onClick={onToggle}
            className="p-2 -mr-2"
            style={{ color: "oklch(40% .02 340)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          <FilterContent />
        </div>

        {/* Mobile Footer - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-3 border rounded font-medium text-sm"
              style={{ 
                borderColor: "oklch(92% .04 340)",
                color: "oklch(20% .02 340)"
              }}
            >
              Clear All
            </button>
          )}
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 rounded font-medium text-sm text-white"
            style={{ backgroundColor: "oklch(20% .02 340)" }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
