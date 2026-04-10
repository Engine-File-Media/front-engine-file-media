type PurchaseSummaryProps = {
  variant?: 'order' | 'sidebar' | 'both';
  volumeTitle: string;
  isPricingLoading: boolean;
  displayCurrency: string;
  unitEffectivePrice: number;
  unitBasePrice: number;
  saleActive: boolean;
  discountPercent: number;
  quantity: number;
  quantityError?: string;
  maxQuantity: number;
  summaryProduct: number;
  summaryShipping: number;
  summaryFulfillment: number;
  summaryHandling: number;
  summaryTax: number;
  summaryDiscount: number;
  summaryTotal: number;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onQuantityInput: (value: string) => void;
};

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);

function PurchaseSummary({
  variant = 'both',
  volumeTitle,
  isPricingLoading,
  displayCurrency,
  unitEffectivePrice,
  unitBasePrice,
  saleActive,
  discountPercent,
  quantity,
  quantityError,
  maxQuantity,
  summaryProduct,
  summaryShipping,
  summaryFulfillment,
  summaryHandling,
  summaryTax,
  summaryDiscount,
  summaryTotal,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onQuantityInput,
}: PurchaseSummaryProps) {
  const shouldRenderOrder = variant === 'order' || variant === 'both';
  const shouldRenderSidebar = variant === 'sidebar' || variant === 'both';

  return (
    <>
      {shouldRenderOrder && (
      <section className="border border-black/10 p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
          <h2
            className="text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
            style={{ fontFamily: 'Crimson Text, serif' }}
          >
            Order
          </h2>
          <p
            className="text-[13px] tracking-[1.4px] text-[#0A0A0A]/60 uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isPricingLoading ? 'Loading price...' : `${displayCurrency} ${unitEffectivePrice.toFixed(2)} each`}
          </p>
        </div>

        {saleActive && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#0A0A0A]/50 line-through" style={{ fontFamily: 'Inter, sans-serif' }}>
              {formatMoney(unitBasePrice, displayCurrency)}
            </span>
            <span className="text-[14px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {formatMoney(unitEffectivePrice, displayCurrency)}
            </span>
            <span className="rounded bg-[#F4E7E7] px-2 py-1 text-[11px] font-semibold tracking-[1px] text-[#7A1E1E] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
              {discountPercent}% OFF
            </span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2" htmlFor="volumeQty">
            <span
              className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Quantity
            </span>
            <div className="flex h-11 items-center overflow-hidden border border-black/20 bg-white">
              <button
                type="button"
                onClick={onDecreaseQuantity}
                className="h-full w-11 border-r border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input
                id="volumeQty"
                name="volumeQty"
                type="number"
                min={1}
                max={maxQuantity}
                inputMode="numeric"
                className="h-full w-full bg-white px-3 text-center text-[14px] text-[#0A0A0A] outline-none"
                value={quantity}
                onChange={(event) => onQuantityInput(event.target.value)}
              />
              <button
                type="button"
                onClick={onIncreaseQuantity}
                className="h-full w-11 border-l border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
              Max {maxQuantity} volumes per order.
            </span>
            {quantityError && (
              <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {quantityError}
              </span>
            )}
          </label>

          <div className="flex flex-col justify-end border border-black/10 bg-[#FAFAFA] px-4 py-3">
            <span
              className="text-[11px] tracking-[1.2px] text-[#0A0A0A]/60 uppercase"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Estimated total
            </span>
            <strong
              className="mt-1 text-[26px] leading-none text-[#0A0A0A]"
              style={{ fontFamily: 'Crimson Text, serif' }}
            >
              {formatMoney(summaryTotal, displayCurrency)}
            </strong>
          </div>
        </div>
      </section>
      )}

      {shouldRenderSidebar && (
      <section className="border border-black/10 p-5 md:p-6">
        <h3 className="text-[26px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
          Order Summary
        </h3>

        <div className="mt-5 space-y-3 border-b border-black/10 pb-4 text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#0A0A0A]/70">{volumeTitle} x{quantity}</span>
            <span className="text-[#0A0A0A]">{formatMoney(summaryProduct, displayCurrency)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#0A0A0A]/70">Shipping</span>
            <span className="text-[#0A0A0A]">{formatMoney(summaryShipping, displayCurrency)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#0A0A0A]/70">Fulfillment</span>
            <span className="text-[#0A0A0A]">{formatMoney(summaryFulfillment, displayCurrency)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#0A0A0A]/70">Handling</span>
            <span className="text-[#0A0A0A]">{formatMoney(summaryHandling, displayCurrency)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#0A0A0A]/70">Tax</span>
            <span className="text-[#0A0A0A]">{formatMoney(summaryTax, displayCurrency)}</span>
          </div>
          {saleActive && summaryDiscount > 0 && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#0A0A0A]/70">Discount</span>
              <span className="text-[#7A1E1E]">-{formatMoney(summaryDiscount, displayCurrency)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <span className="text-[13px] tracking-[1.3px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            Total
          </span>
          <strong className="text-[30px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
            {formatMoney(summaryTotal, displayCurrency)}
          </strong>
        </div>
      </section>
      )}
    </>
  );
}

export default PurchaseSummary;
