const ITEMS = [
  { emoji: "😄", label: "Loved By 20,000+ Customers" },
  { emoji: "⭐", label: "Premium Quality Guaranteed" },
  { emoji: "❤️", label: "Gift That Feels Personal" },
  { emoji: "🚛", label: "On-Time Delivery" },
];

export default function DeliveryAssurance() {
  return (
    <div
      className="mt-4 rounded-xl border bg-white p-3 sm:p-4 shadow-[0_2px_12px_rgba(17,24,39,0.04)]"
      style={{ borderColor: "oklch(92% .04 340)" }}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 sm:px-3 sm:py-2.5"
            style={{ backgroundColor: "oklch(98% .01 340)" }}
          >
            <span className="text-base sm:text-lg shrink-0" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold leading-tight" style={{ color: "oklch(30% .03 340)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
