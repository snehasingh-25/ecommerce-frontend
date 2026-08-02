import { ProductReviewsContext, useProductReviews } from "../../hooks/useProductReviews";

export function ProductReviewsProvider({ productId, children }) {
  const value = useProductReviews(productId);
  return (
    <ProductReviewsContext.Provider value={value}>{children}</ProductReviewsContext.Provider>
  );
}
