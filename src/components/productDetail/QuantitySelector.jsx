export default function QuantitySelector({ quantity, onChange, min = 1 }) {
  const decrease = () => onChange(Math.max(min, quantity - 1));
  const increase = () => onChange(quantity + 1);

  return (
    <div className="inline-flex items-center rounded-xl border bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)] overflow-hidden" style={{ borderColor: "oklch(92% .04 340)" }}>
      <button
        type="button"
        onClick={decrease}
        disabled={quantity <= min}
        className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-bold transition-all duration-200 hover:bg-[oklch(96%_.02_340)] active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ color: "oklch(30% .03 340)" }}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <div
        className="w-10 sm:w-12 text-center text-base sm:text-lg font-extrabold tabular-nums select-none"
        style={{ color: "oklch(20% .02 340)" }}
        aria-live="polite"
      >
        {quantity}
      </div>
      <button
        type="button"
        onClick={increase}
        className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-bold transition-all duration-200 hover:bg-[oklch(96%_.02_340)] active:scale-90"
        style={{ color: "oklch(30% .03 340)" }}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
