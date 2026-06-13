const BADGES = [
  {
    label: "Personalized For You",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 21s-6.5-4.35-9-8.5C1.5 9.5 3.5 5 8 5c2.2 0 3.5 1.5 4 2.5C12.5 6.5 13.8 5 16 5c4.5 0 6.5 4.5 5 7.5C18.5 16.65 12 21 12 21z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Premium Quality",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Handmade With Love",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 8c-1.5-2.5-5-2-5.5 1.5C6 13 12 17 12 17s6-4 5.5-7.5C17 6 13.5 5.5 12 8z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 21h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Fast Delivery",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M3 7h11v8H3zM14 10h3l3 3v2h-6V10z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="1.5" />
        <circle cx="17" cy="17" r="1.5" />
      </svg>
    ),
  },
];

export default function TrustBadges() {
  return (
    <div
      className="rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(17,24,39,0.04)]"
      style={{ backgroundColor: "#FFF6FA" }}
    >
      <div className="grid grid-cols-4 divide-x divide-[oklch(92%_.04_340)]">
        {BADGES.map((badge) => (
          <div
            key={badge.label}
            className="flex flex-col items-center justify-center gap-1.5 px-1.5 py-3 sm:px-3 sm:py-4 text-center"
          >
            <span className="text-[oklch(55%_.06_340)]" aria-hidden="true">
              {badge.icon}
            </span>
            <span
              className="text-[9px] sm:text-[11px] font-semibold leading-tight"
              style={{ color: "oklch(30% .03 340)" }}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
