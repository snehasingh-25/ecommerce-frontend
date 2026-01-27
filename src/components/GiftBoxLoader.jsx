import { useEffect, useState } from "react";

/**
 * GiftBoxLoader - Animated loading screen that only shows if loading takes >= 0.1 seconds
 * 
 * @param {boolean} isLoading - Whether data is currently loading
 * @param {boolean} showLoader - Whether to show the loader (controlled by time-based logic)
 * @param {function} onComplete - Callback when animation completes
 */
export default function GiftBoxLoader({ isLoading, showLoader, onComplete }) {
  const [animationPhase, setAnimationPhase] = useState("loading"); // loading, bursting, fading
  // Show immediately if loading or if showLoader is true
  const [shouldRender, setShouldRender] = useState(isLoading || showLoader);

  useEffect(() => {
    // Always show when loading
    if (isLoading) {
      setShouldRender(true);
      setAnimationPhase("loading");
      return;
    }

    // When loading completes and showLoader is true, trigger burst animation
    if (!isLoading && showLoader) {
      setAnimationPhase("bursting");
      
      // After burst animation, fade out
      const fadeTimer = setTimeout(() => {
        setAnimationPhase("fading");
        
        // Remove from DOM after fade completes
        const removeTimer = setTimeout(() => {
          setShouldRender(false);
          if (onComplete) onComplete();
        }, 500); // Match fade-out duration
        
        return () => clearTimeout(removeTimer);
      }, 600); // Burst animation duration
      
      return () => clearTimeout(fadeTimer);
    }

    // If not loading and showLoader is false, hide immediately
    if (!isLoading && !showLoader) {
      setShouldRender(false);
    }
  }, [isLoading, showLoader, onComplete]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        animationPhase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      style={{ 
        pointerEvents: animationPhase === "fading" ? "none" : "auto",
        zIndex: 9999
      }}
    >
      <div className="relative">
        {/* Gift Box */}
        <div 
          className={`relative transition-all duration-300 ${
            animationPhase === "bursting" 
              ? "scale-150 opacity-0 rotate-12" 
              : animationPhase === "loading"
              ? "animate-gift-shake"
              : ""
          }`}
          style={{
            transformOrigin: "center center"
          }}
        >
          {/* Main Gift Box */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            {/* Box Base */}
            <div 
              className="absolute bottom-0 w-full h-3/4 rounded-lg shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #43e97b 100%)",
                backgroundSize: "400% 400%",
                animation: animationPhase === "loading" ? "gradient-shift 3s ease infinite" : "none"
              }}
            >
              {/* Box Lid */}
              <div 
                className="absolute -top-4 left-0 w-full h-1/4 rounded-t-lg"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  transform: animationPhase === "bursting" ? "translateY(-20px) rotate(-5deg)" : "translateY(0) rotate(0deg)",
                  transition: "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
                }}
              >
                {/* Ribbon Bow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                  />
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white"
                    style={{
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)"
                    }}
                  />
                </div>
              </div>

              {/* Sparkles/Glow Effect (only during loading) */}
              {animationPhase === "loading" && (
                <>
                  {/* Sparkle 1 */}
                  <div 
                    className="absolute top-2 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
                    style={{
                      animationDelay: "0s",
                      boxShadow: "0 0 8px rgba(255, 255, 0, 0.8)"
                    }}
                  />
                  {/* Sparkle 2 */}
                  <div 
                    className="absolute top-6 right-6 w-2 h-2 bg-pink-300 rounded-full animate-sparkle"
                    style={{
                      animationDelay: "0.5s",
                      boxShadow: "0 0 8px rgba(255, 192, 203, 0.8)"
                    }}
                  />
                  {/* Sparkle 3 */}
                  <div 
                    className="absolute bottom-8 left-8 w-2 h-2 bg-blue-300 rounded-full animate-sparkle"
                    style={{
                      animationDelay: "1s",
                      boxShadow: "0 0 8px rgba(173, 216, 230, 0.8)"
                    }}
                  />
                  {/* Sparkle 4 */}
                  <div 
                    className="absolute bottom-4 right-4 w-2 h-2 bg-purple-300 rounded-full animate-sparkle"
                    style={{
                      animationDelay: "1.5s",
                      boxShadow: "0 0 8px rgba(221, 160, 221, 0.8)"
                    }}
                  />
                  
                  {/* Glow Ring */}
                  <div 
                    className="absolute inset-0 rounded-lg animate-pulse"
                    style={{
                      background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                      animation: "glow-pulse 2s ease-in-out infinite"
                    }}
                  />
                </>
              )}

              {/* Burst Effect (when opening) */}
              {animationPhase === "bursting" && (
                <>
                  {/* Light Rays */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-transparent via-yellow-300 to-transparent opacity-80"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-40px)`,
                        animation: "ray-burst 0.6s ease-out forwards",
                        transformOrigin: "center bottom"
                      }}
                    />
                  ))}
                  
                  {/* Gift Icon Emerging */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm animate-gift-emerge"
                    style={{
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                    }}
                  >
                    Gift Choice
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading Text (only during loading phase) */}
        {animationPhase === "loading" && (
          <p 
            className="mt-8 text-center text-lg font-semibold animate-fade-in"
            style={{ color: "oklch(40% .02 340)" }}
          >
            Preparing your gifts...
          </p>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gift-shake {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          10% { transform: translateY(-5px) rotate(-2deg); }
          20% { transform: translateY(0) rotate(2deg); }
          30% { transform: translateY(-3px) rotate(-1deg); }
          40% { transform: translateY(0) rotate(1deg); }
          50% { transform: translateY(-4px) rotate(-1.5deg); }
          60% { transform: translateY(0) rotate(1.5deg); }
          70% { transform: translateY(-3px) rotate(-1deg); }
          80% { transform: translateY(0) rotate(1deg); }
          90% { transform: translateY(-2px) rotate(-0.5deg); }
        }

        @keyframes sparkle {
          0%, 100% { 
            opacity: 0;
            transform: scale(0.5);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes ray-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-20px) scale(0.5);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-60px) scale(1.5);
          }
        }

        @keyframes gift-emerge {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(-180deg);
          }
          60% {
            transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-gift-shake {
          animation: gift-shake 0.8s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in;
        }
      `}</style>
    </div>
  );
}
