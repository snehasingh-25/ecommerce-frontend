/**
 * Returns a new array with elements in random order (Fisher-Yates shuffle).
 * Does not mutate the input. O(n), safe for use after fetch.
 * Use for product listings to show different order on each page refresh.
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) return [...(arr || [])];
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Like shuffleArray but persists the shuffled order in sessionStorage under
 * `cacheKey` so that navigating back to the same listing restores the same
 * order rather than re-shuffling.  The cache is invalidated when the array
 * length changes (e.g. a product was added/removed).  sessionStorage is
 * cleared automatically when the browser tab is closed.
 */
export function shuffleWithCache(arr, cacheKey) {
  if (!arr || arr.length === 0) return [];
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === arr.length) return parsed;
    }
  } catch (_) {}
  const shuffled = shuffleArray(arr);
  try { sessionStorage.setItem(cacheKey, JSON.stringify(shuffled)); } catch (_) {}
  return shuffled;
}
