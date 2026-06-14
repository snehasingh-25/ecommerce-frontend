import { useState, useMemo } from "react";
import { API } from "../../api";
import { useToast } from "../../context/ToastContext";
import OptimizedProductImage from "../OptimizedProductImage";
import { getProductImageList, IMAGE_SIZES } from "../../utils/imageUrl";

export default function SameDayReadyManager({ products = [], onProductUpdate }) {
  const toast = useToast();
  const [filter, setFilter] = useState("all"); // "all" | "enabled" | "disabled"
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(new Set()); // product ids currently being toggled

  const enabledCount = useMemo(
    () => products.filter((p) => p.isReadySameDay).length,
    [products]
  );

  const filtered = useMemo(() => {
    let list = products;
    if (filter === "enabled") list = list.filter((p) => p.isReadySameDay);
    if (filter === "disabled") list = list.filter((p) => !p.isReadySameDay);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, search]);

  const handleToggle = async (product) => {
    if (pending.has(product.id)) return;

    const newValue = !product.isReadySameDay;
    // Optimistic update
    onProductUpdate({ id: product.id, isReadySameDay: newValue });
    setPending((prev) => new Set(prev).add(product.id));

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isReadySameDay: newValue }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update failed");
      }

      const updated = await res.json();
      onProductUpdate({ id: product.id, isReadySameDay: updated.isReadySameDay });
      toast.success(
        newValue
          ? `"${product.name}" marked as Same Day Ready`
          : `"${product.name}" removed from Same Day Ready`
      );
    } catch (e) {
      // Revert on error
      onProductUpdate({ id: product.id, isReadySameDay: !newValue });
      toast.error(e.message || "Failed to update product");
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Same Day Ready</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {enabledCount} of {products.length} products enabled
            </p>
          </div>
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition w-56"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-4">
          {[
            { id: "all", label: "All" },
            { id: "enabled", label: "Enabled" },
            { id: "disabled", label: "Disabled" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                filter === f.id
                  ? "bg-pink-500 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No products found.
          </div>
        ) : (
          filtered.map((product) => {
            const imageList = getProductImageList(product);
            const categoryNames =
              product.categories && product.categories.length > 0
                ? product.categories.map((c) => c.name || c.category?.name).filter(Boolean).join(", ")
                : product.category?.name || "";
            const isOn = product.isReadySameDay;
            const isUpdating = pending.has(product.id);

            return (
              <div
                key={product.id}
                className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition"
              >
                {/* Thumbnail */}
                <div className="shrink-0">
                  {imageList.length > 0 ? (
                    <OptimizedProductImage
                      meta={imageList[0]}
                      variant="thumb"
                      sizes={IMAGE_SIZES.admin}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                      <img src="/logo.png" alt="" className="w-8 h-8 object-contain opacity-40" />
                    </div>
                  )}
                </div>

                {/* Name & category */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{product.name}</p>
                  {categoryNames && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{categoryNames}</p>
                  )}
                </div>

                {/* Status label */}
                <span
                  className={`hidden sm:inline-block shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isOn
                      ? "bg-pink-50 text-pink-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isOn ? "Enabled" : "Disabled"}
                </span>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(product)}
                  disabled={isUpdating}
                  aria-label={`Toggle Same Day Ready for ${product.name}`}
                  aria-checked={isOn}
                  role="switch"
                  className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/40 ${
                    isOn ? "bg-pink-500" : "bg-gray-200"
                  } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      isOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
