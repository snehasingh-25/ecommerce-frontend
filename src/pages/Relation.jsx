import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../api";
import InfiniteScrollCarousel from "../components/InfiniteScrollCarousel";
import { INFINITE_SCROLL_CAROUSEL_UI } from "../components/infiniteScrollCarouselPresets";
import ProductListing from "../components/ProductListing";

export default function Relation() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [relations, setRelations] = useState([]);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch(`${API}/relations`).then((res) => res.json()),
    ])
      .then(([relationsData]) => {
        if (!isMounted) return;

        setRelations(relationsData);
        setLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Error fetching data:", error);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`${API}/relations/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSelectedRelation(data);
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedRelation(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleRelationClick = (relation) => {
    setSelectedRelation(relation);
    navigate(`/relation/${relation.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-4 sm:py-6">
        <style>{`@keyframes sk-sweep{0%{background-position:-600px 0}100%{background-position:600px 0}}.sk{background:linear-gradient(90deg,oklch(93% .03 340) 25%,oklch(96% .02 340) 50%,oklch(93% .03 340) 75%);background-size:1200px 100%;animation:sk-sweep 1.5s ease-in-out infinite}`}</style>
        <div className="px-1 sm:px-2 lg:px-4">
          <div className="sk h-6 w-44 rounded mb-6" />
          {/* Relation tiles */}
          <div className="flex gap-5 overflow-hidden mb-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="sk w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-lg" />
                <div className="sk h-3 w-20 rounded" />
              </div>
            ))}
          </div>
          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <div className="sk aspect-[4/5] w-full rounded" />
                <div className="mt-2 space-y-2">
                  <div className="sk h-3 w-3/4 rounded" />
                  <div className="sk h-3 w-1/3 rounded" />
                  <div className="sk h-9 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6">
      <div className="px-1 sm:px-2 lg:px-4">

        <div className="mb-6">
          <InfiniteScrollCarousel
            variant="relation"
            items={relations}
            ui={INFINITE_SCROLL_CAROUSEL_UI.relation}
            autoScroll={true}
            step={320}
            hideArrowsOnMobile={false}
            trackClassName="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 px-1 sm:px-6"
            onItemClick={handleRelationClick}
            showViewAll={false}
            title="Shop by Relation"
          />
        </div>

        {slug ? (
          <div className="mt-12">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
                {selectedRelation?.name || "Relation"}
              </h3>
              {selectedRelation?.description ? (
                <p className="text-lg mb-4" style={{ color: "oklch(60% .02 340)" }}>
                  {selectedRelation.description}
                </p>
              ) : null}
            </div>

            <ProductListing
              initialFilters={{ relation: slug }}
              showFilters={true}
              showSort={true}
              gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            />
          </div>
        ) : null}

        {!slug ? (
          <div className="mt-12">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
                All Products
              </h3>
            </div>

            <ProductListing
              initialFilters={{}}
              showFilters={true}
              showSort={true}
              gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            />
          </div>
        ) : null}

        {!selectedRelation && relations.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: "oklch(92% .04 340)" }}>
              <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 object-contain" />
            </div>
            <p className="font-medium" style={{ color: "oklch(60% .02 340)" }}>
              No relations available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
