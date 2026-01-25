import { API } from "../../api";
import AdminTable from "./AdminTable";
import { useToast } from "../../context/ToastContext";

export default function ReelList({ reels, onEdit, onDelete }) {
  const toast = useToast();
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/reels/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Reel deleted");
        onDelete();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete reel");
      }
    } catch (error) {
      console.error("Error deleting reel:", error);
      toast.error("Error deleting reel. Please try again.");
    }
  };

  if (reels.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border" style={{ borderColor: 'oklch(92% .04 340)' }}>
        <p style={{ color: 'oklch(60% .02 340)' }}>No reels added yet. Add your first reel above!</p>
      </div>
    );
  }

  const columns = [
    {
      key: "thumb",
      header: "Thumbnail",
      render: (reel) =>
        reel.thumbnail ? (
          <img src={reel.thumbnail} alt={reel.title || "Reel"} className="w-16 h-10 object-cover rounded" />
        ) : (
          <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Gift Choice Logo" className="w-10 h-10 object-contain opacity-50" />
          </div>
        ),
      searchText: () => "",
    },
    {
      key: "title",
      header: "Title",
      render: (reel) => (
        <div>
          <div className="font-semibold text-gray-900">{reel.title || `Reel #${reel.id}`}</div>
          <div className="text-xs text-gray-500 truncate max-w-[18rem]">{reel.videoUrl || reel.url || ""}</div>
        </div>
      ),
      searchText: (r) => `${r.title || ""} ${r.videoUrl || ""} ${r.url || ""}`,
    },
    {
      key: "platform",
      header: "Platform",
      render: (reel) => <span className="font-semibold">{reel.platform}</span>,
      searchText: (r) => r.platform || "",
    },
    {
      key: "product",
      header: "Product",
      render: (reel) => (
        <span className="text-sm font-semibold">{reel.product?.name || (reel.productId ? `#${reel.productId}` : "—")}</span>
      ),
      searchText: (r) => `${r.product?.name || ""} ${r.productId || ""}`,
    },
    {
      key: "trend",
      header: "Trending",
      render: (reel) =>
        reel.isTrending ? (
          <span className="inline-block px-2 py-1 text-xs rounded-full font-semibold bg-yellow-100 text-yellow-800">
            Trending
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
      searchText: (r) => (r.isTrending ? "trending" : ""),
    },
    {
      key: "order",
      header: "Order",
      render: (reel) => <span className="font-semibold">{reel.order}</span>,
      searchText: (r) => String(r.order ?? ""),
    },
    {
      key: "status",
      header: "Status",
      render: (reel) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
            reel.isActive ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {reel.isActive ? "Active" : "Inactive"}
        </span>
      ),
      searchText: (r) => (r.isActive ? "active" : "inactive"),
    },
  ];

  return (
    <AdminTable
      title="All Reels"
      items={reels}
      columns={columns}
      getRowId={(r) => r.id}
      actions={(reel) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(reel)}
            className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(reel.id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      )}
      emptyState={
        <p className="text-gray-600 font-medium">No reels added yet. Add your first reel above!</p>
      }
    />
  );
}
