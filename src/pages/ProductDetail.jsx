import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    const success = addToCart(product, selectedSize, quantity);
    if (success) {
      alert("Added to cart!");
      // Optionally navigate to cart
      // navigate("/cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pink-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link to="/" className="text-pink-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images ? (Array.isArray(product.images) ? product.images : JSON.parse(product.images)) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-pink-600 transition-colors duration-300">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/categories" className="hover:text-pink-600 transition-colors duration-300">
                Categories
              </Link>
            </li>
            {product.category && (
              <>
                <li>/</li>
                <li>
                  <Link
                    to={`/category/${product.category.slug}`}
                    className="hover:text-pink-600 transition-colors duration-300"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-9xl text-pink-200">🎁</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.isFestival && (
                  <span className="px-3 py-1 bg-pink-600 text-white text-sm rounded-full font-semibold">
                    Festival
                  </span>
                )}
                {product.isNew && (
                  <span className="px-3 py-1 bg-pink-600 text-white text-sm rounded-full font-semibold">
                    New Arrival
                  </span>
                )}
                {product.badge && (
                  <span className="px-3 py-1 bg-pink-600 text-white text-sm rounded-full font-semibold">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Select Size:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedSize?.id === size.id
                            ? "border-pink-500 bg-pink-50 shadow-md scale-105"
                            : "border-gray-200 hover:border-pink-300 bg-white hover:shadow-md hover:scale-105 active:scale-95"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {size.label}
                          </div>
                          <div className="text-lg font-bold text-pink-600 mt-1">
                            ₹{size.price}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Quantity:</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-pink-500 flex items-center justify-center font-bold text-gray-700 hover:text-pink-600 transition-all duration-300 hover:bg-pink-50 active:scale-95"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-gray-900 w-12 text-center transition-all duration-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-pink-500 flex items-center justify-center font-bold text-gray-700 hover:text-pink-600 transition-all duration-300 hover:bg-pink-50 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Display */}
              {selectedSize && (
                <div className="bg-pink-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Total:
                    </span>
                    <span className="text-3xl font-bold text-pink-600">
                      ₹{(selectedSize.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (!selectedSize) {
                      alert("Please select a size");
                      return;
                    }
                    const message = `Hi! I'm interested in:\n\nProduct: ${product.name}\nSize: ${selectedSize.label}\nQuantity: ${quantity}\nPrice: ₹${selectedSize.price}\nTotal: ₹${(selectedSize.price * quantity).toFixed(2)}`;
                    window.open(
                      `https://wa.me/917976948872?text=${encodeURIComponent(message)}`
                    );
                  }}
                  disabled={!selectedSize}
                  className="px-6 bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
