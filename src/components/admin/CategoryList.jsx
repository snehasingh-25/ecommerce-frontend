import { API } from "../../api";
import AdminTable from "./AdminTable";
import { useToast } from "../../context/ToastContext";

export default function CategoryList({ categories, onEdit, onDelete }) {
  const toast = useToast();
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
        toast.success("Category deleted");
        onDelete();
      } else {
        const data = await res.json();
        toast.error(data.error || data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <img src="/logo.png" alt="Gift Choice Logo" className="w-20 h-20 mx-auto mb-4 object-contain opacity-50" />
        <p className="text-gray-600 font-medium">No categories yet. Add your first category above!</p>
      </div>
    );
  }

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (category) =>
        category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-14 h-14 object-cover rounded-lg"
          />
        ) : (
          <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
            <img src="/logo.png" alt="Gift Choice Logo" className="w-10 h-10 object-contain opacity-50" />
          </div>
        ),
      searchText: () => "",
    },
    {
      key: "name",
      header: "Name",
      render: (category) => (
        <div>
          <div className="font-semibold text-gray-900">{category.name}</div>
          <div className="text-xs text-gray-500">Slug: {category.slug}</div>
        </div>
      ),
      searchText: (c) => `${c.name} ${c.slug}`,
    },
    {
      key: "order",
      header: "Order",
      render: (category) => <span className="font-semibold">{category.order ?? 0}</span>,
      searchText: (c) => String(c.order ?? 0),
    },
    {
      key: "products",
      header: "Products",
      render: (category) => (
        <span className="font-semibold text-pink-600">
          {category._count?.products || 0}
        </span>
      ),
      searchText: (c) => String(c._count?.products || 0),
    },
  ];

  return (
    <AdminTable
      title="All Categories"
      items={categories}
      columns={columns}
      getRowId={(c) => c.id}
      actions={(category) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      )}
      emptyState={
        <>
          <img src="/logo.png" alt="Gift Choice Logo" className="w-20 h-20 mx-auto mb-4 object-contain opacity-50" />
          <p className="text-gray-600 font-medium">No categories yet. Add your first category above!</p>
        </>
      }
    />
  );
}
