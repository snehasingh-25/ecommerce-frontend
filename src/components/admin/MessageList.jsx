import { API } from "../../api";

export default function MessageList({ messages, onUpdate }) {
  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/contact/${messageId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const deleteMessage = async (messageId) => {
    if (!confirm("Delete this message?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API}/contact/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Message deleted successfully!");
        onUpdate();
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || data.message));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
        <div className="text-6xl mb-4">📩</div>
        <p className="text-gray-600 font-medium">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Contact Messages ({messages.length})</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-6 ${!message.read ? "bg-pink-50" : ""}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{message.name}</h4>
                <p className="text-sm text-gray-600">{message.email}</p>
                {message.phone && <p className="text-sm text-gray-600">{message.phone}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString()}
                </p>
                {!message.read && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-pink-500 text-white rounded-full font-semibold">
                    New
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.message}</p>

            <div className="flex gap-2">
              {!message.read && (
                <button
                  onClick={() => markAsRead(message.id)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => deleteMessage(message.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
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
