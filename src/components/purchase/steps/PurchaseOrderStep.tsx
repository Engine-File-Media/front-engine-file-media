import PurchaseSummary from '../PurchaseSummary';
import PurchaseStepContinueButton from './PurchaseStepContinueButton';

type PurchaseOrderStepProps = {
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
  canContinueCurrentStep: boolean;
  continueButtonLabel: string;
  onContinue: () => void;
};

function PurchaseOrderStep({
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
  canContinueCurrentStep,
  continueButtonLabel,
  onContinue,
}: PurchaseOrderStepProps) {
  return (
    <>
      <PurchaseSummary
        variant="order"
        volumeTitle={volumeTitle}
        isPricingLoading={isPricingLoading}
        displayCurrency={displayCurrency}
        unitEffectivePrice={unitEffectivePrice}
        unitBasePrice={unitBasePrice}
        saleActive={saleActive}
        discountPercent={discountPercent}
        quantity={quantity}
        quantityError={quantityError}
        maxQuantity={maxQuantity}
        summaryProduct={summaryProduct}
        summaryShipping={summaryShipping}
        summaryFulfillment={summaryFulfillment}
        summaryHandling={summaryHandling}
        summaryTax={summaryTax}
        summaryDiscount={summaryDiscount}
        summaryTotal={summaryTotal}
        onDecreaseQuantity={onDecreaseQuantity}
        onIncreaseQuantity={onIncreaseQuantity}
        onQuantityInput={onQuantityInput}
      />
      <PurchaseStepContinueButton label={continueButtonLabel} disabled={!canContinueCurrentStep} onContinue={onContinue} />
    </>
  );
}

export default PurchaseOrderStep;