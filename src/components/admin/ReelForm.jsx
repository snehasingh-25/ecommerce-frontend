import { useState, useEffect } from "react";
import { API } from "../../api";

export default function ReelForm({ reel, onSave }) {
  const [form, setForm] = useState({
    title: "",
    url: "",
    thumbnail: "",
    platform: "youtube",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (reel) {
      setForm({
        title: reel.title || "",
        url: reel.url || "",
        thumbnail: reel.thumbnail || "",
        platform: reel.platform || "youtube",
        isActive: reel.isActive !== undefined ? reel.isActive : true,
        order: reel.order || 0,
      });
    }
  }, [reel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const url = reel
        ? `${API}/reels/${reel.id}`
        : `${API}/reels`;
      const method = reel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert(reel ? "Reel updated successfully!" : "Reel added successfully!");
        onSave();
        if (!reel) {
          setForm({
            title: "",
            url: "",
            thumbnail: "",
            platform: "youtube",
            isActive: true,
            order: 0,
          });
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save reel");
      }
    } catch (error) {
      console.error("Error saving reel:", error);
      alert("Error saving reel. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border" style={{ borderColor: 'oklch(92% .04 340)' }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'oklch(20% .02 340)' }}>
        {reel ? "Edit Reel" : "Add New Reel"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
            Title (Optional)
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
            style={{ 
              borderColor: 'oklch(92% .04 340)',
              color: 'oklch(20% .02 340)'
            }}
            placeholder="Reel title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
            style={{ 
              borderColor: 'oklch(92% .04 340)',
              color: 'oklch(20% .02 340)'
            }}
            placeholder="https://youtube.com/embed/... or Instagram reel URL"
            required
          />
          <p className="text-xs mt-1" style={{ color: 'oklch(60% .02 340)' }}>
            For YouTube: Use any YouTube URL (watch, share, or embed). For Instagram: Use full Instagram reel URL (instagram.com/reel/SHORTCODE/)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
            Thumbnail URL (Optional)
          </label>
          <input
            type="url"
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
            style={{ 
              borderColor: 'oklch(92% .04 340)',
              color: 'oklch(20% .02 340)'
            }}
            placeholder="https://example.com/thumbnail.jpg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
              Platform
            </label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{ 
                borderColor: 'oklch(92% .04 340)',
                color: 'oklch(20% .02 340)'
              }}
            >
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
              Order (Display order)
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{ 
                borderColor: 'oklch(92% .04 340)',
                color: 'oklch(20% .02 340)'
              }}
              min="0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4"
            style={{ accentColor: 'oklch(92% .04 340)' }}
          />
          <label htmlFor="isActive" className="text-sm font-medium" style={{ color: 'oklch(40% .02 340)' }}>
            Active (Show on website)
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 text-white"
          style={{ backgroundColor: 'oklch(92% .04 340)' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
        >
          {reel ? "Update Reel" : "Add Reel"}
        </button>
      </form>
    </div>
  );
}
