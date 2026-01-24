import { useEffect, useMemo, useRef, useState } from "react";
import { API } from "../../api";
import ImageUpload from "./ImageUpload";

export default function ProductForm({ product, categories, occasions = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    badge: "",
    isFestival: false,
    isNew: false,
    isTrending: false,
    categoryId: "",
    keywords: "",
  });
  const [sizes, setSizes] = useState([{ label: "", price: "" }]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const initialSnapshotRef = useRef("");

  const snapshot = useMemo(() => {
    return JSON.stringify({
      formData,
      sizes,
      existingImages,
      selectedOccasions,
      // For new images, treat any selection as "dirty"
      imagesSelectedCount: images.length,
    });
  }, [formData, sizes, existingImages, selectedOccasions, images.length]);

  const isDirty = initialSnapshotRef.current !== "" && snapshot !== initialSnapshotRef.current;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        badge: product.badge || "",
        isFestival: product.isFestival || false,
        isNew: product.isNew || false,
        isTrending: product.isTrending || false,
        categoryId: product.categoryId || "",
        keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
      });
      setSizes(
        product.sizes && product.sizes.length > 0
          ? product.sizes.map((s) => ({ label: s.label, price: s.price }))
          : [{ label: "", price: "" }]
      );
      setExistingImages(product.images || []);
      setSelectedOccasions(
        product.occasions && product.occasions.length > 0
          ? product.occasions.map((o) => o.id)
          : []
      );
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        badge: "",
        isFestival: false,
        isNew: false,
        isTrending: false,
        categoryId: "",
        keywords: "",
      });
      setSizes([{ label: "", price: "" }]);
      setImages([]);
      setExistingImages([]);
      setSelectedOccasions([]);
    }

    // snapshot after state settles
    setTimeout(() => {
      initialSnapshotRef.current = JSON.stringify({
        formData: product
          ? {
              name: product.name || "",
              description: product.description || "",
              badge: product.badge || "",
              isFestival: product.isFestival || false,
              isNew: product.isNew || false,
              isTrending: product.isTrending || false,
              categoryId: product.categoryId || "",
              keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
            }
          : {
              name: "",
              description: "",
              badge: "",
              isFestival: false,
              isNew: false,
              isTrending: false,
              categoryId: "",
              keywords: "",
            },
        sizes:
          product?.sizes && product.sizes.length > 0
            ? product.sizes.map((s) => ({ label: s.label, price: s.price }))
            : [{ label: "", price: "" }],
        existingImages: product?.images || [],
        selectedOccasions:
          product?.occasions && product.occasions.length > 0 ? product.occasions.map((o) => o.id) : [],
        imagesSelectedCount: 0,
      });
    }, 0);
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    setLoading(true);
    isSubmittingRef.current = true;

    try {
      const token = localStorage.getItem("adminToken");
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("badge", formData.badge);
      formDataToSend.append("isFestival", formData.isFestival);
      formDataToSend.append("isNew", formData.isNew);
      formDataToSend.append("isTrending", formData.isTrending);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("keywords", JSON.stringify(formData.keywords.split(",").map((k) => k.trim()).filter(k => k)));
      formDataToSend.append("sizes", JSON.stringify(sizes.filter((s) => s.label && s.price)));
      formDataToSend.append("occasionIds", JSON.stringify(selectedOccasions));

      if (product && existingImages.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(existingImages));
      }

      images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const url = product ? `${API}/products/${product.id}` : `${API}/products`;
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        alert(product ? "Product updated successfully!" : "Product created successfully!");
        onSave();
        // Reset form
        setFormData({
          name: "",
          description: "",
          badge: "",
          isFestival: false,
          isNew: false,
          isTrending: false,
          categoryId: "",
          keywords: "",
        });
        setSizes([{ label: "", price: "" }]);
        setImages([]);
        setExistingImages([]);
        setSelectedOccasions([]);
        initialSnapshotRef.current = "";
      } else {
        alert("Error: " + (data.error || data.message || "Failed to save product"));
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (loading) return;
    if (isDirty) {
      const ok = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!ok) return;
    }
    // Reset to blank (create mode) and exit edit mode
    setFormData({
      name: "",
      description: "",
      badge: "",
      isFestival: false,
      isNew: false,
      isTrending: false,
      categoryId: "",
      keywords: "",
    });
    setSizes([{ label: "", price: "" }]);
    setImages([]);
    setExistingImages([]);
    setSelectedOccasions([]);
    initialSnapshotRef.current = "";
    onCancel?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }
    if (e.key === "Enter") {
      const tag = e.target?.tagName;
      if (tag === "TEXTAREA") return;
      if (loading) return;
      // Let selects behave normally; still allow Enter to submit otherwise
      e.preventDefault();
      formRef.current?.requestSubmit?.();
    }
  };

  const addSize = () => {
    setSizes([...sizes, { label: "", price: "" }]);
  };

  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {product ? "✏️ Edit Product" : "➕ Add New Product"}
        </h2>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit?.()}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/40 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            )}
            {product ? "Update" : "Save"}
          </button>
        </div>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            rows="4"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Badge (e.g., 60 Min Delivery)</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Keywords (comma separated)</label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              placeholder="gift, present, paisa"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFestival}
                  onChange={(e) => setFormData({ ...formData, isFestival: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Festival Item</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">New Arrival</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Trending</span>
              </label>
            </div>
          </div>
        </div>

        {occasions.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Occasions</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border-2 border-gray-200 rounded-lg">
              {occasions.filter(o => o.isActive).map((occasion) => (
                <label key={occasion.id} className="flex items-center gap-2 cursor-pointer hover:bg-pink-50 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={selectedOccasions.includes(occasion.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOccasions([...selectedOccasions, occasion.id]);
                      } else {
                        setSelectedOccasions(selectedOccasions.filter(id => id !== occasion.id));
                      }
                    }}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">{occasion.name}</span>
                </label>
              ))}
            </div>
            {selectedOccasions.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">Select occasions this product is suitable for (optional)</p>
            )}
          </div>
        )}

        <ImageUpload
          images={images}
          existingImages={existingImages}
          onImagesChange={setImages}
          onExistingImagesChange={setExistingImages}
        />

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-700">Sizes & Prices *</label>
            <button
              type="button"
              onClick={addSize}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
            >
              + Add Size
            </button>
          </div>
          <div className="space-y-3">
            {sizes.map((size, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Size Label (e.g., Small, Large)"
                  value={size.label}
                  onChange={(e) => updateSize(index, "label", e.target.value)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={size.price}
                  onChange={(e) => updateSize(index, "price", e.target.value)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
                  step="0.01"
                  min="0"
                />
                {sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              )}
              {product ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
