import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element enters (or approaches) the viewport.
 * @param {object} options
 * @param {string} [options.rootMargin="280px 0px"] — prefetch before fully visible
 * @param {number} [options.threshold=0]
 * @param {boolean} [options.enabled=true]
 */
export function useInView({
  rootMargin = "280px 0px",
  threshold = 0,
  enabled = true,
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!enabled || inView) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, inView, rootMargin, threshold]);

  return { ref, inView };
}
