import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReviewStars from "./reviews/ReviewStars";
import {
  GMB_PROFILE_URL,
  GMB_RATING,
  GMB_REVIEW_COUNT,
  GMB_TESTIMONIALS,
} from "../constants/gmbTestimonials";

function GoogleMark({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function TestimonialCard({ testimonial, style }) {
  const initial = testimonial.name?.charAt(0)?.toUpperCase() || "G";

  return (
    <article
      className="gc-testimonial-card shrink-0"
      style={style}
      aria-label={`Review by ${testimonial.name}`}
    >
      <div className="gc-testimonial-card__inner flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="gc-testimonial-avatar" aria-hidden="true">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[oklch(22%_0.03_340)]">
                {testimonial.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <ReviewStars rating={testimonial.rating} size={12} />
                <span className="text-[11px] font-medium text-[oklch(48%_0.03_340)]">
                  {testimonial.rating}.0
                </span>
              </div>
            </div>
          </div>
          <GoogleMark className="h-4 w-4 shrink-0 opacity-80" />
        </div>

        <blockquote className="flex-1 text-[0.9rem] leading-relaxed text-[oklch(32%_0.025_340)]">
          &ldquo;{testimonial.text}&rdquo;
        </blockquote>

        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[oklch(52%_0.03_340)]">
          Google Review
        </p>
      </div>
    </article>
  );
}

export default function TestimonialsSection() {
  const trackRef = useRef(null);
  const setWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  const loopItems = useMemo(
    () => [...GMB_TESTIMONIALS, ...GMB_TESTIMONIALS, ...GMB_TESTIMONIALS],
    [],
  );

  const initScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const setWidth = el.scrollWidth / 3;
    setWidthRef.current = setWidth;
    el.scrollLeft = setWidth;
  }, []);

  const normalizeLoop = useCallback(() => {
    const el = trackRef.current;
    const setWidth = setWidthRef.current;
    if (!el || !setWidth) return;

    if (el.scrollLeft <= setWidth * 0.15) {
      el.scrollLeft += setWidth;
    } else if (el.scrollLeft >= setWidth * 1.85) {
      el.scrollLeft -= setWidth;
    }
  }, []);

  useEffect(() => {
    initScroll();
    window.addEventListener("resize", initScroll);
    return () => window.removeEventListener("resize", initScroll);
  }, [initScroll]);

  useEffect(() => {
    pausedRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    let frameId;
    let lastTime = 0;
    const speed = 0.35;

    const tick = (time) => {
      if (!pausedRef.current && el) {
        if (lastTime) {
          const delta = time - lastTime;
          el.scrollLeft += speed * (delta / 16);
          normalizeLoop();
        }
        lastTime = time;
      } else {
        lastTime = 0;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [normalizeLoop]);

  return (
    <section
      className="gc-testimonials-section relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="gc-testimonials-glow" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
        <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
          <p className="gc-testimonials-eyebrow mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(50%_0.05_340)]">
            Customer Love
          </p>
          <h2
            id="testimonials-heading"
            className="gc-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
          >
            What Our Customers Say
          </h2>
          <p className="gc-subheading mt-3 max-w-xl text-sm sm:text-base">
            Real reviews from shoppers who chose Gift Choice in Bhilwara
          </p>

          <a
            href={GMB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gc-testimonials-rating-pill mt-6 inline-flex items-center gap-2.5"
          >
            <GoogleMark className="h-5 w-5" />
            <ReviewStars rating={GMB_RATING} size={14} />
            <span className="text-sm font-semibold text-[oklch(24%_0.03_340)]">
              {GMB_RATING}
            </span>
            <span className="text-sm text-[oklch(46%_0.03_340)]">
              ({GMB_REVIEW_COUNT}+ Google reviews)
            </span>
          </a>
        </div>

        <div
          className="gc-testimonials-track-wrap"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div
            ref={trackRef}
            className="gc-testimonials-track flex gap-4 overflow-x-auto sm:gap-5"
            onScroll={normalizeLoop}
          >
            {loopItems.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.id}-${index}`}
                testimonial={testimonial}
                style={{ animationDelay: `${(index % GMB_TESTIMONIALS.length) * 80}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href={GMB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gc-testimonials-cta"
          >
            <GoogleMark className="h-4 w-4" />
            Read all reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
}
