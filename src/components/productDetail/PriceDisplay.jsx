export function getPriceInfo(selectedSize, product) {
  if (selectedSize) {
    const price = Number(selectedSize.price);
    const mrp = selectedSize.originalPrice ?? (product?.hasSinglePrice ? product?.originalPrice : null);
    const mrpNum = mrp != null ? Number(mrp) : null;
    const hasDiscount = mrpNum != null && mrpNum > price;
    const discountPercent = hasDiscount ? Math.round(((mrpNum - price) / mrpNum) * 100) : 0;
    const savings = hasDiscount ? mrpNum - price : 0;
    return { price, mrp: mrpNum, hasDiscount, discountPercent, savings };
  }

  if (product?.hasSinglePrice && product?.singlePrice != null) {
    const price = Number(product.singlePrice);
    const mrpNum = product.originalPrice != null ? Number(product.originalPrice) : null;
    const hasDiscount = mrpNum != null && mrpNum > price;
    const discountPercent = hasDiscount ? Math.round(((mrpNum - price) / mrpNum) * 100) : 0;
    const savings = hasDiscount ? mrpNum - price : 0;
    return { price, mrp: mrpNum, hasDiscount, discountPercent, savings };
  }

  return null;
}

export default function PriceDisplay({ selectedSize, product }) {
  const info = getPriceInfo(selectedSize, product);

  if (!info) {
    if (product?.sizes?.length) {
      return (
        <div className="text-sm font-medium" style={{ color: "oklch(55% .02 340)" }}>
          Select a size to see price
        </div>
      );
    }
    return null;
  }

  const { price, mrp, hasDiscount, discountPercent, savings } = info;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "oklch(20% .02 340)" }}>
          ₹{price.toLocaleString("en-IN")}
        </span>
        {hasDiscount && (
          <>
            <span className="text-base sm:text-lg line-through font-medium" style={{ color: "oklch(60% .02 340)" }}>
              ₹{mrp.toLocaleString("en-IN")}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-600 text-white">
              {discountPercent}% OFF
            </span>
          </>
        )}
      </div>
      {hasDiscount && (
        <p className="text-sm font-semibold text-green-700">
          You save ₹{Math.round(savings).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}
