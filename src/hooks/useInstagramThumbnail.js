import { useState, useEffect } from "react";

/**
 * Hook to manage Instagram thumbnail (disabled/fallback mode)
 * @param {string} url - Instagram post/reel URL
 * @returns {object} - { thumbnail, loading, error }
 */
export function useInstagramThumbnail(url) {
  const [thumbnail] = useState(null);
  const [loading] = useState(false);
  const [error] = useState(true);

  return { thumbnail, loading, error };
}

