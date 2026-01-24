import { useEffect, useMemo, useRef, useState } from "react";
import { API } from "../../api";

export default function ReelForm({ reel, onSave, onCancel }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    url: "",
    thumbnail: "",
    platform: "native",
    isActive: true,
    order: 0,
    productId: "",
    isTrending: false,
    discountPct: "",
  });
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const initialSnapshotRef = useRef("");

  const snapshot = useMemo(() => JSON.stringify(form), [form]);
  const isDirty = initialSnapshotRef.current !== "" && snapshot !== initialSnapshotRef.current;

  useEffect(() => {
    // load products for linking
    fetch(`${API}/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (reel) {
      setForm({
        title: reel.title || "",
        url: reel.url || "",
        thumbnail: reel.thumbnail || "",
        platform: reel.platform || "native",
        isActive: reel.isActive !== undefined ? reel.isActive : true,
        order: reel.order || 0,
        productId: reel.productId ? String(reel.productId) : "",
        isTrending: !!reel.isTrending,
        discountPct: reel.discountPct !== null && reel.discountPct !== undefined ? String(reel.discountPct) : "",
      });
    } else {
      setForm({
        title: "",
        url: "",
        thumbnail: "",
        platform: "native",
        isActive: true,
        order: 0,
        productId: "",
        isTrending: false,
        discountPct: "",
      });
    }

    setTimeout(() => {
      initialSnapshotRef.current = JSON.stringify(
        reel
          ? {
              title: reel.title || "",
              url: reel.url || "",
              thumbnail: reel.thumbnail || "",
              platform: reel.platform || "native",
              isActive: reel.isActive !== undefined ? reel.isActive : true,
              order: reel.order || 0,
              productId: reel.productId ? String(reel.productId) : "",
              isTrending: !!reel.isTrending,
              discountPct: reel.discountPct !== null && reel.discountPct !== undefined ? String(reel.discountPct) : "",
            }
          : {
              title: "",
              url: "",
              thumbnail: "",
              platform: "native",
              isActive: true,
              order: 0,
              productId: "",
              isTrending: false,
              discountPct: "",
            }
      );
    }, 0);
  }, [reel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    setLoading(true);
    isSubmittingRef.current = true;
    try {
      const token = localStorage.getItem("adminToken");
      const url = reel
        ? `${API}/reels/${reel.id}`
        : `${API}/reels`;
      const method = reel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert(reel ? "Reel updated successfully!" : "Reel added successfully!");
        onSave();
        if (!reel) {
          setForm({
            title: "",
            url: "",
            thumbnail: "",
            platform: "native",
            isActive: true,
            order: 0,
            productId: "",
            isTrending: false,
            discountPct: "",
          });
          initialSnapshotRef.current = "";
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save reel");
      }
    } catch (error) {
      console.error("Error saving reel:", error);
      alert("Error saving reel. Please try again.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (loading) return;
    if (isDirty) {
      const ok = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!ok) return;
    }
    setForm({
      title: "",
      url: "",
      thumbnail: "",
      platform: "native",
      isActive: true,
      order: 0,
      productId: "",
      isTrending: false,
      discountPct: "",
    });
    initialSnapshotRef.current = "";
    onCancel?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }
    if (e.key === "Enter") {
      const tag = e.target?.tagName;
      if (tag === "TEXTAREA") return;
      if (loading) return;
      e.preventDefault();
      formRef.current?.requestSubmit?.();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border" style={{ borderColor: 'oklch(92% .04 340)' }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold" style={{ color: 'oklch(20% .02 340)' }}>
          {reel ? "Edit Reel" : "Add New Reel"}
        </h3>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit?.()}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/40 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'oklch(92% .04 340)' }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'oklch(88% .06 340)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'oklch(92% .04 340)')}
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            )}
            {reel ? "Update" : "Save"}
          </button>
        </div>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
            Title (Optional)
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
            style={{ 
              borderColor: 'oklch(92% .04 340)',
              color: 'oklch(20% .02 340)'
            }}
            placeholder="Reel title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
            Reel Video URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition bg-white"
            style={{
              borderColor: 'oklch(92% .04 340)',
              color: 'oklch(20% .02 340)'
            }}
            placeholder="https://.../reel.mp4"
            required
          />
          <p className="text-xs mt-1" style={{ color: 'oklch(60% .02 340)' }}>
            Use a direct video URL (mp4/webm), ideally vertical 9:16. Muted auto-play is handled on the website.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
            Thumbnail URL (Optional)
          </label>
          <input
            type="url"
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
            style={{ 
              borderColor: 'oklch(92% .04 340)',
              color: 'oklch(20% .02 340)'
            }}
            placeholder="https://example.com/thumbnail.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
            Link Product (Optional)
          </label>
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition bg-white"
            style={{
              borderColor: 'oklch(92% .04 340)',
              color: 'oklch(20% .02 340)'
            }}
          >
            <option value="">No product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
              Discount % (Optional)
            </label>
            <input
              type="number"
              value={form.discountPct}
              onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: 'oklch(92% .04 340)',
                color: 'oklch(20% .02 340)'
              }}
              min="0"
              max="99"
              placeholder="48"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
              Order (Display order)
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: 'oklch(92% .04 340)',
                color: 'oklch(20% .02 340)'
              }}
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
              Platform
            </label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{ 
                borderColor: 'oklch(92% .04 340)',
                color: 'oklch(20% .02 340)'
              }}
            >
              <option value="native">Native (Video URL)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'oklch(40% .02 340)' }}>
              Status
            </label>
            <div className="flex items-center gap-2 h-[42px] px-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
                style={{ accentColor: 'oklch(92% .04 340)' }}
              />
              <label htmlFor="isActive" className="text-sm font-medium" style={{ color: 'oklch(40% .02 340)' }}>
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isTrending"
            checked={form.isTrending}
            onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
            className="w-4 h-4"
            style={{ accentColor: 'oklch(92% .04 340)' }}
          />
          <label htmlFor="isTrending" className="text-sm font-medium" style={{ color: 'oklch(40% .02 340)' }}>
            Trending (highlight badge)
          </label>
        </div>

        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t" style={{ borderColor: "oklch(92% .04 340)" }}>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: 'oklch(92% .04 340)' }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'oklch(88% .06 340)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'oklch(92% .04 340)')}
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              )}
              {reel ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
