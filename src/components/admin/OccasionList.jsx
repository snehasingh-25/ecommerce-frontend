import { API } from "../../api";

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

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">All Occasions ({occasions.length})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {occasions.map((occasion) => (
          <div
            key={occasion.id}
            className={`border-2 rounded-lg p-4 hover:border-pink-300 transition overflow-hidden ${
              occasion.isActive ? "border-gray-200" : "border-gray-300 bg-gray-50 opacity-75"
            }`}
          >
            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
              {occasion.imageUrl ? (
                <img
                  src={occasion.imageUrl}
                  alt={occasion.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🎉</span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-lg text-gray-900">{occasion.name}</h4>
              {!occasion.isActive && (
                <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full font-semibold">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Slug: {occasion.slug}</p>
            <p className="text-sm text-pink-600 font-semibold mb-4">
              {occasion._count?.products || 0} products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(occasion)}
                className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(occasion.id)}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
