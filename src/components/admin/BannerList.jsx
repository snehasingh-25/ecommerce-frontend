import { API } from "../../api";

export default function BannerList({ banners, onEdit, onDelete }) {
  const handleDelete = async (bannerId) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/banners/${bannerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Banner deleted successfully!");
        onDelete();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || data.message));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (banners.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <div className="text-6xl mb-4">🖼️</div>
        <p className="text-gray-600 font-medium">No banners yet. Add your first banner above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">All Banners ({banners.length})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`border-2 rounded-lg overflow-hidden hover:border-pink-300 transition ${
              banner.isActive ? "border-gray-200" : "border-gray-300 bg-gray-50 opacity-75"
            }`}
          >
            <div className="relative w-full h-48 mb-3 overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100">
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🖼️</span>
                </div>
              )}
              {!banner.isActive && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full font-semibold">
                  Inactive
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-bold text-lg text-gray-900 mb-1">{banner.title}</h4>
              {banner.subtitle && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{banner.subtitle}</p>
              )}
              <div className="flex items-center gap-2 mb-3">
                {banner.ctaText && banner.ctaLink && (
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}>
                    CTA: {banner.ctaText}
                  </span>
                )}
                <span className="text-xs text-gray-500">Order: {banner.order}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(banner)}
                  className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
