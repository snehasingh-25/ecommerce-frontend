import ReviewStars from "./ReviewStars";
import { REVIEWS_SECTION_ID } from "../../constants/reviews";
import { useProductReviewsContext } from "../../hooks/useProductReviews";

export function scrollToProductReviews() {
  const el = document.getElementById(REVIEWS_SECTION_ID);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Detail-page summary — below title, above price.
 * Always shows stars + rating + count (0 with grey stars when no reviews).
 */
export default function ProductReviewSummary() {
  const ctx = useProductReviewsContext();
  if (!ctx) return null;

  const { averageRating, totalCount, loading, showForm, setShowForm } = ctx;

  if (loading) {
    return (
      <div className="mt-2 h-5 w-40 rounded-md animate-pulse" style={{ backgroundColor: "oklch(96% .02 340)" }} />
    );
  }

  const hasReviews = totalCount > 0 && averageRating != null;
  const displayRating = hasReviews ? averageRating : 0;
  const displayCount = totalCount;

  const summaryContent = (
    <>
      <ReviewStars
        rating={displayRating}
        size={15}
        emptyClassName="text-gray-300"
      />
      <span className="text-sm font-semibold tabular-nums" style={{ color: "oklch(25% .03 340)" }}>
        {displayRating}
      </span>
      <span className="text-sm" style={{ color: "oklch(55% .02 340)" }}>
        •
      </span>
      <span
        className={`text-sm font-medium ${hasReviews ? "underline-offset-2 group-hover:underline" : ""}`}
        style={{ color: "oklch(40% .02 340)" }}
      >
        {displayCount} Review{displayCount !== 1 ? "s" : ""}
      </span>
    </>
  );

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {hasReviews ? (
        <button
          type="button"
          onClick={scrollToProductReviews}
          className="group inline-flex flex-wrap items-center gap-2 text-left rounded-md -ml-1 px-1 py-0.5 transition-colors hover:bg-[oklch(98%_.01_340)]"
          aria-label={`${displayRating} out of 5 stars, ${displayCount} reviews. Scroll to reviews.`}
        >
          {summaryContent}
        </button>
      ) : (
        <div
          className="inline-flex flex-wrap items-center gap-2 -ml-1 px-1 py-0.5"
          aria-label="No reviews yet, 0 reviews"
        >
          {summaryContent}
        </div>
      )}

      {!hasReviews && (
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => {
              const next = !v;
              if (next) {
                window.requestAnimationFrame(() => scrollToProductReviews());
              }
              return next;
            });
          }}
          className="text-xs sm:text-sm font-semibold underline-offset-2 hover:underline transition-colors"
          style={{ color: "oklch(40% .02 340)" }}
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      )}
    </div>
  );
}
