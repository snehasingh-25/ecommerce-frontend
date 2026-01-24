import { API } from "../../api";
import AdminTable from "./AdminTable";

export default function OccasionList({ occasions, onEdit, onDelete }) {
  const handleDelete = async (occasionId) => {
    if (!confirm("Are you sure you want to delete this occasion?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/occasions/${occasionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Occasion deleted successfully!");
        onDelete();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || data.message));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (occasions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-gray-600 font-medium">No occasions yet. Add your first occasion above!</p>
      </div>
    );
  }

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (occasion) =>
        occasion.imageUrl ? (
          <img
            src={occasion.imageUrl}
            alt={occasion.name}
            className="w-14 h-14 object-cover rounded-lg"
          />
        ) : (
          <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
            🎉
          </div>
        ),
      searchText: () => "",
    },
    {
      key: "name",
      header: "Name",
      render: (occasion) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-semibold text-gray-900">{occasion.name}</div>
            <div className="text-xs text-gray-500">Slug: {occasion.slug}</div>
          </div>
          {!occasion.isActive && (
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
              Inactive
            </span>
          )}
        </div>
      ),
      searchText: (o) => `${o.name} ${o.slug} ${o.isActive ? "active" : "inactive"}`,
    },
    {
      key: "products",
      header: "Products",
      render: (occasion) => (
        <span className="font-semibold text-pink-600">{occasion._count?.products || 0}</span>
      ),
      searchText: (o) => String(o._count?.products || 0),
    },
    {
      key: "status",
      header: "Status",
      render: (occasion) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
            occasion.isActive ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {occasion.isActive ? "Active" : "Inactive"}
        </span>
      ),
      searchText: (o) => (o.isActive ? "active" : "inactive"),
    },
  ];

  return (
    <AdminTable
      title="All Occasions"
      items={occasions}
      columns={columns}
      getRowId={(o) => o.id}
      actions={(occasion) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(occasion)}
            className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(occasion.id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      )}
      emptyState={
        <>
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-600 font-medium">No occasions yet. Add your first occasion above!</p>
        </>
      }
    />
  );
}
