function ChevronIcon({ expanded }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function ProductAccordion({ title, children, expanded, onToggle }) {
  return (
    <div
      className="rounded-xl border bg-white overflow-hidden shadow-[0_2px_12px_rgba(17,24,39,0.04)]"
      style={{ borderColor: "oklch(92% .04 340)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left transition-colors duration-200 hover:bg-[oklch(98%_.01_340)]"
        aria-expanded={expanded}
      >
        <span className="text-sm sm:text-base font-bold" style={{ color: "oklch(20% .02 340)" }}>
          {title}
        </span>
        <span style={{ color: "oklch(55% .04 340)" }}>
          <ChevronIcon expanded={expanded} />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm leading-relaxed whitespace-pre-line border-t"
            style={{ color: "oklch(50% .02 340)", borderColor: "oklch(94% .03 340)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
