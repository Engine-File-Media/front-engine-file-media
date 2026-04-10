type PurchaseQuantitySelectorProps = {
  quantity: number;
  quantityError?: string;
  maxQuantity: number;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onQuantityInput: (value: string) => void;
};

function PurchaseQuantitySelector({
  quantity,
  quantityError,
  maxQuantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onQuantityInput,
}: PurchaseQuantitySelectorProps) {
  return (
    <label className="flex flex-col gap-2" htmlFor="volumeQty">
      <span
        className="text-[12px] font-semibold tracking-[1.1px] text-[#0A0A0A]/70 uppercase"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Quantity
      </span>
      <div className="flex h-10 overflow-hidden border border-black/20 bg-white md:h-11">
        <button
          type="button"
          onClick={onDecreaseQuantity}
          className="h-full w-10 shrink-0 border-r border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5 md:w-11"
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
          className="h-full w-full min-w-0 bg-white px-2 text-center text-[14px] text-[#0A0A0A] outline-none md:px-3"
          value={quantity}
          onChange={(event) => onQuantityInput(event.target.value)}
        />
        <button
          type="button"
          onClick={onIncreaseQuantity}
          className="h-full w-10 shrink-0 border-l border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5 md:w-11"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="min-h-4">
        {quantityError ? (
          <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {quantityError}
          </span>
        ) : (
          <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
            Max {maxQuantity} volumes per order.
          </span>
        )}
      </div>
    </label>
  );
}

export default PurchaseQuantitySelector;