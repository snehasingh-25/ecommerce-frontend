import { API } from "../../api";
import AdminTable from "./AdminTable";

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

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (banner) =>
        banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-20 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-20 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            🖼️
          </div>
        ),
      searchText: () => "",
    },
    {
      key: "title",
      header: "Title",
      render: (banner) => (
        <div>
          <div className="font-semibold text-gray-900">{banner.title}</div>
          {banner.subtitle && (
            <div className="text-xs text-gray-500 line-clamp-1">{banner.subtitle}</div>
          )}
        </div>
      ),
      searchText: (b) => `${b.title} ${b.subtitle || ""}`,
    },
    {
      key: "cta",
      header: "CTA",
      render: (banner) =>
        banner.ctaText && banner.ctaLink ? (
          <div className="text-xs">
            <div className="font-semibold text-gray-900">{banner.ctaText}</div>
            <div className="text-gray-500 truncate max-w-[16rem]">{banner.ctaLink}</div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">—</span>
        ),
      searchText: (b) => `${b.ctaText || ""} ${b.ctaLink || ""}`,
    },
    {
      key: "order",
      header: "Order",
      render: (banner) => <span className="font-semibold">{banner.order}</span>,
      searchText: (b) => String(b.order ?? ""),
    },
    {
      key: "status",
      header: "Status",
      render: (banner) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
            banner.isActive ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {banner.isActive ? "Active" : "Inactive"}
        </span>
      ),
      searchText: (b) => (b.isActive ? "active" : "inactive"),
    },
  ];

  return (
    <AdminTable
      title="All Banners"
      items={banners}
      columns={columns}
      getRowId={(b) => b.id}
      actions={(banner) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(banner)}
            className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(banner.id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      )}
      emptyState={
        <>
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-gray-600 font-medium">No banners yet. Add your first banner above!</p>
        </>
      }
    />
  );
}
