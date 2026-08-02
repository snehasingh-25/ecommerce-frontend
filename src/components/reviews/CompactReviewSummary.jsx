import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReviewStars from "./ReviewStars";
import { REVIEWS_SECTION_ID } from "../../constants/reviews";
import { useReviewSummary } from "../../hooks/useProductReviews";

/**
 * Card/list compact summary — always visible; stars + rating + count.
 * Shows grey empty stars and 0 when there are no reviews.
 */
export default function CompactReviewSummary({ productId, linkToProduct = true, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !productId) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [productId]);

  const { averageRating, totalCount, loading } = useReviewSummary(productId, visible);

  if (!productId) return null;

  const hasReviews = totalCount > 0 && averageRating != null;
  const displayRating = hasReviews ? averageRating : 0;
  const displayCount = loading ? 0 : totalCount;
  const ariaLabel = hasReviews
    ? `${displayRating} stars, ${displayCount} reviews`
    : "No reviews yet, 0 reviews";

  const content = loading ? (
    <span className="inline-flex items-center gap-1.5 animate-pulse" aria-hidden>
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="w-[15px] h-[15px] rounded-sm bg-gray-200" />
        ))}
      </span>
      <span className="h-[15px] w-6 rounded bg-gray-200" />
      <span className="h-[14px] w-5 rounded bg-gray-200" />
    </span>
  ) : (
    <>
      <ReviewStars rating={displayRating} size={15} emptyClassName="text-gray-300" />
      <span className="text-[15px] font-semibold tabular-nums leading-none" style={{ color: "oklch(30% .03 340)" }}>
        {displayRating}
      </span>
      <span className="text-[14px] leading-none" style={{ color: "oklch(60% .02 340)" }}>
        ({displayCount})
      </span>
    </>
  );

  const baseClass = `inline-flex items-center gap-1.5 min-h-[15px] ${className}`;

  if (linkToProduct) {
    return (
      <div ref={ref}>
        <Link
          to={`/product/${productId}#${REVIEWS_SECTION_ID}`}
          className={`${baseClass} hover:opacity-80 transition-opacity`}
          aria-label={ariaLabel}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className={baseClass} aria-label={ariaLabel}>
      {content}
    </div>
  );
}
