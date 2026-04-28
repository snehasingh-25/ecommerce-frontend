import { useEffect, useState } from "react";
import { API } from "../api";
import ProductCard from "../components/ProductCard";

const SK = "inline-block bg-gradient-to-r from-[oklch(93%_.03_340)] via-[oklch(96%_.02_340)] to-[oklch(93%_.03_340)] bg-[length:800px_100%] animate-[shimmer_1.5s_ease-in-out_infinite]";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(res => res.json())
      .then(data => { setProducts(data.filter(p => p.isNew)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-4 sm:py-6">
        <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
        <div className="px-1 sm:px-2 lg:px-4">
          <div className={`${SK} h-7 w-40 rounded mb-6`} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <div className={`${SK} aspect-[4/5] w-full rounded`} />
                <div className="mt-2 space-y-2">
                  <div className={`${SK} h-3 w-3/4 rounded`} />
                  <div className={`${SK} h-3 w-1/3 rounded`} />
                  <div className={`${SK} h-9 w-full rounded`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="px-1 sm:px-2 lg:px-4">
        <div className="text-left mb-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">New Arrivals</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

