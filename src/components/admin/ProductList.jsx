import { API } from "../../api";

export default function ProductList({ products, onEdit, onDelete }) {
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Product deleted successfully!");
        onDelete();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || data.message));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (safeProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-gray-600 font-medium">No products yet. Add your first product above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">All Products ({safeProducts.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Badges</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sizes</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {safeProducts.map((product) => {
              const images = product.images ? (Array.isArray(product.images) ? product.images : JSON.parse(product.images)) : [];
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    {images.length > 0 ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                        🎁
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {product.category?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.isFestival && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">
                          Festival
                        </span>
                      )}
                      {product.isNew && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">
                          New
                        </span>
                      )}
                      {product.isTrending && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">
                          Trending
                        </span>
                      )}
                      {product.badge && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-semibold">
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {product.sizes?.length || 0} sizes
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
