import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { API } from "../api";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function CategoriesPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const occasionFilter = searchParams.get("occasion") || "";
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/categories`).then(res => res.json()),
      fetch(`${API}/occasions`).then(res => res.json())
    ])
      .then(([categoriesData, occasionsData]) => {
        setCategories(categoriesData);
        setOccasions(occasionsData);
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
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (selectedCategory && slug) {
      fetchCategoryProducts(selectedCategory.slug, occasionFilter);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [selectedCategory, slug, occasionFilter]);

  const fetchCategoryProducts = async (categorySlug, occasion = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("category", categorySlug);
      if (occasion) {
        params.append("occasion", occasion);
      }
      const res = await fetch(`${API}/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (categoryName) => {
    const emojiMap = {
      "Bottles": "🍼",
      "Soft Toys": "🧸",
      "Gifts": "🎁",
      "Anniversary Gifts": "💍",
      "Birthday Gifts": "🎂",
      "Wedding Gifts": "💒",
      "Engagement Gifts": "💑",
      "Valentines Day": "❤️",
      "Retirement Gifts": "🎊",
      "Rakhi": "🧧",
      "Diwali": "🪔",
    };
    return emojiMap[categoryName] || "🎁";
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (category.slug) {
      fetchCategoryProducts(category.slug, occasionFilter);
    }
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

  const clearOccasionFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("occasion");
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'oklch(20% .02 340)' }}>
            Shop by Category
          </h2>
          <p className="text-lg" style={{ color: 'oklch(60% .02 340)' }}>
            Browse our wide range of gift categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              onClick={() => handleCategoryClick(category)}
              className="group text-center"
            >
              <div
                className="w-full aspect-square rounded-full overflow-hidden mb-3 mx-auto transition-all duration-300 group-hover:scale-125 shadow-md group-hover:shadow-lg"
                style={{ 
                  backgroundColor: 'oklch(92% .04 340)',
                  maxWidth: '150px'
                }}
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl">{getCategoryEmoji(category.name)}</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'oklch(20% .02 340)' }}>
                {category.name}
              </h3>
            </Link>
          ))}
        </div>

        {/* Products for Selected Category */}
        {selectedCategory && slug && (
          <div className="mt-12">
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-2" style={{ color: 'oklch(20% .02 340)' }}>
                {selectedCategory.name}
              </h3>
              {selectedCategory.description && (
                <p className="text-lg mb-4" style={{ color: 'oklch(60% .02 340)' }}>
                  {selectedCategory.description}
                </p>
              )}

              {/* Occasion Filter */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold" style={{ color: 'oklch(40% .02 340)' }}>
                    Filter by Occasion:
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

                {occasionFilter && (
                  <button
                    onClick={clearOccasionFilter}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: 'oklch(92% .04 340)',
                      color: 'oklch(20% .02 340)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {occasionFilter && (
                <p className="text-sm mb-4" style={{ color: 'oklch(60% .02 340)' }}>
                  Showing products for {occasions.find(o => o.slug === occasionFilter)?.name || occasionFilter}
                </p>
              )}
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
                  <span className="text-4xl">🎁</span>
                </div>
                <p className="font-medium" style={{ color: 'oklch(60% .02 340)' }}>
                  No products available in this category yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show all categories if none selected */}
        {!selectedCategory && categories.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
              <span className="text-4xl">📦</span>
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
