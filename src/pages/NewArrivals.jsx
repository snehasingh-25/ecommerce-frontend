import { useEffect, useState } from "react";
import { API } from "../api";
import ProductCard from "../components/ProductCard";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(res => res.json())
      .then(data => setProducts(data.filter(p => p.isNew)));
  }, []);

  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-left mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">New Arrivals</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
