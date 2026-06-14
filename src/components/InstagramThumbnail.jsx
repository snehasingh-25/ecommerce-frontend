import { useState } from "react";
import { useInstagramThumbnail } from "../hooks/useInstagramThumbnail";

/**
 * Instagram thumbnail component with play icon overlay
 * Displays thumbnail for Instagram posts/reels in the media preview strip
 */
export default function InstagramThumbnail({ url, onClick, className = "" }) {
  const { thumbnail, loading, error } = useInstagramThumbnail(url);
  const [imageError, setImageError] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const showFallback = loading || error || !thumbnail || imageError;

  return (
    <div 
      className={`relative w-full h-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {showFallback ? (
        <div className="absolute inset-0 bg-[#FF0000] flex items-center justify-center">
          {loading ? (
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )}
        </div>
      ) : (
        <>
          <img
            src={thumbnail}
            alt="Instagram post"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors pointer-events-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

