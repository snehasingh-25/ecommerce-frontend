/**
 * Premium star row — supports fractional fill via rounded rating.
 * Unfilled stars use emptyClassName (default grey).
 */
export default function ReviewStars({ rating = 0, size = 14, className = "", emptyClassName = "text-gray-200" }) {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rounded ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className={star <= rounded ? "text-amber-400" : emptyClassName}
        >
          <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2z" />
        </svg>
      ))}
    </div>
  );
}
