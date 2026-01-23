import { API } from "../../api";

export default function CategoryList({ categories, onEdit, onDelete }) {
  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Category deleted successfully!");
        onDelete();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || data.message));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <div className="text-6xl mb-4">🏷️</div>
        <p className="text-gray-600 font-medium">No categories yet. Add your first category above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">All Categories ({categories.length})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 transition overflow-hidden"
          >
            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🎁</span>
              )}
            </div>
            <h4 className="font-bold text-lg text-gray-900 mb-2">{category.name}</h4>
            <p className="text-sm text-gray-600 mb-1">Slug: {category.slug}</p>
            <p className="text-sm text-pink-600 font-semibold mb-4">
              {category._count?.products || 0} products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(category)}
                className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
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
