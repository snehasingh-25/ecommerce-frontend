import { useState, useEffect, useRef } from "react";
import { API } from "../../api";

export default function BannerForm({ banner, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    isActive: true,
    order: 0,
  });
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        ctaText: banner.ctaText || "",
        ctaLink: banner.ctaLink || "",
        isActive: banner.isActive !== undefined ? banner.isActive : true,
        order: banner.order || 0,
      });
      setExistingImageUrl(banner.imageUrl || null);
      setImagePreview(banner.imageUrl || null);
    } else {
      setFormData({ title: "", subtitle: "", ctaText: "", ctaLink: "", isActive: true, order: 0 });
      setExistingImageUrl(null);
      setImagePreview(null);
      setImage(null);
    }
  }, [banner]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const url = banner ? `${API}/banners/${banner.id}` : `${API}/banners`;
      const method = banner ? "PUT" : "POST";

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("subtitle", formData.subtitle);
      formDataToSend.append("ctaText", formData.ctaText);
      formDataToSend.append("ctaLink", formData.ctaLink);
      formDataToSend.append("isActive", formData.isActive);
      formDataToSend.append("order", formData.order);
      
      if (image) {
        formDataToSend.append("image", image);
      }
      
      if (existingImageUrl && !image) {
        formDataToSend.append("existingImage", existingImageUrl);
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        alert(banner ? "Banner updated successfully!" : "Banner created successfully!");
        onSave();
        setFormData({ title: "", subtitle: "", ctaText: "", ctaLink: "", isActive: true, order: 0 });
        setImage(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Error: " + (data.error || data.message || "Failed to save banner"));
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {banner ? "✏️ Edit Banner" : "➕ Add New Banner"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            placeholder="e.g., Festive Sale, Trending Now"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
          <textarea
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            rows="2"
            placeholder="Optional subtitle text"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Button Text</label>
            <input
              type="text"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              placeholder="e.g., Shop Now, Explore"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Link URL</label>
            <input
              type="text"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              placeholder="e.g., /shop, /occasion/valentines-day"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              min="0"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 mt-8">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Active (visible on frontend)</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image *</label>
          <div className="space-y-4">
            {(imagePreview || existingImageUrl) && (
              <div className="relative inline-block">
                <img
                  src={imagePreview || existingImageUrl}
                  alt="Banner preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  ×
                </button>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required={!banner}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:border-pink-500 hover:text-pink-600 transition w-full"
              >
                {imagePreview || existingImageUrl ? "Change Image" : "Upload Image"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
          </button>
          {banner && (
            <button
              type="button"
              onClick={() => {
                onSave();
                setFormData({ title: "", subtitle: "", ctaText: "", ctaLink: "", isActive: true, order: 0 });
                setImage(null);
                setImagePreview(null);
                setExistingImageUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
