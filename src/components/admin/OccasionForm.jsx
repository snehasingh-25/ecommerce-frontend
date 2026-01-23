import { useState, useEffect, useRef } from "react";
import { API } from "../../api";

export default function OccasionForm({ occasion, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (occasion) {
      setFormData({
        name: occasion.name || "",
        slug: occasion.slug || "",
        description: occasion.description || "",
        isActive: occasion.isActive !== undefined ? occasion.isActive : true,
      });
      setExistingImageUrl(occasion.imageUrl || null);
      setImagePreview(occasion.imageUrl || null);
    } else {
      setFormData({ name: "", slug: "", description: "", isActive: true });
      setExistingImageUrl(null);
      setImagePreview(null);
      setImage(null);
    }
  }, [occasion]);

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
      const url = occasion ? `${API}/occasions/${occasion.id}` : `${API}/occasions`;
      const method = occasion ? "PUT" : "POST";

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("isActive", formData.isActive);
      
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
        alert(occasion ? "Occasion updated successfully!" : "Occasion created successfully!");
        onSave();
        setFormData({ name: "", slug: "", description: "", isActive: true });
        setImage(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert("Error: " + (data.error || data.message || "Failed to save occasion"));
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
        {occasion ? "✏️ Edit Occasion" : "➕ Add New Occasion"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Occasion Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({
                ...formData,
                name: e.target.value,
                slug: formData.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
              });
            }}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL-friendly)</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            placeholder="auto-generated"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            rows="2"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Occasion Image</label>
          <div className="space-y-4">
            {(imagePreview || existingImageUrl) && (
              <div className="relative inline-block">
                <img
                  src={imagePreview || existingImageUrl}
                  alt="Occasion preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
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
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Active (visible on frontend)</span>
          </label>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : occasion ? "Update Occasion" : "Create Occasion"}
          </button>
          {occasion && (
            <button
              type="button"
              onClick={() => {
                onSave();
                setFormData({ name: "", slug: "", description: "", isActive: true });
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
