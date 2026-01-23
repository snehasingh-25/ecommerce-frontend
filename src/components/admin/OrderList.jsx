import { API } from "../../api";

export default function OrderList({ orders, onUpdate }) {
  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        onUpdate();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || data.message));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-600 font-medium">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">All Orders ({orders.length})</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order.id} className="p-6 hover:bg-gray-50 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-gray-900">Order #{order.id}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-pink-600">₹{order.total?.toFixed(2) || "0.00"}</p>
                <select
                  value={order.status || "pending"}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="mt-2 px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500 transition"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mb-4 space-y-1 text-sm">
              <p><strong>Customer:</strong> {order.customer}</p>
              {order.phone && <p><strong>Phone:</strong> {order.phone}</p>}
              {order.email && <p><strong>Email:</strong> {order.email}</p>}
              {order.address && <p><strong>Address:</strong> {order.address}</p>}
            </div>

            {order.items && order.items.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold mb-2">Items:</p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.productName} ({item.sizeLabel}) × {item.quantity}
                      </span>
                      <span className="font-semibold">₹{item.subtotal?.toFixed(2) || "0.00"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.notes && (
              <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                <p className="text-sm"><strong>Notes:</strong> {order.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
