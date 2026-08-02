import { memo, useMemo } from "react";

const ICONS = {
  sameDay: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden>
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  festival: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden>
      <path
        d="M12 3.5l1.2 3.6 3.8.2-3 2.4 1 3.7L12 11.8 8 13.4l1-3.7-3-2.4 3.8-.2L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 8.5l.4 1.2 1.2.1-1 .8.3 1.2-1-.7-1 .7.3-1.2-1-.8 1.2-.1.4-1.2z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  ),
  isNew: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden>
      <path
        d="M12 5v2M12 17v2M5 12H7M17 12h2M7.8 7.8l1.4 1.4M14.8 14.8l1.4 1.4M7.8 16.2l1.4-1.4M14.8 9.2l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  trending: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden>
      <path
        d="M12 20c2.5-2.2 4-4.4 4-7.2 0-2.6-1.5-4.2-4-6.8-2.5 2.6-4 4.2-4 6.8 0 2.8 1.5 5 4 7.2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 13.5c.9-.7 1.4-1.4 1.4-2.3 0-.9-.5-1.5-1.4-2.4-.9.9-1.4 1.5-1.4 2.4 0 .9.5 1.6 1.4 2.3z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  ),
  custom: (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden>
      <path
        d="M12 3.8l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 14.6 7.8 16.8l.8-4.7-3.4-3.3 4.7-.7L12 3.8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function buildBadgeList(source, { includeSameDay = true } = {}) {
  if (!source) return [];
  const list = [];
  if (includeSameDay && source.isReadySameDay) {
    list.push({ variant: "sameDay", label: "Same Day Ready", icon: ICONS.sameDay });
  }
  if (source.isFestival) {
    list.push({ variant: "festival", label: "Festival", icon: ICONS.festival });
  }
  if (source.isNew) {
    list.push({ variant: "new", label: "New", icon: ICONS.isNew });
  }
  if (source.isTrending) {
    list.push({ variant: "trending", label: "Trending", icon: ICONS.trending });
  }
  if (source.badge) {
    list.push({ variant: "custom", label: String(source.badge), icon: ICONS.custom });
  }
  return list;
}

/** Compact pill for product card pricing row (not image overlay). */
export function SameDayReadyPill({ compact = false, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full shrink-0",
        "bg-green-50 text-green-700 border border-green-100",
        "text-[13px] font-semibold leading-none",
        compact ? "px-1.5 py-0.5" : "px-2 py-0.5",
        className,
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-[13px] h-[13px]"
        aria-hidden
      >
        <path
          d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="whitespace-nowrap">Same Day Ready</span>
    </span>
  );
}

function ProductBadges({ product, badges, placement = "card" }) {
  const source = product || badges;
  const max = placement === "gallery" ? 4 : 3;
  const includeSameDay = placement !== "card";

  const items = useMemo(
    () =>
      buildBadgeList(source, { includeSameDay }).slice(0, max),
    // Primitive fields only — avoid depending on whole product object identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      source?.isReadySameDay,
      source?.isFestival,
      source?.isNew,
      source?.isTrending,
      source?.badge,
      includeSameDay,
      max,
    ]
  );

  if (!items.length) return null;

  const layoutClass =
    placement === "gallery"
      ? "gc-badge-stack gc-badge-stack--gallery"
      : "gc-badge-stack gc-badge-stack--card";

  return (
    <div className={layoutClass} aria-label="Product badges">
      {items.map((item, index) => (
        <span
          key={`${item.variant}-${item.label}`}
          className={`gc-badge gc-badge--${item.variant} gc-badge--${placement}`}
          style={{ "--gc-badge-delay": `${index * 0.65}s` }}
        >
          <span className="gc-badge__icon">{item.icon}</span>
          <span className="gc-badge__label">{item.label}</span>
        </span>
      ))}
    </div>
  );
}

export default memo(ProductBadges);
