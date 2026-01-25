import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { memo, useMemo } from "react";
import { useToast } from "../context/ToastContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const images = useMemo(() => {
    if (!product?.images) return [];
    if (Array.isArray(product.images)) return product.images;
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [product?.images]);

  const handleAddToCart = () => {
    if (!product.sizes || product.sizes.length === 0) {
      toast.error("This product has no sizes available");
      return;
    }

    // If only one size, add directly. Otherwise, navigate to product detail
    if (product.sizes.length === 1) {
      addToCart(product, product.sizes[0], 1);
    } else {
      // Navigate to product detail to select size
      window.location.href = `/product/${product.id}`;
    }
  };

  // Get the lowest price from sizes
  const getLowestPrice = () => {
    if (!product.sizes || product.sizes.length === 0) return null;
    const prices = product.sizes.map(s => parseFloat(s.price));
    return Math.min(...prices);
  };

  const lowestPrice = getLowestPrice();

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <Link to={`/product/${product.id}`}>
        <div className="relative h-64 flex items-center justify-center overflow-hidden cursor-pointer bg-white">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
              width={320}
              height={320}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
              <span className="text-7xl">🎁</span>
            </div>
          )}
          
          {/* Badges - Top Right */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {product.isFestival && (
              <span className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm" style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}>
                Festival
              </span>
            )}
            {product.isNew && (
              <span className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm" style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}>
                New
              </span>
            )}
            {product.badge && (
              <span className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm" style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}>
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-base font-semibold mb-1.5 line-clamp-1 transition-colors cursor-pointer" style={{ color: 'oklch(20% .02 340)' }} onMouseEnter={(e) => e.target.style.color = 'oklch(92% .04 340)'} onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}>
            {product.name}
          </h3>
        </Link>
        <p className="text-sm mb-3 line-clamp-2 min-h-[2.5rem]" style={{ color: 'oklch(50% .02 340)' }}>{product.description}</p>

        {/* Price */}
        {lowestPrice && (
          <div className="mb-3">
            <span className="text-lg font-bold" style={{ color: 'oklch(20% .02 340)' }}>
              ₹{lowestPrice}
              {product.sizes.length > 1 && (
                <span className="text-sm font-normal ml-1" style={{ color: 'oklch(50% .02 340)' }}>onwards</span>
              )}
            </span>
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 rounded-lg font-medium transition-all duration-300 hover:opacity-90 active:scale-95 text-sm flex items-center justify-center gap-2"
          style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add
        </button>
      </div>
    </div>
  );
}

export default memo(ProductCard);