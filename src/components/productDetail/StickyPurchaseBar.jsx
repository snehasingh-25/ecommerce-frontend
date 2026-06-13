export default function StickyPurchaseBar({
  price,
  formattedPrice,
  onAddToCart,
  onBuyNow,
  disabled,
}) {
  if (price == null) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(17,24,39,0.08)] pd-sticky-bar-in"
      style={{ borderColor: "oklch(92% .04 340)" }}
    >
      <div className="px-3 py-2.5 flex items-center gap-2.5 max-w-lg mx-auto">
        <div className="shrink-0 min-w-[4.5rem]">
          <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "oklch(55% .02 340)" }}>
            Price
          </div>
          <div className="text-lg font-extrabold leading-tight" style={{ color: "oklch(20% .02 340)" }}>
            {formattedPrice}
          </div>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={disabled}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed border"
          style={{
            borderColor: "oklch(88% .06 340)",
            color: "oklch(20% .02 340)",
            backgroundColor: "white",
          }}
        >
          Add to Cart
        </button>

        <button
          type="button"
          onClick={onBuyNow}
          disabled={disabled}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{ backgroundColor: "oklch(55% .08 340)" }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
