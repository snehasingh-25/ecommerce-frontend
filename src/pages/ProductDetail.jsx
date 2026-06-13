import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import HorizontalProductCarousel from "../components/HorizontalProductCarousel";
import { MemoReelCarousel as ReelCarousel } from "../components/ReelCarousel";
import ProductGallery from "../components/productDetail/ProductGallery";
import TrustBadges from "../components/productDetail/TrustBadges";
import DeliveryAssurance from "../components/productDetail/DeliveryAssurance";
import QuantitySelector from "../components/productDetail/QuantitySelector";
import StickyPurchaseBar from "../components/productDetail/StickyPurchaseBar";
import ProductAccordion from "../components/productDetail/ProductAccordion";
import ProductReviews from "../components/productDetail/ProductReviews";
import PriceDisplay, { getPriceInfo } from "../components/productDetail/PriceDisplay";
import WhatsAppButton from "../components/productDetail/WhatsAppButton";
import { getProductImageList, getVariantUrl } from "../utils/imageUrl";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null); // "not_found" | "network" | "server"
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(() => new Set());
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [productReels, setProductReels] = useState([]);
  const [globalReels, setGlobalReels] = useState([]);


  const imageList = useMemo(() => (product ? getProductImageList(product) : []), [product]);

  const videos = useMemo(() => {
    if (!product?.videos || !Array.isArray(product.videos)) return [];
    return product.videos;
  }, [product?.videos]);

  const instagramEmbeds = useMemo(() => {
    if (!product?.instagramEmbeds) return [];
    if (Array.isArray(product.instagramEmbeds)) return product.instagramEmbeds.filter(e => e.enabled);
    try {
      const parsed = JSON.parse(product.instagramEmbeds);
      return Array.isArray(parsed) ? parsed.filter(e => e.enabled) : [];
    } catch {
      return [];
    }
  }, [product?.instagramEmbeds]);

  const media = useMemo(() => {
    const imgItems = imageList.map((meta) => ({
      type: "image",
      meta,
      url: getVariantUrl(meta, "large"),
      zoomUrl: getVariantUrl(meta, "original"),
    }));
    const vidItems = videos.map((url) => ({ type: "video", url }));
    const instaItems = instagramEmbeds.map((embed) => ({ type: "instagram", url: embed.url }));
    return [...imgItems, ...vidItems, ...instaItems];
  }, [imageList, videos, instagramEmbeds]);

  const priceInfo = useMemo(() => getPriceInfo(selectedSize, product), [selectedSize, product]);
  const canPurchase = Boolean(selectedSize || (product?.hasSinglePrice && product?.singlePrice));

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
    setLoadError(null);
    setLoading(true);

    // Guard: product IDs in this app are numeric
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || Number.isNaN(numericId)) {
      setProduct(null);
      setLoading(false);
      setLoadError("not_found");
      return () => ac.abort();
    }

    fetch(`${API}/products/${encodeURIComponent(String(id))}`, { signal: ac.signal })
      .then(async (res) => {
        if (res.status === 404) {
          setProduct(null);
          setLoadError("not_found");
          setLoading(false);
          return null;
        }
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP_${res.status}:${text}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return; // handled (e.g. 404)
        setProduct(data);
        // Handle single price products
        if (data?.hasSinglePrice && data.singlePrice) {
          setSelectedSize({
            id: 0,
            label: "Standard",
            price: parseFloat(data.singlePrice),
            originalPrice: data.originalPrice != null && data.originalPrice !== "" ? parseFloat(data.originalPrice) : null,
          });
        } else if (data?.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize(null);
        }
        setQuantity(1);
        setActiveImageIndex(0);
        setLoading(false);

        // Fetch reels linked to this product
        fetch(`${API}/reels`, { signal: ac.signal })
          .then((res) => res.json())
          .then((reelsData) => {
            const allReels = Array.isArray(reelsData) ? reelsData : [];
            const linkedReels = allReels.filter((reel) => Number(reel.productId) === Number(data.id));
            setProductReels(linkedReels);
          })
          .catch((error) => {
            if (error?.name === "AbortError") return;
            setProductReels([]);
          });

        // Also fetch global "Follow Us" reels (separate state)
        fetch(`${API}/reels`, { signal: ac.signal })
          .then((res) => res.json())
          .then((all) => {
            setGlobalReels(Array.isArray(all) ? all : []);
            
          })
          .catch((error) => {
            if (error?.name === "AbortError") return;
            setGlobalReels([]);
            
          });
        // Fetch products from the same occasion as the current product
        const firstOccasion = data?.occasions && data.occasions.length > 0 ? data.occasions[0] : null;
        if (firstOccasion?.slug) {
          setLoadingRecommendations(true);
          fetch(`${API}/products?occasion=${encodeURIComponent(firstOccasion.slug)}&limit=10`, { signal: ac.signal })
            .then((res) => res.json())
            .then((products) => {
              const sameOccasionProducts = Array.isArray(products)
                ? products.filter((p) => Number(p.id) !== Number(data.id))
                : [];
              setRecommendedProducts(sameOccasionProducts);
              setLoadingRecommendations(false);
            })
            .catch((error) => {
              if (error?.name === "AbortError") return;
              console.error("Error fetching occasion products:", error);
              setLoadingRecommendations(false);
            });
        } else {
          setRecommendedProducts([]);
          setLoadingRecommendations(false);
        }

        // Fetch similar products from the same category (use first category if multiple)
        const firstCategory = data?.categories && data.categories.length > 0 ? data.categories[0] : data?.category;
        if (firstCategory?.slug) {
          setLoadingSimilar(true);
          fetch(`${API}/products?category=${firstCategory.slug}&limit=10`, { signal: ac.signal })
            .then((res) => res.json())
            .then((products) => {
              // Filter out the current product
              const similar = Array.isArray(products) 
                ? products.filter((p) => p.id !== Number(id))
                : [];
              setSimilarProducts(similar);
              setLoadingSimilar(false);
            })
            .catch((error) => {
              if (error?.name === "AbortError") return;
              console.error("Error fetching similar products:", error);
              setLoadingSimilar(false);
            });
        } else {
          setLoadingSimilar(false);
        }
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        console.error("Error fetching product:", error);
        setProductReels([]);
        setProduct(null);
        // If fetch fails entirely, it's usually network/DNS/CORS/TLS, not "not found"
        setLoadError(String(error?.message || "").startsWith("HTTP_") ? "server" : "network");
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const handleAddToCart = () => {
    if (!canPurchase) {
      toast.error("Please select a size");
      return;
    }

    const success = addToCart(product, selectedSize, quantity);
    if (success) {
      toast.success("Added to cart");
    }
  };

  const handleBuyNow = () => {
    if (!canPurchase) {
      toast.error("Please select a size");
      return;
    }

    const success = addToCart(product, selectedSize, quantity);
    if (success) {
      navigate("/cart");
    }
  };

  const handleWhatsApp = () => {
    if (!canPurchase) {
      toast.error("Please select a size");
      return;
    }
    const sizeLabel = product.hasSinglePrice ? "Standard" : selectedSize.label;
    const price = product.hasSinglePrice ? product.singlePrice : selectedSize.price;
    const message = `Hi! I'm interested in:\n\nProduct: ${product.name}\n${product.hasSinglePrice ? "" : `Size: ${sizeLabel}\n`}Quantity: ${quantity}\nPrice: ₹${price}\nTotal: ₹${(Number(price) * quantity).toFixed(2)}`;
    window.open(`https://wa.me/917976948872?text=${encodeURIComponent(message)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <style>{`
          @keyframes pd-shimmer {
            0%   { background-position: -600px 0; }
            100% { background-position: 600px 0; }
          }
          .pd-sk {
            background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
            background-size: 1200px 100%;
            animation: pd-shimmer 1.5s ease-in-out infinite;
          }
        `}</style>

        <div className="px-3 sm:px-4 lg:px-4 pt-6 pb-24 lg:pb-16">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2">
            <div className="pd-sk h-3 w-10 rounded" />
            <div className="pd-sk h-3 w-3 rounded" />
            <div className="pd-sk h-3 w-14 rounded" />
            <div className="pd-sk h-3 w-3 rounded" />
            <div className="pd-sk h-3 w-32 rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Media gallery skeleton */}
            <div className="lg:col-span-7">
              <div className="lg:flex lg:gap-4">
                {/* Desktop thumbnails */}
                <div className="hidden lg:flex flex-col gap-3 w-20 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="pd-sk aspect-square w-20 rounded-xl" />
                  ))}
                </div>

                {/* Main image */}
                <div className="flex-1">
                  <div className="pd-sk rounded-3xl w-full" style={{ paddingBottom: "100%" }} />

                  {/* Mobile thumbnails */}
                  <div className="mt-4 flex gap-3 lg:hidden">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="pd-sk shrink-0 w-20 aspect-square rounded-2xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Buy box skeleton */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "oklch(92% .04 340)" }}>
                {/* Title */}
                <div className="pd-sk h-9 w-4/5 rounded-lg" />
                <div className="pd-sk h-9 w-2/3 rounded-lg mt-2" />

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-3">
                  <div className="pd-sk h-8 w-28 rounded-lg" />
                  <div className="pd-sk h-5 w-16 rounded" />
                  <div className="pd-sk h-4 w-12 rounded" />
                </div>

                {/* Size selector */}
                <div className="mt-7">
                  <div className="pd-sk h-4 w-20 rounded mb-3" />
                  <div className="flex gap-2 flex-wrap">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="pd-sk w-12 h-12 rounded-md" />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-6">
                  <div className="pd-sk h-4 w-16 rounded mb-3" />
                  <div className="pd-sk h-[3.25rem] w-36 rounded-2xl" />
                </div>

                {/* Total */}
                <div className="mt-6 rounded-2xl border px-4 py-4" style={{ borderColor: "oklch(92% .04 340)" }}>
                  <div className="flex items-center justify-between">
                    <div className="pd-sk h-4 w-10 rounded" />
                    <div className="pd-sk h-7 w-20 rounded" />
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="pd-sk h-12 rounded-2xl" />
                  <div className="pd-sk h-12 rounded-2xl" />
                </div>

                {/* Continue shopping link */}
                <div className="pd-sk h-4 w-36 rounded mt-4" />
              </div>

              {/* Accordion skeleton */}
              <div className="mt-4 rounded-3xl border bg-white overflow-hidden" style={{ borderColor: "oklch(92% .04 340)" }}>
                {[...Array(2)].map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="pd-sk h-4 w-32 rounded" />
                      <div className="pd-sk h-5 w-5 rounded" />
                    </div>
                    {i < 1 && <div className="h-px" style={{ backgroundColor: "oklch(92% .04 340)" }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {loadError === "network" ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Can’t reach the server</h2>
              <p className="text-sm text-gray-600 mb-5 max-w-sm">
                This link is valid, but your device/browser can’t connect to our API right now. Please check your connection or try again.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
                >
                  Retry
                </button>
                <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                  Go home
                </Link>
              </div>
            </>
          ) : loadError === "server" ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-600 mb-5 max-w-sm">
                We couldn’t load this product due to a server error. Please try again in a moment.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
                >
                  Retry
                </button>
                <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                  Go home
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
              <Link to="/" className="text-pink-600 hover:underline">
                Go back to home
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
      <div className="">
        {/* Top bar */}
        <div className="px-1 sm:px-2 lg:px-4 pt-6">
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
              {product.categories && product.categories.length > 0 ? (
                <>
                  <li>/</li>
                  <li>
                    <Link to={`/category/${product.categories[0].slug}`} className="hover:underline" style={{ color: "oklch(40% .02 340)" }}>
                      {product.categories[0].name}
                    </Link>
                  </li>
                </>
              ) : product.category ? (
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

        <div className="px-3 sm:px-4 lg:px-4 pb-24 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Left: Media gallery */}
            <section className="lg:col-span-7">
              <ProductGallery
                media={media}
                productName={product.name}
                badges={{
                  isReady60Min: product.isReady60Min,
                  isFestival: product.isFestival,
                  isNew: product.isNew,
                  badge: product.badge,
                }}
                activeIndex={activeImageIndex}
                onIndexChange={setActiveImageIndex}
              />
            </section>

            {/* Right: Sticky buy box */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-6 space-y-4">
                <TrustBadges />

                <div className="bg-white">
                  <h1
                    className="text-2xl sm:text-[1.75rem] font-extrabold tracking-tight leading-tight"
                    style={{ color: "oklch(20% .02 340)" }}
                  >
                    {product.name}
                  </h1>

                  <div className="mt-3">
                    <PriceDisplay selectedSize={selectedSize} product={product} />
                  </div>

                  <DeliveryAssurance />

                  {/* Size selector */}
                  {product.sizes?.length ? (
                    <div className="mt-5">
                      <div className="text-sm font-semibold mb-2.5" style={{ color: "oklch(20% .02 340)" }}>
                        Select Size
                      </div>
                      <div
                        className="overflow-x-auto -mx-1 px-1 sm:overflow-x-visible sm:mx-0 sm:px-0 scrollbar-hide"
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        <div className="flex sm:grid sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 min-w-max sm:min-w-0 sm:max-w-2xl">
                          {product.sizes.map((size) => {
                            const active = selectedSize?.id === size.id;
                            return (
                              <button
                                key={size.id}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={[
                                  "relative rounded-xl border text-center transition-all duration-200",
                                  "flex items-center justify-center shrink-0",
                                  "w-12 h-12 sm:w-full aspect-square",
                                  "active:scale-95",
                                  active
                                    ? "border-[oklch(55%_.08_340)] bg-[oklch(55%_.08_340)] text-white font-semibold shadow-sm"
                                    : "bg-white font-medium hover:bg-[oklch(98%_.01_340)]",
                                ].join(" ")}
                                style={!active ? { borderColor: "oklch(92% .04 340)", color: "oklch(30% .03 340)" } : {}}
                                aria-pressed={active}
                                aria-label={`Select size ${size.label}`}
                              >
                                <span className="text-xs sm:text-sm leading-tight">{size.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Quantity */}
                  <div className="mt-5">
                    <div className="text-sm font-semibold mb-2.5" style={{ color: "oklch(20% .02 340)" }}>
                      Quantity
                    </div>
                    <QuantitySelector quantity={quantity} onChange={setQuantity} />
                  </div>

                  {/* Total */}
                  {selectedSize && priceInfo ? (
                    <div
                      className="mt-5 rounded-xl border px-4 py-3.5 shadow-[0_2px_8px_rgba(17,24,39,0.04)]"
                      style={{ borderColor: "oklch(92% .04 340)", backgroundColor: "oklch(98% .01 340)" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold" style={{ color: "oklch(55% .02 340)" }}>
                          Total ({quantity} {quantity === 1 ? "item" : "items"})
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold" style={{ color: "oklch(20% .02 340)" }}>
                          ₹{(priceInfo.price * quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Desktop CTAs */}
                  <div className="mt-5 hidden lg:grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!canPurchase}
                      className="w-full py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      style={{ backgroundColor: "oklch(92% .04 340)", color: "oklch(20% .02 340)" }}
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={!canPurchase}
                      className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      style={{ backgroundColor: "oklch(55% .08 340)" }}
                    >
                      Buy Now
                    </button>
                  </div>

                  <div className="mt-4">
                    <WhatsAppButton onClick={handleWhatsApp} disabled={!canPurchase} />
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-4 w-full text-sm font-semibold hover:underline transition-colors"
                    style={{ color: "oklch(40% .02 340)" }}
                  >
                    Continue shopping
                  </button>
                </div>

                <ProductAccordion
                  title="Product Details"
                  expanded={expanded.has("details")}
                  onToggle={() => toggleSection("details")}
                >
                  {product.description || "No description available."}
                </ProductAccordion>

                <ProductReviews productId={product.id} />
              </div>
            </aside>
          </div>

          {/* Product Reels Section */}
          {productReels.length > 0 && (
            <section className="mt-16 px-1 sm:px-2 lg:px-4">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-6" style={{ color: "oklch(20% .02 340)" }}>
                Product Reels
              </h2>
              <ReelCarousel reels={productReels} />
            </section>
          )}

          {/* You May Also Like */}
          <div className="px-3 sm:px-4 lg:px-4">
            <HorizontalProductCarousel
              title="You May Also Like"
              products={recommendedProducts}
              isLoading={loadingRecommendations}
              excludeProductId={id}
              sectionClassName="mt-8 lg:mt-10"
              showControls={false}
            />
          </div>

          {/* Similar Products Section */}
          <div className="px-3 sm:px-4 lg:px-4">
            <HorizontalProductCarousel
              title="Products from the Same Category"
              products={similarProducts}
              isLoading={loadingSimilar}
              excludeProductId={id}
              sectionClassName="mt-8 lg:mt-10"
              showControls={false}
            />
          </div>

          {globalReels.length > 0 && (
          <div className="py-6 bg-white">
            <div className="px-1 sm:px-2 lg:px-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center tracking-tight" style={{ color: 'oklch(20% .02 340)' }}>
              Follow Us{" "}
              <a
                href="https://www.instagram.com/giftchoicebhl"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
                style={{ color: 'oklch(92% .04 340)' }}
              >
                @giftchoicebhl
              </a>
            </h2>
            <ReelCarousel reels={globalReels} />
            </div>
          </div>
      )}
        </div>
      </div>
    </div>

      <StickyPurchaseBar
        price={priceInfo?.price}
        formattedPrice={priceInfo ? `₹${priceInfo.price.toLocaleString("en-IN")}` : "—"}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        disabled={!canPurchase}
      />
    </>
  );
}
