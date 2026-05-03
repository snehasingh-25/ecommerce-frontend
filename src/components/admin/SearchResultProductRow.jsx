import { parseProductImages } from "./productUtils";

/**
 * A single product row for use in search results.
 * Mirrors the row layout from ProductList but without drag-to-reorder.
 */
export default function SearchResultProductRow({ product, onEdit, onDuplicate, onDelete }) {
  const images = parseProductImages(product.images);

  return (
    <div className="flex items-center gap-4 p-4 transition-all hover:bg-gray-50">
      {/* Image */}
      <div className="flex-shrink-0">
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-lg"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "oklch(92% .04 340)" }}
          >
            <img src="/logo.png" alt="Gift Choice Logo" className="w-10 h-10 object-contain opacity-50" />
          </div>
        )}
      </div>

      {/* Name & Details */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold" style={{ color: "oklch(20% .02 340)" }}>
          {product.name}
        </div>
        <div className="text-xs line-clamp-1" style={{ color: "oklch(50% .02 340)" }}>
          {product.description}
        </div>
        <div className="text-xs mt-1" style={{ color: "oklch(50% .02 340)" }}>
          {product.categories && product.categories.length > 0
            ? product.categories.map((c) => c.name || c.category?.name).join(", ")
            : product.category?.name || "No category"}
        </div>
      </div>

      {/* Badges */}
      <div className="flex-shrink-0 hidden sm:block">
        <div className="flex flex-wrap gap-1">
          {product.isFestival && (
            <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">
              Festival
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">
              New
            </span>
          )}
          {product.isTrending && (
            <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">
              Trending
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-2 flex-wrap">
        <button
          onClick={() => onEdit(product)}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition"
          style={{ backgroundColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "oklch(88% .06 340)")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "oklch(92% .04 340)")}
        >
          Edit
        </button>
        <button
          onClick={() => onDuplicate(product)}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold transition border"
          style={{ borderColor: "oklch(70% .06 340)", color: "oklch(40% .02 340)" }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "oklch(96% .02 340)";
            e.target.style.borderColor = "oklch(60% .06 340)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "";
            e.target.style.borderColor = "oklch(70% .06 340)";
          }}
        >
          Duplicate
        </button>
        <button
          onClick={() => onDelete(product)}
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
