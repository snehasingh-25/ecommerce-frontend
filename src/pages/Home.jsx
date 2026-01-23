import { useEffect, useState, useRef } from "react";
import { API } from "../api";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import BannerSlider from "../components/BannerSlider";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [reels, setReels] = useState([]);
  const scrollRef = useRef(null);
  const occasionScrollRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        // Filter trending products
        setTrendingProducts(data.filter(p => p.isTrending));
      });

    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`${API}/occasions`)
      .then(res => res.json())
      .then(data => setOccasions(data));

    fetch(`${API}/reels`)
      .then(res => res.json())
      .then(data => {
        setReels(data);
        // Process Instagram embeds after reels are loaded
        setTimeout(() => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          } else {
            // Load Instagram embed script if not already loaded
            const script = document.createElement('script');
            script.src = '//www.instagram.com/embed.js';
            script.async = true;
            script.onload = () => {
              if (window.instgrm) {
                window.instgrm.Embeds.process();
              }
            };
            document.body.appendChild(script);
          }
        }, 100);
      });
  }, []);

  // Map category names to emojis (fallback if no emoji in category)
  const getCategoryEmoji = (categoryName) => {
    const emojiMap = {
      "Bottles": "🍼",
      "Soft Toys": "🧸",
      "Gifts": "🎁",
      "Anniversary Gifts": "💍",
      "Birthday Gifts": "🎂",
      "Wedding Gifts": "💒",
      "Engagement Gifts": "💑",
      "Valentines Day": "❤️",
      "Retirement Gifts": "🎊",
      "Rakhi": "🧧",
      "Diwali": "🪔",
    };
    return emojiMap[categoryName] || "🎁";
  };

  const scrollCategories = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollOccasions = (direction) => {
    if (occasionScrollRef.current) {
      const scrollAmount = 300;
      occasionScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white fade-in">
      {/* Banner Slider */}
      <BannerSlider />

      {/* Shop By Category Section */}
      {categories.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" style={{ color: 'oklch(20% .02 340)' }}>Shop By Category</h2>
            <Link 
              to="/categories" 
              className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-300 hover:gap-2 group"
              style={{ color: 'oklch(20% .02 340)' }}
              onMouseEnter={(e) => e.target.style.color = 'oklch(40% .02 340)'}
              onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
            >
              View All
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <button
              onClick={() => scrollCategories("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border active:scale-95"
              style={{ borderColor: 'oklch(92% .04 340)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'oklch(92% .04 340)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg className="w-5 h-5" style={{ color: 'oklch(40% .02 340)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="flex-shrink-0 flex flex-col items-center min-w-[140px] group"
                >
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl border-2 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundColor: 'oklch(92% .04 340)',
                      borderColor: 'oklch(92% .04 340)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'oklch(88% .06 340)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                    }}
                  >
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
                        {getCategoryEmoji(category.name)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-center transition-colors mt-2"
                    style={{ color: 'oklch(40% .02 340)' }}
                    onMouseEnter={(e) => e.target.style.color = 'oklch(92% .04 340)'}
                    onMouseLeave={(e) => e.target.style.color = 'oklch(40% .02 340)'}
                  >
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => scrollCategories("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border active:scale-95"
              style={{ borderColor: 'oklch(92% .04 340)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'oklch(92% .04 340)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg className="w-5 h-5" style={{ color: 'oklch(40% .02 340)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ color: 'oklch(20% .02 340)', backgroundColor: 'oklch(92% .04 340)' }}>
              <span className="text-xl">📦</span>
              <p className="text-sm font-medium">No categories available</p>
            </div>
          </div>
        </div>
      )}

      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold" style={{ color: 'oklch(20% .02 340)' }}>Trending Products</h2>
            <Link
              to="/shop"
              className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-300 hover:gap-2 group"
              style={{ color: 'oklch(20% .02 340)' }}
              onMouseEnter={(e) => e.target.style.color = 'oklch(40% .02 340)'}
              onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
            >
              View All
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((p, index) => (
              <div key={p.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop By Occasion Section */}
      {occasions.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" style={{ color: 'oklch(20% .02 340)' }}>Shop By Occasion</h2>
            <Link 
              to="/occasion" 
              className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-300 hover:gap-2 group"
              style={{ color: 'oklch(20% .02 340)' }}
              onMouseEnter={(e) => e.target.style.color = 'oklch(40% .02 340)'}
              onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
            >
              View All
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <button
              onClick={() => scrollOccasions("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border active:scale-95"
              style={{ borderColor: 'oklch(92% .04 340)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'oklch(92% .04 340)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg className="w-5 h-5" style={{ color: 'oklch(40% .02 340)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div
              ref={occasionScrollRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {occasions.map((occasion) => (
                <Link
                  key={occasion.id}
                  to={`/occasion/${occasion.slug}`}
                  className="flex-shrink-0 flex flex-col items-center min-w-[140px] group"
                >
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl border-2 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundColor: 'oklch(92% .04 340)',
                      borderColor: 'oklch(92% .04 340)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'oklch(88% .06 340)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                    }}
                  >
                    {occasion.imageUrl ? (
                      <img
                        src={occasion.imageUrl}
                        alt={occasion.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
                        <span className="text-5xl">🎉</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-center transition-colors mt-2"
                    style={{ color: 'oklch(40% .02 340)' }}
                    onMouseEnter={(e) => e.target.style.color = 'oklch(92% .04 340)'}
                    onMouseLeave={(e) => e.target.style.color = 'oklch(40% .02 340)'}
                  >
                    {occasion.name}
                  </span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => scrollOccasions("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border active:scale-95"
              style={{ borderColor: 'oklch(92% .04 340)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'oklch(92% .04 340)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'oklch(92% .04 340)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg className="w-5 h-5" style={{ color: 'oklch(40% .02 340)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      {/* Trending Gifts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold" style={{ color: 'oklch(20% .02 340)' }}>Gifts</h2>
          {products.length > 0 && (
            <Link
              to="/shop"
              className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-300 hover:gap-2 group"
              style={{ color: 'oklch(20% .02 340)' }}
              onMouseEnter={(e) => e.target.style.color = 'oklch(40% .02 340)'}
              onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
            >
              View All
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((p, index) => (
              <div key={p.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard product={p} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="inline-block p-6 rounded-full mb-4" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
                <span className="text-4xl">🎁</span>
              </div>
              <p className="font-medium" style={{ color: 'oklch(60% .02 340)' }}>No products available</p>
            </div>
          )}
        </div>
      </div>

      {/* Reels Section */}
      {reels.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: 'oklch(20% .02 340)' }}>
            Follow Us <span style={{ color: 'oklch(92% .04 340)' }}>@giftchoice</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reels.map((reel) => {
              // Extract YouTube video ID from URL
              const getYouTubeVideoId = (url) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return match && match[2].length === 11 ? match[2] : null;
              };

              // Extract Instagram shortcode from URL
              const getInstagramShortcode = (url) => {
                const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
                return match ? match[1] : null;
              };

              if (reel.platform === "youtube") {
                const videoId = getYouTubeVideoId(reel.url);
                const embedUrl = videoId 
                  ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
                  : reel.url.includes('embed') 
                    ? reel.url 
                    : reel.url;

                return (
                  <div
                    key={reel.id}
                    className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                    style={{ backgroundColor: 'oklch(92% .04 340)' }}
                  >
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={embedUrl}
                        title={reel.title || "YouTube Reel"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      ></iframe>
                    </div>
                    {reel.title && (
                      <div className="p-3">
                        <p className="text-sm font-medium text-center" style={{ color: 'oklch(20% .02 340)' }}>
                          {reel.title}
                        </p>
                      </div>
                    )}
                  </div>
                );
              } else {
                // Instagram Reel - Use Instagram oEmbed API
                const shortcode = getInstagramShortcode(reel.url);
                
                return (
                  <div
                    key={reel.id}
                    className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                    style={{ backgroundColor: 'oklch(92% .04 340)' }}
                  >
                    {shortcode ? (
                      <div className="relative w-full bg-white rounded-lg" style={{ paddingBottom: "100%", minHeight: '400px' }}>
                        <blockquote
                          className="instagram-media"
                          data-instgrm-permalink={`https://www.instagram.com/reel/${shortcode}/`}
                          data-instgrm-version="14"
                          style={{
                            background: '#FFF',
                            border: 0,
                            borderRadius: '0.5rem',
                            margin: '1px',
                            maxWidth: '100%',
                            minWidth: '326px',
                            padding: 0,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        >
                        </blockquote>
                      </div>
                    ) : (
                      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                        {reel.thumbnail ? (
                          <img
                            src={reel.thumbnail}
                            alt={reel.title || "Instagram Reel"}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center rounded-lg" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
                            <span className="text-6xl">🎬</span>
                          </div>
                        )}
                        <a
                          href={reel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-300 rounded-lg"
                        >
                          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                            <svg
                              className="w-8 h-8 ml-1"
                              style={{ color: 'oklch(20% .02 340)' }}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </a>
                      </div>
                    )}
                    {reel.title && (
                      <div className="p-3">
                        <p className="text-sm font-medium text-center" style={{ color: 'oklch(20% .02 340)' }}>
                          {reel.title}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

    </div>
  );
}
