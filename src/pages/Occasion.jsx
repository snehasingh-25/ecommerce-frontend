import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "../api";
import OccasionSelector from "../components/OccasionProductsSection/OccasionSelector";
import ProductListing from "../components/ProductListing";

export default function Occasion() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    // Fetch all occasions
    fetch(`${API}/occasions`)
      .then((res) => res.json())
      .then((occasionsData) => {
        if (!isMounted) return;
        
        setOccasions(occasionsData);
        setLoading(false);
      })
      .catch(error => {
        if (!isMounted) return;
        console.error("Error fetching data:", error);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const list = useMemo(() => (Array.isArray(occasions) ? occasions.filter(Boolean) : []), [occasions]);
  const initialSlug = useMemo(() => slug || list[0]?.slug || "", [slug, list]);

  useEffect(() => {
    setSelectedSlug(initialSlug);
  }, [initialSlug]);

  const selectedOccasion = useMemo(
    () => (selectedSlug ? list.find((o) => o.slug === selectedSlug) || null : null),
    [list, selectedSlug]
  );

  const initialFilters = useMemo(
    () => ({
      occasion: selectedSlug || undefined,
      category: categoryFromUrl || undefined,
    }),
    [selectedSlug, categoryFromUrl]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-4 sm:py-6">
        <style>{`@keyframes sk-sweep{0%{background-position:-600px 0}100%{background-position:600px 0}}.sk{background:linear-gradient(90deg,oklch(93% .03 340) 25%,oklch(96% .02 340) 50%,oklch(93% .03 340) 75%);background-size:1200px 100%;animation:sk-sweep 1.5s ease-in-out infinite}`}</style>
        <div className="">
          <div className="sk h-6 w-44 rounded mb-6" />
          {/* Occasion tiles */}
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
      <div className="text-left mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'oklch(20% .02 340)' }}>
            Shop by Occasion
          </h2>
        </div>
        {list.length > 0 ? (
          <div className="mt-6 rounded-2xl overflow-hidden" style={{ backgroundColor: "white" }}>
            <div style={{ backgroundColor: "white", borderBottom: "1px solid oklch(88% .03 340)" }}>
              <OccasionSelector
                occasions={list}
                selectedSlug={selectedSlug}
                onSelect={(occ) => {
                  setSelectedSlug(occ.slug);
                  navigate(`/occasion/${occ.slug}`);
                }}
                asLinks={true}
                linkPrefix="/occasion"
              />
            </div>
            

            <div className="p-3">
              
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

             
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: "oklch(92% .04 340)" }}>
              <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 object-contain" />
            </div>
            <p className="font-medium" style={{ color: "oklch(60% .02 340)" }}>
              No occasions available yet
            </p>
          </div>
        )}

        <div className="">
          <ProductListing
            initialFilters={initialFilters}
            showFilters={true}
            showSort={true}
            gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          />
        </div>
      </div>
    </div>
  );
}
