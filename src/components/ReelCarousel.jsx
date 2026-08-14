import { memo, useEffect, useMemo, useRef, useState } from "react";
import { API } from "../api";
import { resolveAssetUrl, resolveVideoUrl } from "../utils/imageUrl";


function getLowestAndHighestPrice(product) {
  const sizes = product?.sizes || [];
  if (!Array.isArray(sizes) || sizes.length === 0) return { low: null, high: null };
  const prices = sizes.map((s) => Number(s.price)).filter((n) => Number.isFinite(n));
  if (!prices.length) return { low: null, high: null };
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

function formatINR(n) {
  if (!Number.isFinite(n)) return "";
  return `₹${Math.round(n)}`;
}

// Detect video URL type and extract embed info
function getVideoEmbedInfo(url) {
  if (!url) return { type: "none", url: null };
  
  const trimmed = url.trim();
  
  // Instagram URL patterns
  const instagramReelMatch = trimmed.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
  const instagramPostMatch = trimmed.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  
  if (instagramReelMatch || instagramPostMatch) {
    const postId = instagramReelMatch?.[1] || instagramPostMatch?.[1];
    const instagramType = instagramReelMatch ? "reel" : "p";
    return {
      type: "instagram",
      postId,
      embedUrl: `https://www.instagram.com/${instagramType}/${postId}/embed/`,
      originalUrl: trimmed,
    };
  }
  
  // YouTube URL patterns
  const youtubePattern = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const youtubeMatch = trimmed.match(youtubePattern);
  if (youtubeMatch) {
    return {
      type: "youtube",
      videoId: youtubeMatch[1],
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      originalUrl: trimmed,
    };
  }
  
  // Direct video file (mp4, webm, etc.)
  if (/\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(trimmed) || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return {
      type: "direct",
      url: trimmed,
    };
  }
  
  // Default to direct (might be a CDN URL or other video host)
  return {
    type: "direct",
    url: trimmed,
  };
}

export default function ReelCarousel({ reels }) {
  const FEATURED_KEY = "featured";
  const scrollerRef = useRef(null);
  const featuredVideoRef = useRef(null);
  const rafRef = useRef(null);
  const activeIndexRef = useRef(0);
  const audioUnlockedRef = useRef(false);
  const videoRefs = useRef(new Map()); // Map of reel.id -> video element
  const iframeRefs = useRef(new Map()); // Map of reel.id -> iframe element
  const [activeIndex, setActiveIndex] = useState(0); // index within base reels
  const [mutedById, setMutedById] = useState(() => new Map());
  const [featuredMuted, setFeaturedMuted] = useState(true); // Featured video starts muted
  /** Which reel currently owns unmuted audio: reel id, FEATURED_KEY, or null */
  const [audioOwnerId, setAudioOwnerId] = useState(null);
  /** User explicitly muted — don't auto-unmute on swipe until they unmute again */
  const [preferMuted, setPreferMuted] = useState(false);
  const [viewedIds, setViewedIds] = useState(() => new Set());
  const [videoReady, setVideoReady] = useState(() => new Set());
  const [videoError, setVideoError] = useState(() => new Set());

  const allReels = Array.isArray(reels) ? reels : [];
  
  // Separate featured reel from regular reels
  const featuredReel = allReels.find(r => r.isFeatured) || null;
  const base = allReels.filter(r => !r.isFeatured);
  const baseCount = base.length;

  const preloadIndices = useMemo(() => {
    if (baseCount === 0) return new Set();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    // Mobile: keep 3 downloaded (1 left, 1 active, 1 right)
    // Tablet/Laptop: keep 5 downloaded (2 left, 1 active, 2 right)
    const range = isMobile ? 1 : 2;
    const set = new Set();
    for (let offset = -range; offset <= range; offset++) {
      const idx = (activeIndex + offset + baseCount) % baseCount;
      set.add(idx);
    }
    return set;
  }, [activeIndex, baseCount]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const unlockAudio = () => {
    audioUnlockedRef.current = true;
  };

  const pauseAllVideosExcept = (exceptId) => {
    videoRefs.current.forEach((video, id) => {
      if (String(id) === String(exceptId)) return;
      try {
        video.pause();
      } catch {
        // ignore
      }
      video.muted = true;
    });
    if (exceptId !== FEATURED_KEY) {
      const fv = featuredVideoRef.current;
      if (fv) {
        try {
          fv.pause();
        } catch {
          // ignore
        }
        fv.muted = true;
      }
    }
  };

  const muteYouTubeExcept = (exceptId) => {
    iframeRefs.current.forEach((iframe, id) => {
      if (!iframe?.src) return;
      try {
        const url = new URL(iframe.src);
        if (!url.hostname.includes("youtube")) return;
        if (exceptId != null && String(id) === String(exceptId)) {
          url.searchParams.set("mute", "0");
          url.searchParams.set("autoplay", "1");
        } else {
          url.searchParams.set("mute", "1");
          url.searchParams.set("autoplay", String(id) === String(exceptId) ? "1" : "0");
        }
        const next = url.toString();
        if (iframe.src !== next) iframe.src = next;
      } catch {
        // ignore
      }
    });
  };

  const setMutedFor = (id, nextMuted) => {
    setMutedById((prev) => {
      const m = new Map(prev);
      m.set(id, nextMuted);
      return m;
    });
  };

  const muteAllCarouselInState = (exceptId = null) => {
    setMutedById(() => {
      const m = new Map();
      base.forEach((r) => {
        m.set(r.id, exceptId == null || String(r.id) !== String(exceptId));
      });
      return m;
    });
  };

  /** Unmute one owner; mute+pause everyone else. */
  const claimAudio = (ownerId) => {
    setAudioOwnerId(ownerId);
    if (ownerId === FEATURED_KEY) {
      setFeaturedMuted(false);
      muteAllCarouselInState(null);
      pauseAllVideosExcept(FEATURED_KEY);
      muteYouTubeExcept(null);
      const fv = featuredVideoRef.current;
      if (fv) {
        fv.muted = false;
        fv.play().catch(() => {});
      }
      return;
    }
    setFeaturedMuted(true);
    muteAllCarouselInState(ownerId);
    pauseAllVideosExcept(ownerId);
    muteYouTubeExcept(ownerId);
    const video = videoRefs.current.get(ownerId);
    if (video) {
      video.muted = false;
      video.play().catch(() => {});
    }
  };

  const releaseAudio = (ownerId) => {
    setAudioOwnerId((prev) => (prev === ownerId || ownerId == null ? null : prev));
    if (ownerId === FEATURED_KEY || ownerId == null) {
      setFeaturedMuted(true);
      const fv = featuredVideoRef.current;
      if (fv) fv.muted = true;
    }
    if (ownerId && ownerId !== FEATURED_KEY) {
      setMutedFor(ownerId, true);
      const video = videoRefs.current.get(ownerId);
      if (video) video.muted = true;
    }
    if (ownerId == null) {
      muteAllCarouselInState(null);
      muteYouTubeExcept(null);
    } else {
      muteYouTubeExcept(null);
    }
  };

  const findClosestCardIndex = (scroller) => {
    if (!scroller) return 0;
    const cards = scroller.querySelectorAll("[data-reel-card='1']");
    if (!cards.length) return 0;
    const rootRect = scroller.getBoundingClientRect();
    const rootCenter = rootRect.left + rootRect.width / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const dist = Math.abs(mid - rootCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    return Math.max(0, Math.min(bestIdx, baseCount - 1));
  };

  const selectCarouselIndex = (i) => {
    const idx = Math.max(0, Math.min(i, baseCount - 1));
    unlockAudio();
    const el = scrollerRef.current;
    const cards = el?.querySelectorAll("[data-reel-card='1']");
    const card = cards?.[idx];
    if (card) {
      card.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
    activeIndexRef.current = idx;
    setActiveIndex(idx);
    if (!preferMuted) {
      const reel = base[idx];
      if (reel) claimAudio(reel.id);
    }
  };

  // Featured: muted autoplay unless a carousel reel owns audio (then pause)
  useEffect(() => {
    if (!featuredReel || !featuredVideoRef.current) return;

    const video = featuredVideoRef.current;
    const videoUrl = featuredReel.videoUrl || featuredReel.url;
    const embedInfo = getVideoEmbedInfo(videoUrl);

    if (embedInfo.type !== "direct" || !embedInfo.url) return;

    const optimizedVideoUrl = resolveVideoUrl(embedInfo.url, { width: 480 });
    if (!video.src || video.src !== optimizedVideoUrl) {
      video.src = optimizedVideoUrl;
      video.load();
    }

    // Carousel owns sound → pause featured
    if (audioOwnerId && audioOwnerId !== FEATURED_KEY) {
      try {
        video.pause();
      } catch {
        // ignore
      }
      video.muted = true;
      return;
    }

    const tryPlay = () => {
      video.muted = featuredMuted;
      video.play().catch((err) => {
        console.warn(`Featured reel autoplay blocked:`, err);
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
      video.addEventListener("loadeddata", tryPlay, { once: true });
    }
  }, [featuredReel, featuredMuted, audioOwnerId]);

  const markReady = (id) => {
    setVideoReady((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setVideoError((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const markError = (id) => {
    setVideoError((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // When active reel changes: play it; auto-claim audio if unlocked and not preferMuted
  useEffect(() => {
    if (baseCount === 0) return;

    const activeReel = base[activeIndex];
    const activeId = activeReel?.id;
    if (activeId == null) return;

    const shouldHaveSound = audioUnlockedRef.current && !preferMuted;

    // Move or clear audio ownership when the centered reel changes
    if (shouldHaveSound) {
      if (String(audioOwnerId) !== String(activeId)) {
        claimAudio(activeId);
        return; // claimAudio + subsequent owner update will re-enter for playback
      }
    } else if (
      audioOwnerId &&
      audioOwnerId !== FEATURED_KEY &&
      String(audioOwnerId) !== String(activeId)
    ) {
      releaseAudio(audioOwnerId);
      return;
    }

    const ownerForMute = shouldHaveSound ? activeId : audioOwnerId;

    const playActiveOnly = () => {
      base.forEach((reel, idx) => {
        const isActive = idx === activeIndex;
        const video = videoRefs.current.get(reel.id);
        const videoUrl = reel.videoUrl || reel.url;
        const embedInfo = getVideoEmbedInfo(videoUrl);

        if (video && embedInfo.type === "direct" && embedInfo.url) {
          const shouldDownload = preloadIndices.has(idx);
          if (shouldDownload) {
            const optimizedVideoUrl = resolveVideoUrl(embedInfo.url, { width: 480 });
            if (isActive) {
              if (!video.src || video.src !== optimizedVideoUrl) {
                video.src = optimizedVideoUrl;
                video.load();
              }
              const muted =
                ownerForMute == null
                  ? true
                  : String(ownerForMute) !== String(reel.id);
              video.muted = muted;
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => markReady(reel.id))
                  .catch((err) => {
                    console.warn(`Reel ${reel.id} autoplay blocked:`, err);
                  });
              }
            } else {
              if (!video.src || video.src !== optimizedVideoUrl) {
                video.src = optimizedVideoUrl;
                video.load();
              }
              try {
                video.pause();
              } catch {
                // ignore
              }
              video.muted = true;
            }
          } else {
            try {
              video.pause();
            } catch {
              // ignore
            }
            if (video.src) {
              video.src = "";
              try { video.load(); } catch {}
            }
            video.muted = true;
          }
        } else if (embedInfo.type === "youtube") {
          const iframe = iframeRefs.current.get(reel.id);
          if (iframe && embedInfo.embedUrl) {
            const shouldMute =
              !isActive ||
              ownerForMute == null ||
              String(ownerForMute) !== String(reel.id);
            const nextSrc = `${embedInfo.embedUrl}?autoplay=${isActive ? 1 : 0}&mute=${shouldMute ? 1 : 0}&loop=1&playlist=${embedInfo.videoId}&controls=0`;
            if (iframe.src !== nextSrc) iframe.src = nextSrc;
          }
          if (isActive) markReady(reel.id);
        } else if (embedInfo.type === "instagram" && isActive) {
          markReady(reel.id);
        }
      });
    };

    const timeoutId = setTimeout(playActiveOnly, 80);
    return () => clearTimeout(timeoutId);
  }, [activeIndex, baseCount, preferMuted, audioOwnerId, preloadIndices]);

  // Closest-to-center active detection (+ unlock audio on interaction)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || baseCount === 0) return;

    const updateActiveFromCenter = () => {
      const normalized = findClosestCardIndex(el);
      if (normalized !== activeIndexRef.current) {
        activeIndexRef.current = normalized;
        setActiveIndex(normalized);
      }
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateActiveFromCenter);
    };

    const onInteract = () => {
      unlockAudio();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onInteract, { passive: true });
    el.addEventListener("touchstart", onInteract, { passive: true });
    el.addEventListener("wheel", onInteract, { passive: true });
    // Initial measure
    updateActiveFromCenter();

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onInteract);
      el.removeEventListener("touchstart", onInteract);
      el.removeEventListener("wheel", onInteract);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [baseCount]);

  const isMuted = (id) => (mutedById.has(id) ? mutedById.get(id) : true);

  const toggleMute = (reel, isFeatured, embedInfo) => {
    unlockAudio();
    if (isFeatured) {
      if (featuredMuted) {
        setPreferMuted(false);
        claimAudio(FEATURED_KEY);
      } else {
        setPreferMuted(true);
        releaseAudio(FEATURED_KEY);
      }
      return;
    }

    const currentlyMuted = isMuted(reel.id);
    if (currentlyMuted) {
      setPreferMuted(false);
      claimAudio(reel.id);
      if (embedInfo?.type === "youtube" && embedInfo.embedUrl) {
        const iframe = iframeRefs.current.get(reel.id);
        if (iframe) {
          iframe.src = `${embedInfo.embedUrl}?autoplay=1&mute=0&loop=1&playlist=${embedInfo.videoId}&controls=0`;
        }
      }
    } else {
      setPreferMuted(true);
      releaseAudio(reel.id);
      if (embedInfo?.type === "youtube" && embedInfo.embedUrl) {
        const iframe = iframeRefs.current.get(reel.id);
        if (iframe) {
          iframe.src = `${embedInfo.embedUrl}?autoplay=1&mute=1&loop=1&playlist=${embedInfo.videoId}&controls=0`;
        }
      }
    }
  };

  const markViewed = async (id) => {
    if (viewedIds.has(id)) return;
    setViewedIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`${API}/reels/${id}/view`, { method: "POST" });
    } catch {
      // ignore
    }
  };

  // Render function for a single reel card
  const renderReelCard = (reel, i, isFeatured = false) => {
    const isActive = !isFeatured && i === activeIndex;
    // Only featured or the centered carousel reel may play
    const shouldPlay = isFeatured || isActive;
    const shouldDownload = isFeatured || preloadIndices.has(i);
    const product = reel.product || null;
    const productImg =
      (product?.images && Array.isArray(product.images) && product.images[0]) ||
      (typeof product?.images === "string" ? (() => {
        try {
          const arr = JSON.parse(product.images);
          return Array.isArray(arr) ? arr[0] : null;
        } catch {
          return null;
        }
      })() : null) ||
      reel.thumbnail ||
      null;

    const resolvedProductImg = productImg ? resolveAssetUrl(productImg, { width: 480 }) : null;
    const tinyProductImg = productImg ? resolveAssetUrl(productImg, { width: 96 }) : null;

    const { low, high } = getLowestAndHighestPrice(product);
    const discountPct = Number.isFinite(Number(reel.discountPct)) ? Number(reel.discountPct) : null;
    const original = discountPct && low ? Math.round((low * 100) / (100 - discountPct)) : null;
    const videoUrl = (reel.videoUrl || reel.url)?.trim();
    const embedInfo = getVideoEmbedInfo(videoUrl);
    const videoIsReady = videoReady.has(reel.id);
    const videoHasError = videoError.has(reel.id);
    const isMutedState = isFeatured ? featuredMuted : isMuted(reel.id);

    return (
      <div
        key={reel.id}
        data-reel-card={isFeatured ? "featured" : "1"}
        data-reel-index={isFeatured ? undefined : i}
        role={!isFeatured ? "button" : undefined}
        tabIndex={!isFeatured ? 0 : undefined}
        onClick={(e) => {
          if (isFeatured) return;
          // Mute button handles its own clicks
          if (e.target.closest("button")) return;
          selectCarouselIndex(i);
        }}
        onKeyDown={(e) => {
          if (isFeatured) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectCarouselIndex(i);
          }
        }}
        className={[
          "shrink-0 snap-center",
          isFeatured 
            ? "basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[25%] xl:basis-[20%] max-w-[400px] mb-4 lg:mb-0" 
            : "basis-[55%] sm:basis-[32%] md:basis-[28%] lg:basis-[18%] xl:basis-[14%] cursor-pointer",
          "transition-opacity duration-300",
          isFeatured 
            ? "opacity-100" 
            : (isActive 
                ? "opacity-100" 
                : "opacity-75 md:opacity-100"),
        ].join(" ")}
      >
        <div className="relative overflow-hidden rounded-2xl shadow-lg bg-black">
          {/* Instagram Reels: 1080 x 1920 pixels = 9:16 aspect ratio = 177.78% */}
          <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
            {videoUrl ? (
              <>
                {(!videoIsReady || videoHasError) && embedInfo.type !== "instagram" && embedInfo.type !== "youtube" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                    {resolvedProductImg ? (
                      <img
                        src={resolvedProductImg}
                        alt={product?.name || reel.title || "Reel"}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="text-center z-10">
                        <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 mx-auto mb-2 object-contain opacity-50 animate-pulse" />
                        <div className="text-white/70 text-xs font-semibold">Loading reel...</div>
                      </div>
                    )}
                  </div>
                )}

                {embedInfo.type === "instagram" && (
                  <>
                    <div className="absolute inset-0 overflow-hidden bg-black">
                      <iframe
                        src={embedInfo.embedUrl}
                        className="absolute"
                        frameBorder="0"
                        scrolling="no"
                        allow="encrypted-media"
                        loading="lazy"
                        onLoad={() => markReady(reel.id)}
                        onError={() => {
                          console.error(`Reel ${reel.id} Instagram embed error`);
                          markError(reel.id);
                        }}
                        style={{
                          left: 0,
                          width: "105%",
                          height: "190%",
                          border: "none",
                          overflow: "hidden",
                        }}
                      />
                    </div>
                    {!videoReady.has(reel.id) && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-8 h-8 text-black ml-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {embedInfo.type === "youtube" && (
                  <>
                    <iframe
                      ref={(el) => {
                        if (el) {
                          iframeRefs.current.set(reel.id, el);
                        } else {
                          iframeRefs.current.delete(reel.id);
                        }
                      }}
                      src={`${embedInfo.embedUrl}?autoplay=${shouldPlay ? 1 : 0}&mute=${isMutedState ? 1 : 0}&loop=1&playlist=${embedInfo.videoId}&controls=0`}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        markReady(reel.id);
                      }}
                      onError={() => {
                        console.error(`Reel ${reel.id} YouTube embed error`);
                        markError(reel.id);
                      }}
                    />
                    <button
                      onClick={() => toggleMute(reel, isFeatured, embedInfo)}
                      className="absolute top-3 right-12 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all duration-200 active:scale-95"
                      aria-label={isMutedState ? "Unmute" : "Mute"}
                      title={isMutedState ? "Click to unmute" : "Click to mute"}
                    >
                      {isMutedState ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                    </button>
                  </>
                )}

                {embedInfo.type === "direct" && (
                  <>
                    <video
                      ref={(el) => {
                        if (isFeatured) {
                          featuredVideoRef.current = el;
                        } else {
                          if (el) {
                            videoRefs.current.set(reel.id, el);
                            const shouldDownload = preloadIndices.has(i);
                            const optimizedVideoUrl = resolveVideoUrl(embedInfo.url, { width: 480 });
                            if (shouldDownload && el.src !== optimizedVideoUrl) {
                              el.src = optimizedVideoUrl;
                              el.load();
                            } else if (!shouldDownload && el.src) {
                              el.src = "";
                              try { el.load(); } catch {}
                            }
                          } else {
                            videoRefs.current.delete(reel.id);
                          }
                        }
                      }}
                      className={[
                        "absolute inset-0 w-full h-full object-cover",
                        videoIsReady && !videoHasError ? "opacity-100" : "opacity-0",
                        "transition-opacity duration-500",
                      ].join(" ")}
                      src={shouldDownload && embedInfo.type === "direct" && embedInfo.url ? resolveVideoUrl(embedInfo.url, { width: 480 }) : undefined}
                      poster={resolvedProductImg || undefined}
                      playsInline
                      loop
                      muted={isMutedState}
                      autoPlay={shouldPlay}
                      preload={shouldPlay ? "auto" : "metadata"}
                      onLoadedData={(e) => {
                        const video = e.target;
                        markReady(reel.id);
                        if (shouldPlay) {
                          requestAnimationFrame(() => {
                            video.play().catch((err) => {
                              console.warn(`Reel ${reel.id} autoplay blocked:`, err);
                            });
                          });
                        } else {
                          try {
                            video.pause();
                          } catch {
                            // ignore
                          }
                        }
                      }}
                      onCanPlay={(e) => {
                        const video = e.target;
                        video.muted = isMutedState;
                        markReady(reel.id);
                        if (shouldPlay) {
                          requestAnimationFrame(() => {
                            video.play().catch((err) => {
                              console.warn(`Reel ${reel.id} play failed:`, err);
                            });
                          });
                        } else {
                          try {
                            video.pause();
                          } catch {
                            // ignore
                          }
                        }
                      }}
                      onLoadedMetadata={(e) => {
                        const video = e.target;
                        markReady(reel.id);
                        if (shouldPlay && video.readyState >= 2) {
                          requestAnimationFrame(() => {
                            video.play().catch((err) => {
                              console.warn(`Reel ${reel.id} metadata play failed:`, err);
                            });
                          });
                        }
                      }}
                      onPlaying={() => {
                        markReady(reel.id);
                      }}
                      onError={(e) => {
                        const video = e.target;
                        console.error(`Video error for reel ${reel.id}:`, {
                          url: embedInfo.url,
                          error: video.error,
                          code: video.error?.code,
                          message: video.error?.message,
                        });
                        markError(reel.id);
                      }}
                      onPlay={() => markViewed(reel.id)}
                    />
                    <button
                      onClick={() => toggleMute(reel, isFeatured, embedInfo)}
                      className="absolute top-3 right-2 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all duration-200 active:scale-95"
                      aria-label={isMutedState ? "Unmute" : "Mute"}
                      title={isMutedState ? "Click to unmute" : "Click to mute"}
                    >
                      {isMutedState ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                <div className="text-center px-6 z-10">
                  <img src="/logo.png" alt="Gift Choice Logo" className="w-16 h-16 mx-auto mb-3 object-contain opacity-50" />
                  <div className="text-white font-semibold">Reel video missing</div>
                  <div className="text-white/70 text-sm mt-1">Add a reel video URL in Admin</div>
                </div>
              </div>
            )}

            {/* Top overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isFeatured && (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-pink-500 text-white shadow">
                  Featured
                </span>
              )}
              {reel.isTrending && (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-white/90 text-gray-900 shadow">
                  Trending
                </span>
              )}
              {discountPct ? (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-pink-500 text-white shadow">
                  {discountPct}% OFF
                </span>
              ) : null}
            </div>

            {/* Bottom overlays */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
              <div className="flex items-end gap-3">
                {tinyProductImg && (
                  <img
                    src={tinyProductImg}
                    alt={product?.name || reel.title || "Product"}
                    className="w-12 h-12 rounded-xl object-cover shadow bg-white"
                    loading="lazy"
                    decoding="async"
                    width={48}
                    height={48}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold text-sm line-clamp-1">
                    {product?.name || reel.title || "Reel"}
                  </div>
                  {(low || original) && (
                    <div className="flex items-baseline gap-2">
                      {low ? (
                        <div className="text-white font-bold text-base">{formatINR(low)}</div>
                      ) : null}
                      {original ? (
                        <div className="text-white/70 text-sm line-through">{formatINR(original)}</div>
                      ) : null}
                      {high && low && high !== low ? (
                        <div className="text-white/70 text-xs">onwards</div>
                      ) : null}
                    </div>
                  )}
                  {(embedInfo.type === "direct" || embedInfo.type === "youtube") && (
                    <div className="text-white/70 text-[11px] mt-1">
                      Tap to {isMutedState ? "unmute" : "mute"}
                    </div>
                  )}
                  {embedInfo.type === "instagram" && (
                    <div className="text-white/70 text-[11px] mt-1">
                      Tap to play
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (baseCount === 0 && !featuredReel) return null;

  return (
    <div className="w-full">
      {/* Featured Reel - Center */}
      {featuredReel && (
        <div className="flex justify-center mb-6">
          {renderReelCard(featuredReel, -1, true)}
        </div>
      )}

      {/* Regular Reels Feed */}
      {baseCount > 0 && (
        <div
          ref={scrollerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scroll-smooth"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {base.map((reel, i) => renderReelCard(reel, i, false))}
        </div>
      )}
    </div>
  );
}

export const MemoReelCarousel = memo(ReelCarousel);

