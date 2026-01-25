import { API } from "../../api";
import AdminTable from "./AdminTable";
import { useToast } from "../../context/ToastContext";

export default function ProductList({ products, onEdit, onDelete }) {
  const toast = useToast();
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
        toast.success("Product deleted");
        onDelete();
      } else {
        const data = await res.json();
        toast.error(data.error || data.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
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

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (product) => {
        const images = product.images
          ? Array.isArray(product.images)
            ? product.images
            : JSON.parse(product.images)
          : [];
        return images.length > 0 ? (
          <img
            src={images[0]}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-lg"
          />
        ) : (
          <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
            🎁
          </div>
        );
      },
      searchText: () => "",
    },
    {
      key: "name",
      header: "Name",
      render: (product) => (
        <div>
          <div className="font-semibold text-gray-900">{product.name}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
        </div>
      ),
      searchText: (p) => `${p.name} ${p.description} ${p.keywords ?? ""}`,
    },
    {
      key: "category",
      header: "Category",
      render: (product) => product.category?.name || "N/A",
      searchText: (p) => `${p.category?.name || ""} ${p.category?.slug || ""}`,
    },
    {
      key: "badges",
      header: "Badges",
      render: (product) => (
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
      ),
      searchText: (p) =>
        [
          p.isFestival ? "festival" : "",
          p.isNew ? "new" : "",
          p.isTrending ? "trending" : "",
          p.badge || "",
        ].join(" "),
    },
    {
      key: "sizes",
      header: "Sizes",
      render: (product) => `${product.sizes?.length || 0} sizes`,
      searchText: (p) => String(p.sizes?.length || 0),
    },
  ];

  return (
    <AdminTable
      title="All Products"
      items={safeProducts}
      columns={columns}
      getRowId={(p) => p.id}
      actions={(product) => (
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
      )}
      emptyState={
        <>
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 font-medium">No products yet. Add your first product above!</p>
        </>
      }
    />
  );
}
