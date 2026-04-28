import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import CarouselArrow from "../CarouselArrow";

function OccasionTile({ occasion, isActive, onSelect, asLink = false, linkPrefix = "/occasion" }) {
  const imageUrl = occasion.imageUrl || null;

  const tile = (
    <button
      type="button"
      onClick={() => onSelect(occasion)}
      className={[
        "relative flex-shrink-0 flex flex-col items-center min-w-[96px] sm:min-w-[110px] focus:outline-none",
        isActive ? "z-10" : "z-0",
      ].join(" ")}
      aria-pressed={isActive}
    >
      <div
        className={[
          "w-full pt-2.5 pb-2 rounded-t-2xl transition-all duration-200",
          isActive ? "shadow-[0_-1px_0_rgba(0,0,0,0.02)]" : "hover:bg-black/[0.02]",
        ].join(" ")}
        style={{
          backgroundColor: isActive ? "oklch(92% .04 340)" : "transparent",
          border: isActive ? "1px solid oklch(88% .03 340)" : "1px solid transparent",
          borderBottomColor: isActive ? "white" : "transparent",
          transform: isActive ? "translateY(1px)" : undefined,
        }}
      >
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center bg-white/60">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={occasion.name}
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <img src="/logo.png" alt="Gift Choice Logo" className="w-10 h-10 object-contain opacity-70" />
            )}
          </div>
          <span className="mt-1.5 text-[0.75rem] sm:text-sm font-medium text-center leading-tight" style={{ color: "oklch(20% .02 340)" }}>
            {occasion.name}
          </span>
          <span className="mt-1 h-[2px] w-10 rounded-full transition-all duration-300" style={{ backgroundColor: isActive ? "oklch(20% .02 340)" : "transparent" }} />
        </div>
      </div>
    </button>
  );

  if (!asLink) return tile;
  return (
    <Link to={`${linkPrefix}/${occasion.slug}`} onClick={() => onSelect(occasion)} className="contents">
      {tile}
    </Link>
  );
}

export default function OccasionSelector({
  occasions,
  selectedSlug,
  onSelect,
  asLinks = false,
  linkPrefix = "/occasion",
  className = "",
}) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const list = useMemo(() => (Array.isArray(occasions) ? occasions.filter(Boolean) : []), [occasions]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 2);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [list.length]);

  const scrollByTile = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const width = first ? first.getBoundingClientRect().width : 140;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const amount = Math.max(120, Math.round(width + gap) * 2);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className={["relative", className].join(" ").trim()}>
      {canLeft ? (
        <CarouselArrow
          direction="left"
          onClick={() => scrollByTile("left")}
          ariaLabel="Scroll occasions left"
          size="sm"
          hideOnMobile={true}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20"
        />
      ) : null}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "smooth",
        }}
      >
        {list.map((occasion) => (
          <OccasionTile
            key={occasion.id ?? occasion.slug}
            occasion={occasion}
            isActive={occasion.slug === selectedSlug}
            onSelect={onSelect}
            asLink={asLinks}
            linkPrefix={linkPrefix}
          />
        ))}
      </div>

      {canRight ? (
        <CarouselArrow
          direction="right"
          onClick={() => scrollByTile("right")}
          ariaLabel="Scroll occasions right"
          size="sm"
          hideOnMobile={true}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20"
        />
      ) : null}
    </div>
  );
}

