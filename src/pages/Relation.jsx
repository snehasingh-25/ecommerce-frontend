import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { API } from "../api";
import ProductCard from "../components/ProductCard";
import InfiniteScrollCarousel from "../components/InfiniteScrollCarousel";
import { INFINITE_SCROLL_CAROUSEL_UI } from "../components/infiniteScrollCarouselPresets";

export default function Relation() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [relations, setRelations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = async (category = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) {
        params.append("category", category);
      }
      const qs = params.toString();
      const res = await fetch(`${API}/products${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationProducts = async (relationSlug, category = "") => {
    try {
      if (category) {
        const params = new URLSearchParams();
        params.append("relation", relationSlug);
        params.append("category", category);
        const res = await fetch(`${API}/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data || []);

        const relationRes = await fetch(`${API}/relations/${relationSlug}`);
        const relationData = await relationRes.json();
        setSelectedRelation(relationData);
      } else {
        const res = await fetch(`${API}/relations/${relationSlug}`);
        const data = await res.json();
        setSelectedRelation(data);
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching relation products:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch(`${API}/relations`).then((res) => res.json()),
      fetch(`${API}/categories`).then((res) => res.json()),
    ])
      .then(([relationsData, categoriesData]) => {
        if (!isMounted) return;

        setRelations(relationsData);
        setCategories(categoriesData);

        if (slug) {
          const relation = relationsData.find((r) => r.slug === slug);
          if (relation) {
            setSelectedRelation(relation);
          }
        } else {
          setSelectedRelation(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Error fetching data:", error);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (selectedRelation && slug) {
      fetchRelationProducts(selectedRelation.slug, categoryFilter);
      return;
    }
    if (!slug) {
      fetchAllProducts(categoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, slug, selectedRelation?.slug]);

  const handleRelationClick = (relation) => {
    setSelectedRelation(relation);
    fetchRelationProducts(relation.slug, categoryFilter);
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

  const clearCategoryFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-4 sm:py-6">
        <style>{`@keyframes sk-sweep{0%{background-position:-600px 0}100%{background-position:600px 0}}.sk{background:linear-gradient(90deg,oklch(93% .03 340) 25%,oklch(96% .02 340) 50%,oklch(93% .03 340) 75%);background-size:1200px 100%;animation:sk-sweep 1.5s ease-in-out infinite}`}</style>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sk h-6 w-44 rounded mb-6" />
          {/* Relation tiles */}
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
      <div className="px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <InfiniteScrollCarousel
            variant="relation"
            items={relations}
            ui={INFINITE_SCROLL_CAROUSEL_UI.relation}
            autoScroll={true}
            step={320}
            hideArrowsOnMobile={false}
            trackClassName="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 px-1 sm:px-6"
            onItemClick={handleRelationClick}
            showViewAll={false}
            title="Shop by Relation"
          />
        </div>

        {selectedRelation && slug && (
          <div className="mt-12">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
                {selectedRelation.name}
              </h3>
              {selectedRelation.description && (
                <p className="text-lg mb-4" style={{ color: "oklch(60% .02 340)" }}>
                  {selectedRelation.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6">
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

                {categoryFilter && (
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
                )}
              </div>

              {categoryFilter && (
                <p className="text-sm mb-4" style={{ color: "oklch(60% .02 340)" }}>
                  Showing products in {categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter} category
                </p>
              )}
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: "oklch(92% .04 340)" }}>
                  <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 object-contain" />
                </div>
                <p className="font-medium" style={{ color: "oklch(60% .02 340)" }}>
                  No products available for this relation yet
                </p>
              </div>
            )}
          </div>
        )}

        {!slug && (
          <div className="mt-12">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
                All Products
              </h3>

              <div className="flex flex-wrap items-center gap-4 mb-6">
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

                {categoryFilter && (
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
                )}
              </div>

              {categoryFilter && (
                <p className="text-sm mb-4" style={{ color: "oklch(60% .02 340)" }}>
                  Showing products in {categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter} category
                </p>
              )}
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: "oklch(92% .04 340)" }}>
                  <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 object-contain" />
                </div>
                <p className="font-medium" style={{ color: "oklch(60% .02 340)" }}>
                  No products available yet
                </p>
              </div>
            )}
          </div>
        )}

        {!selectedRelation && relations.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: "oklch(92% .04 340)" }}>
              <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 object-contain" />
            </div>
            <p className="font-medium" style={{ color: "oklch(60% .02 340)" }}>
              No relations available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
