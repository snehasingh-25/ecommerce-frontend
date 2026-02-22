import { useEffect, useRef, useState, memo } from "react";
import ProductCard from "./ProductCard";

function ProductCarousel({ products = [], title = "Products", showAutoScroll = false }) {
  const scrollContainerRef = useRef(null);
  const autoScrollTimeoutRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Initial scroll check
  useEffect(() => {
    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkScroll();
    }, 100);
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      clearTimeout(timeoutId);
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  // Auto-scroll (optional)
  useEffect(() => {
    if (!showAutoScroll || !scrollContainerRef.current || products.length === 0) return;

    const autoScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;

      if (scrollLeft >= maxScroll) {
        // Reset to start with smooth animation
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll to next item (approximately 280px = card width + gap)
        container.scrollBy({ left: 280, behavior: "smooth" });
      }
    };

    autoScrollTimeoutRef.current = setInterval(autoScroll, 5000);

    return () => {
      if (autoScrollTimeoutRef.current) {
        clearInterval(autoScrollTimeoutRef.current);
      }
    };
  }, [products.length, showAutoScroll]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      // Clear auto-scroll when user interacts
      if (autoScrollTimeoutRef.current) {
        clearInterval(autoScrollTimeoutRef.current);
      }

      const scrollAmount = 280; // Approximate card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Restart auto-scroll after user interaction (if enabled)
      if (showAutoScroll) {
        setTimeout(() => {
          autoScrollTimeoutRef.current = setInterval(() => {
            if (scrollContainerRef.current) {
              const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
              const maxScroll = scrollWidth - clientWidth;
              if (scrollLeft >= maxScroll) {
                scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
              } else {
                scrollContainerRef.current.scrollBy({ left: 280, behavior: "smooth" });
              }
            }
          }, 5000);
        }, 500);
      }
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Left Scroll Button - Desktop only */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          style={{ backgroundColor: "white", color: "oklch(20% .02 340)" }}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-48 sm:w-56 md:w-64"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right Scroll Button - Desktop only */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          style={{ backgroundColor: "white", color: "oklch(20% .02 340)" }}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
}

export default memo(ProductCarousel);

