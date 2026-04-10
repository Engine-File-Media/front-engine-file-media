import PurchaseQuantitySelector from './PurchaseQuantitySelector';

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
  const estimatedBaseTotal = unitBasePrice * quantity;

  return (
    <>
      {shouldRenderOrder && (
      <section className="border border-black/10 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
          <h2
            className="text-[25px] leading-[1.05] text-[#0A0A0A] md:text-[28px]"
            style={{ fontFamily: 'Crimson Text, serif' }}
          >
            Order
          </h2>
          <p
            className="text-[12px] tracking-[1.3px] text-[#0A0A0A]/60 uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isPricingLoading ? 'Loading price...' : `${displayCurrency} ${unitEffectivePrice.toFixed(2)} each`}
          </p>
        </div>

        {saleActive && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
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

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="rounded border border-black/10 bg-[#FBFBFA] px-3 py-3 md:px-4">
            <PurchaseQuantitySelector
              quantity={quantity}
              quantityError={quantityError}
              maxQuantity={maxQuantity}
              onDecreaseQuantity={onDecreaseQuantity}
              onIncreaseQuantity={onIncreaseQuantity}
              onQuantityInput={onQuantityInput}
            />
          </div>

          <div className="flex flex-col justify-between rounded border border-black/10 bg-[#FAFAFA] px-3 py-3 md:px-4">
            <span
              className="text-[11px] tracking-[1.2px] text-[#0A0A0A]/60 uppercase"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Estimated total
            </span>
            <strong
              className="mt-1 text-[24px] leading-none text-[#0A0A0A] md:text-[26px]"
              style={{ fontFamily: 'Crimson Text, serif' }}
            >
              {formatMoney(estimatedBaseTotal, displayCurrency)}
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
