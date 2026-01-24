import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(() => new Set(["details"]));

  const images = useMemo(() => {
    if (!product?.images) return [];
    if (Array.isArray(product.images)) return product.images;
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [product?.images]);

  const activeImage = images[activeImageIndex] || images[0] || null;

  const toggleSection = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetch(`${API}/products/${id}`, { signal: ac.signal })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (data?.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize(null);
        }
        setQuantity(1);
        setActiveImageIndex(0);
        setLoading(false);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        console.error("Error fetching product:", error);
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    const success = addToCart(product, selectedSize, quantity);
    if (success) {
      alert("Added to cart!");
      // Optionally navigate to cart
      // navigate("/cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pink-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link to="/" className="text-pink-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="mb-5">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm" style={{ color: "oklch(55% .02 340)" }}>
              <li>
                <Link to="/" className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/categories" className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                  Shop
                </Link>
              </li>
              {product.category ? (
                <>
                  <li>/</li>
                  <li>
                    <Link to={`/category/${product.category.slug}`} className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                      {product.category.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li>/</li>
              <li className="font-semibold" style={{ color: "oklch(20% .02 340)" }}>
                {product.name}
              </li>
            </ol>
          </nav>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Media gallery */}
            <section className="lg:col-span-7">
              <div className="lg:flex lg:gap-4">
                {/* Thumbnails (desktop vertical) */}
                {images.length > 1 ? (
                  <div className="hidden lg:flex flex-col gap-3 w-20 shrink-0">
                    {images.slice(0, 8).map((img, idx) => {
                      const active = idx === activeImageIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          onMouseEnter={() => setActiveImageIndex(idx)}
                          className={[
                            "relative rounded-xl overflow-hidden border transition-transform duration-200",
                            active ? "ring-2 ring-offset-2" : "hover:scale-[1.02]",
                          ].join(" ")}
                          style={{
                            borderColor: active ? "oklch(88% .06 340)" : "oklch(92% .04 340)",
                            ringColor: "oklch(88% .06 340)",
                          }}
                        >
                          <div className="aspect-square bg-white">
                            <img
                              src={img}
                              alt={`${product.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              width={96}
                              height={96}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {/* Primary image */}
                <div className="flex-1">
                  <div className="relative rounded-3xl overflow-hidden bg-white border" style={{ borderColor: "oklch(92% .04 340)" }}>
                    <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                      {activeImage ? (
                        <img
                          src={activeImage}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          decoding="async"
                          loading="eager"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "oklch(92% .04 340)" }}>
                          <span className="text-7xl">🎁</span>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {product.isFestival ? (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/90 shadow" style={{ color: "oklch(20% .02 340)" }}>
                            Festival
                          </span>
                        ) : null}
                        {product.isNew ? (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/90 shadow" style={{ color: "oklch(20% .02 340)" }}>
                            New
                          </span>
                        ) : null}
                        {product.badge ? (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-pink-500 text-white shadow">
                            {product.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails (mobile horizontal) */}
                  {images.length > 1 ? (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-2 lg:hidden" style={{ WebkitOverflowScrolling: "touch" }}>
                      {images.slice(0, 10).map((img, idx) => {
                        const active = idx === activeImageIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={[
                              "shrink-0 w-20 rounded-2xl overflow-hidden border transition-transform duration-200",
                              active ? "ring-2 ring-offset-2" : "active:scale-95",
                            ].join(" ")}
                            style={{ borderColor: "oklch(92% .04 340)" }}
                          >
                            <div className="aspect-square bg-white">
                              <img
                                src={img}
                                alt={`${product.name} ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                width={96}
                                height={96}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Right: Sticky buy box */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-6">
                <div className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "oklch(92% .04 340)" }}>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
                    {product.name}
                  </h1>

                  <div className="mt-3 flex items-baseline gap-2">
                    {selectedSize ? (
                      <>
                        <div className="text-2xl font-extrabold" style={{ color: "oklch(20% .02 340)" }}>
                          ₹{Number(selectedSize.price).toFixed(0)}
                        </div>
                        <div className="text-sm font-semibold" style={{ color: "oklch(55% .02 340)" }}>
                          {selectedSize.label}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm font-semibold" style={{ color: "oklch(55% .02 340)" }}>
                        Select a size to see price
                      </div>
                    )}
                  </div>

                  {/* Quick trust row */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] sm:text-xs">
                    <div className="rounded-2xl border px-3 py-2 text-center" style={{ borderColor: "oklch(92% .04 340)", color: "oklch(40% .02 340)" }}>
                      Easy gifting
                    </div>
                    <div className="rounded-2xl border px-3 py-2 text-center" style={{ borderColor: "oklch(92% .04 340)", color: "oklch(40% .02 340)" }}>
                      Secure checkout
                    </div>
                    <div className="rounded-2xl border px-3 py-2 text-center" style={{ borderColor: "oklch(92% .04 340)", color: "oklch(40% .02 340)" }}>
                      Fast support
                    </div>
                  </div>

                  {/* Size selector */}
                  {product.sizes?.length ? (
                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold" style={{ color: "oklch(20% .02 340)" }}>
                          Select size
                        </div>
                        {selectedSize ? (
                          <div className="text-xs font-semibold" style={{ color: "oklch(55% .02 340)" }}>
                            Selected: {selectedSize.label}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {product.sizes.map((size) => {
                          const active = selectedSize?.id === size.id;
                          return (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => setSelectedSize(size)}
                              className={[
                                "rounded-2xl border px-4 py-3 text-left transition-transform duration-200",
                                active ? "ring-2 ring-offset-2" : "hover:shadow-sm active:scale-[0.99]",
                              ].join(" ")}
                              style={{
                                borderColor: active ? "oklch(88% .06 340)" : "oklch(92% .04 340)",
                              }}
                            >
                              <div className="text-sm font-bold" style={{ color: "oklch(20% .02 340)" }}>
                                {size.label}
                              </div>
                              <div className="text-sm font-extrabold mt-0.5" style={{ color: "oklch(40% .02 340)" }}>
                                ₹{Number(size.price).toFixed(0)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: "oklch(92% .04 340)", color: "oklch(55% .02 340)" }}>
                      Sizes are not available for this product.
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mt-6">
                    <div className="text-sm font-bold" style={{ color: "oklch(20% .02 340)" }}>
                      Quantity
                    </div>
                    <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border px-3 py-2" style={{ borderColor: "oklch(92% .04 340)" }}>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-xl border font-black"
                        style={{ borderColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
                      >
                        −
                      </button>
                      <div className="w-10 text-center text-lg font-extrabold" style={{ color: "oklch(20% .02 340)" }}>
                        {quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-9 h-9 rounded-xl border font-black"
                        style={{ borderColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  {selectedSize ? (
                    <div className="mt-6 rounded-2xl border px-4 py-4" style={{ borderColor: "oklch(92% .04 340)" }}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold" style={{ color: "oklch(55% .02 340)" }}>
                          Total
                        </div>
                        <div className="text-2xl font-extrabold" style={{ color: "oklch(20% .02 340)" }}>
                          ₹{(Number(selectedSize.price) * quantity).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* CTAs */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedSize}
                      className="w-full py-3 rounded-2xl font-bold transition-transform duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
                    >
                      Add to cart
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedSize) {
                          alert("Please select a size");
                          return;
                        }
                        const message = `Hi! I'm interested in:\n\nProduct: ${product.name}\nSize: ${selectedSize.label}\nQuantity: ${quantity}\nPrice: ₹${selectedSize.price}\nTotal: ₹${(Number(selectedSize.price) * quantity).toFixed(2)}`;
                        window.open(`https://wa.me/917976948872?text=${encodeURIComponent(message)}`);
                      }}
                      disabled={!selectedSize}
                      className="w-full py-3 rounded-2xl font-bold transition-transform duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "oklch(55% .18 145)", color: "white" }}
                    >
                      WhatsApp
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-4 w-full text-sm font-semibold underline"
                    style={{ color: "oklch(40% .02 340)" }}
                  >
                    Continue shopping
                  </button>
                </div>

                {/* Accordions */}
                <div className="mt-4 rounded-3xl border bg-white overflow-hidden" style={{ borderColor: "oklch(92% .04 340)" }}>
                  <button
                    type="button"
                    onClick={() => toggleSection("details")}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="font-bold" style={{ color: "oklch(20% .02 340)" }}>
                      Product details
                    </div>
                    <div className="text-xl font-black" style={{ color: "oklch(40% .02 340)" }}>
                      {expanded.has("details") ? "−" : "+"}
                    </div>
                  </button>
                  {expanded.has("details") ? (
                    <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "oklch(55% .02 340)" }}>
                      {product.description}
                    </div>
                  ) : null}

                  <div className="h-px" style={{ backgroundColor: "oklch(92% .04 340)" }} />

                  <button
                    type="button"
                    onClick={() => toggleSection("delivery")}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="font-bold" style={{ color: "oklch(20% .02 340)" }}>
                      Delivery & returns
                    </div>
                    <div className="text-xl font-black" style={{ color: "oklch(40% .02 340)" }}>
                      {expanded.has("delivery") ? "−" : "+"}
                    </div>
                  </button>
                  {expanded.has("delivery") ? (
                    <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "oklch(55% .02 340)" }}>
                      Ships quickly. For custom gifting queries, use WhatsApp checkout. Returns depend on personalization and product condition.
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
