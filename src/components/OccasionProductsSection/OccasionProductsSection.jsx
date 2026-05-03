import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../../api";
import OccasionSelector from "./OccasionSelector";
import ProductCard from "../ProductCard";
import HorizontalProductCarousel from "../HorizontalProductCarousel";
import { shuffleArray } from "../../utils/shuffle";

function clampInt(raw, { min = 0, max = 50 } = {}) {
  const n = typeof raw === "string" ? parseInt(raw, 10) : typeof raw === "number" ? raw : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(n, min), max);
}

export default function OccasionProductsSection({
  occasions = [],
  title,
  variant = "slider", // "slider" | "grid"
  limit = variant === "slider" ? 10 : undefined,
  defaultSlug,
  asLinks = variant === "grid",
  linkPrefix = "/occasion",
  category, // optional (used on occasion page)
  badgeTextBySlug = {},
  className = "",
}) {
  const list = useMemo(() => (Array.isArray(occasions) ? occasions.filter(Boolean) : []), [occasions]);
  const initialSlug = useMemo(() => defaultSlug || list[0]?.slug || "", [defaultSlug, list]);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const cacheRef = useRef(new Map());
  const abortRef = useRef(null);

  useEffect(() => {
    setSelectedSlug((prev) => prev || initialSlug);
  }, [initialSlug]);

  const selectedOccasion = useMemo(() => list.find((o) => o.slug === selectedSlug) || null, [list, selectedSlug]);
  const badgeText = selectedSlug ? badgeTextBySlug?.[selectedSlug] : null;

  useEffect(() => {
    if (!selectedSlug) return;

    const cached = cacheRef.current.get(`${selectedSlug}::${category || ""}::${limit || ""}`);
    if (cached) {
      setProducts(cached);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("occasion", selectedSlug);
        if (category) params.set("category", category);
        const resolvedLimit = clampInt(limit, { min: 0, max: 50 });
        if (resolvedLimit && resolvedLimit > 0) params.set("limit", String(resolvedLimit));
        // Prefer deterministic results + backend caching for this UX
        params.set("shuffle", "false");

        const res = await fetch(`${API}/products?${params.toString()}`, { signal: ac.signal });
        const data = await res.json();
        const items = shuffleArray(Array.isArray(data) ? data : []);

        cacheRef.current.set(`${selectedSlug}::${category || ""}::${limit || ""}`, items);
        setProducts(items);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setProducts([]);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => ac.abort();
  }, [category, limit, selectedSlug]);

  if (list.length === 0) return null;

  return (
    <section className={["py-6", className].join(" ").trim()}>
      {title ? (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
            {title}
          </h2>
          <Link
            to={linkPrefix}
            className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-300 hover:gap-2 group"
            style={{ color: "oklch(20% .02 340)" }}
          >
            View All
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : null}

      {/* Joined container (selector + products) like FNP */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white" }}>
        <div style={{ backgroundColor: "white", borderBottom: "1px solid oklch(88% .03 340)" }}>
          <OccasionSelector
            occasions={list}
            selectedSlug={selectedSlug}
            onSelect={(occ) => setSelectedSlug(occ.slug)}
            asLinks={asLinks}
            linkPrefix={linkPrefix}
          />
        </div>

        <div className="p-3" style={{ backgroundColor: "oklch(92% .04 340)" }}>
        {variant === "slider" ? (
          <>
            <HorizontalProductCarousel
              title=""
              hideHeader={true}
              products={(Array.isArray(products) ? products : []).map((p) => ({ ...p, badge: badgeText || p.badge }))}
              isLoading={loading}
              showControls={true}
              skeletonCount={5}
              sectionClassName="mt-0"
            />
            {selectedOccasion ? (
              <div className="mt-4 flex justify-center">
                <Link
                  to={`${linkPrefix}/${selectedOccasion.slug}`}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold text-center border transition-all duration-300 hover:shadow-md inline-flex items-center justify-center gap-2"
                  style={{
                    borderColor: "oklch(88% .02 340)",
                    backgroundColor: "white",
                    color: "oklch(20% .02 340)",
                  }}
                >
                  View All {selectedOccasion.name} Gifts
                  <span aria-hidden className="text-lg leading-none">›</span>
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <>
            {selectedOccasion ? (
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: "oklch(20% .02 340)" }}>
                  {selectedOccasion.name}
                </h3>
                {selectedOccasion.description ? (
                  <p className="mt-1 text-sm" style={{ color: "oklch(60% .02 340)" }}>
                    {selectedOccasion.description}
                  </p>
                ) : null}
              </div>
            ) : null}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="aspect-[4/5] w-full bg-black/5 animate-pulse" />
                    <div className="p-3.5 space-y-2">
                      <div className="h-3 w-3/4 bg-black/5 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-black/5 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={{ ...p, badge: badgeText || p.badge }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: "oklch(92% .04 340)" }}>
                  <img src="/logo.png" alt="Gift Choice Logo" className="w-14 h-14 object-contain" />
                </div>
                <p className="font-medium" style={{ color: "oklch(60% .02 340)" }}>
                  No products available for this occasion yet
                </p>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </section>
  );
}

