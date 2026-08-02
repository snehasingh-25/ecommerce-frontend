import { useState } from "react";
import { API } from "../../api";
import { resolveAssetUrl } from "../../utils/imageUrl";
import { useToast } from "../../context/ToastContext";
import ReviewStars from "../reviews/ReviewStars";
import { REVIEWS_SECTION_ID } from "../../constants/reviews";
import { invalidateReviewSummary, useProductReviewsContext } from "../../hooks/useProductReviews";

function InteractiveStarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform active:scale-90"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={star <= value ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={star <= value ? "text-amber-400" : "text-gray-300"}
          >
            <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews() {
  const toast = useToast();
  const ctx = useProductReviewsContext();
  const [form, setForm] = useState({ customerName: "", rating: 5, text: "" });
  const [imageFile, setImageFile] = useState(null);

  if (!ctx) return null;

  const {
    productId,
    reviews,
    totalCount,
    loading,
    showForm,
    setShowForm,
    submitting,
    setSubmitting,
    reload,
  } = ctx;

  const hasReviews = (totalCount ?? 0) > 0;
  const visible = hasReviews || showForm;

  if (!productId || (!visible && !loading)) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.text.trim()) {
      toast.error("Please fill in your name and review");
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("customerName", form.customerName.trim());
      body.append("rating", String(form.rating));
      body.append("text", form.text.trim());
      if (imageFile) body.append("image", imageFile);

      const res = await fetch(`${API}/reviews/product/${productId}`, {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      toast.success(data.message || "Review submitted!");
      setForm({ customerName: "", rating: 5, text: "" });
      setImageFile(null);
      setShowForm(false);
      invalidateReviewSummary(productId);
      reload();
    } catch (err) {
      toast.error(err.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id={REVIEWS_SECTION_ID}
      className="mt-6 scroll-mt-24"
      aria-label="Customer reviews"
    >
      {hasReviews && (
        <div className="flex items-end justify-between mb-4 gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
            Customer Reviews
          </h2>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border transition-colors"
            style={{ borderColor: "oklch(92% .04 340)", color: "oklch(30% .03 340)" }}
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-xl border bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(17,24,39,0.04)] space-y-4"
          style={{ borderColor: "oklch(92% .04 340)" }}
        >
          {!hasReviews && (
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
              Write a Review
            </h2>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(30% .03 340)" }}>
              Your name
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              maxLength={80}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "oklch(92% .04 340)" }}
              placeholder="Priya S."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(30% .03 340)" }}>
              Rating
            </label>
            <InteractiveStarRating
              value={form.rating}
              onChange={(rating) => setForm((f) => ({ ...f, rating }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(30% .03 340)" }}>
              Your review
            </label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
              style={{ borderColor: "oklch(92% .04 340)" }}
              placeholder="Share your experience with this gift..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(30% .03 340)" }}>
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="text-xs w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors"
              style={{ borderColor: "oklch(92% .04 340)", color: "oklch(40% .02 340)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-3 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "oklch(55% .08 340)" }}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
          <p className="text-[11px] text-center" style={{ color: "oklch(55% .02 340)" }}>
            Reviews are moderated before appearing publicly.
          </p>
        </form>
      )}

      {loading && hasReviews ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="shrink-0 w-[17rem] h-36 rounded-xl animate-pulse"
              style={{ backgroundColor: "oklch(96% .02 340)" }}
            />
          ))}
        </div>
      ) : hasReviews ? (
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {reviews.map((review) => (
            <article
              key={review.id}
              className="shrink-0 w-[17rem] sm:w-[19rem] rounded-xl border bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)]"
              style={{ borderColor: "oklch(92% .04 340)" }}
            >
              <div className="flex items-start gap-3">
                {review.imageUrl ? (
                  <img
                    src={resolveAssetUrl(review.imageUrl)}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border"
                    style={{ borderColor: "oklch(92% .04 340)" }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: "#FFF6FA", color: "oklch(55% .06 340)" }}
                  >
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm" style={{ color: "oklch(20% .02 340)" }}>
                    {review.customerName}
                  </div>
                  <ReviewStars rating={review.rating} size={13} />
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed line-clamp-4" style={{ color: "oklch(50% .02 340)" }}>
                {review.text}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
