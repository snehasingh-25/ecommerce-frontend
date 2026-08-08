import { API } from "../api";

const WHATSAPP_NUMBER = "917976948872";
const PUBLIC_API_FALLBACK = "https://midnightblue-fish-476058.hostingersite.com";

const STOREFRONT_ORIGIN =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "https://www.giftchoice.net";

function apiOrigin() {
  const fromEnv = (API || "").replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes("localhost")) return fromEnv;
  // Dev: prefer Vite proxy same-origin /og when available
  if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
    return window.location.origin;
  }
  return fromEnv || PUBLIC_API_FALLBACK;
}

/** Human storefront product page URL. */
export function productPageUrl(productId) {
  return `${STOREFRONT_ORIGIN}/product/${productId}`;
}

/** Product URL for WhatsApp / sharing. */
export function productShareUrl(productId) {
  return productPageUrl(productId);
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  // Prefer navigating the current tab — window.open is often blocked on mobile.
  try {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(url);
    }
  } catch {
    window.location.assign(url);
  }
}
