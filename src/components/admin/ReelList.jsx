import { API } from "../../api";

export default function ReelList({ reels, onEdit, onDelete }) {
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
        alert("Reel deleted successfully!");
        onDelete();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete reel");
      }
    } catch (error) {
      console.error("Error deleting reel:", error);
      alert("Error deleting reel. Please try again.");
    }
  };

  if (reels.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border" style={{ borderColor: 'oklch(92% .04 340)' }}>
        <p style={{ color: 'oklch(60% .02 340)' }}>No reels added yet. Add your first reel above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border" style={{ borderColor: 'oklch(92% .04 340)' }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'oklch(20% .02 340)' }}>All Reels</h3>
      <div className="space-y-4">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="p-4 border rounded-lg flex items-center justify-between"
            style={{ borderColor: 'oklch(92% .04 340)' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {reel.thumbnail && (
                  <img
                    src={reel.thumbnail}
                    alt={reel.title || "Reel thumbnail"}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-semibold" style={{ color: 'oklch(20% .02 340)' }}>
                    {reel.title || `Reel #${reel.id}`}
                  </h4>
                  <p className="text-sm" style={{ color: 'oklch(60% .02 340)' }}>
                    {reel.platform} • Order: {reel.order}
                  </p>
                  <p className="text-xs truncate max-w-md" style={{ color: 'oklch(60% .02 340)' }}>
                    {reel.url}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                      reel.isActive ? "text-white" : "text-white"
                    }`}
                    style={{ backgroundColor: reel.isActive ? 'oklch(92% .04 340)' : 'oklch(60% .02 340)' }}
                  >
                    {reel.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(reel)}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                style={{ 
                  backgroundColor: 'oklch(92% .04 340)',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(reel.id)}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                style={{ 
                  backgroundColor: 'oklch(60% .02 340)',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(50% .02 340)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(60% .02 340)'}
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
