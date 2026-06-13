import { API } from "../../api";
import AdminTable from "./AdminTable";
import { useToast } from "../../context/ToastContext";
import { resolveAssetUrl } from "../../utils/imageUrl";

export default function ReviewList({ reviews, onUpdate }) {
  const toast = useToast();

  const approveReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/reviews/${reviewId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Review approved");
        onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to approve review");
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve review");
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Review deleted");
        onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete review");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (r) => (
        <div>
          <div className="font-semibold text-gray-900 flex items-center gap-2">
            {r.customerName}
            {!r.isApproved && (
              <span className="inline-block px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-semibold">
                Pending
              </span>
            )}
          </div>
          <div className="text-xs text-amber-500 mt-0.5">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
        </div>
      ),
      searchText: (r) => `${r.customerName} ${r.rating}`,
    },
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <span className="text-sm text-gray-700">{r.product?.name || `Product #${r.productId}`}</span>
      ),
      searchText: (r) => r.product?.name || "",
    },
    {
      key: "text",
      header: "Review",
      render: (r) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">{r.text}</p>
      ),
      searchText: (r) => r.text,
    },
    {
      key: "image",
      header: "Photo",
      render: (r) =>
        r.imageUrl ? (
          <img src={resolveAssetUrl(r.imageUrl)} alt="" className="w-10 h-10 rounded object-cover" />
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => (
        <span className="text-xs text-gray-500">
          {new Date(r.createdAt).toLocaleDateString("en-IN")}
        </span>
      ),
      searchText: (r) => String(r.createdAt || ""),
    },
  ];

  return (
    <AdminTable
      title="Product Reviews"
      subtitle="Approve pending reviews before they appear on product pages"
      items={reviews}
      columns={columns}
      getRowId={(r) => r.id}
      actions={(review) => (
        <div className="flex gap-2">
          {!review.isApproved && (
            <button
              type="button"
              onClick={() => approveReview(review.id)}
              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition"
            >
              Approve
            </button>
          )}
          <button
            type="button"
            onClick={() => deleteReview(review.id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      )}
      emptyState={
        <>
          <img src="/logo.png" alt="Gift Choice Logo" className="w-20 h-20 mx-auto mb-4 object-contain opacity-50" />
          <p className="text-gray-600 font-medium">No reviews yet.</p>
        </>
      }
    />
  );
}
