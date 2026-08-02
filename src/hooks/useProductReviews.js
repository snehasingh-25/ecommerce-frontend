import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API } from "../api";

export const ProductReviewsContext = createContext(null);

/** Module cache for card/list summaries (read-only, same public endpoint). */
const summaryCache = new Map();

export async function fetchReviewSummary(productId) {
  const id = Number(productId);
  if (!Number.isFinite(id)) return { reviews: [], averageRating: null, totalCount: 0 };
  if (summaryCache.has(id)) return summaryCache.get(id);

  const res = await fetch(`${API}/reviews/product/${id}`);
  if (!res.ok) throw new Error("Failed to load reviews");
  const data = await res.json();
  const payload = {
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    averageRating: data.averageRating ?? null,
    totalCount: data.totalCount ?? 0,
  };
  summaryCache.set(id, payload);
  return payload;
}

export function invalidateReviewSummary(productId) {
  const id = Number(productId);
  if (Number.isFinite(id)) summaryCache.delete(id);
}

export function useProductReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      invalidateReviewSummary(productId);
      const data = await fetchReviewSummary(productId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalCount(data.totalCount);
    } catch {
      setReviews([]);
      setAverageRating(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    productId,
    reviews,
    averageRating,
    totalCount,
    loading,
    showForm,
    setShowForm,
    submitting,
    setSubmitting,
    reload: loadReviews,
  };
}

export function useProductReviewsContext() {
  return useContext(ProductReviewsContext);
}

/** Lightweight fetch for product cards — uses shared cache. */
export function useReviewSummary(productId, enabled = true) {
  const [averageRating, setAverageRating] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(enabled && productId));

  useEffect(() => {
    if (!enabled || !productId) {
      setLoading(false);
      setAverageRating(null);
      setTotalCount(0);
      return undefined;
    }

    let cancelled = false;
    const id = Number(productId);

    const load = async () => {
      const cached = Number.isFinite(id) ? summaryCache.get(id) : null;
      if (cached) {
        setAverageRating(cached.averageRating);
        setTotalCount(cached.totalCount);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchReviewSummary(productId);
        if (cancelled) return;
        setAverageRating(data.averageRating);
        setTotalCount(data.totalCount);
      } catch {
        if (!cancelled) {
          setAverageRating(null);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [productId, enabled]);

  return { averageRating, totalCount, loading };
}
