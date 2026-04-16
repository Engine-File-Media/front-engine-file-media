import type { ReactNode } from 'react';
import type { ShippingOption } from '../../../api/types';
import PurchaseShippingQuoteSection from '../PurchaseShippingQuoteSection';
import PurchaseStepContinueButton from './PurchaseStepContinueButton';
import type { FieldErrors, FormState } from '../purchaseTypes';

type PurchaseShippingStepProps = {
  form: FormState;
  shippingOptions: ShippingOption[];
  isSessionBootstrapping: boolean;
  isShippingOptionsLoading: boolean;
  isPricingLoading: boolean;
  isQuoteLoading: boolean;
  isCheckoutLoading: boolean;
  shippingInputClasses: string;
  errors: FieldErrors;
  captchaToken: string;
  captchaError: string;
  isCaptchaRequired: boolean;
  captchaNode: ReactNode;
  onUpdateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onRequestQuote: () => Promise<unknown>;
  canContinueCurrentStep: boolean;
  continueButtonLabel: string;
  onContinue: () => void;
};

function PurchaseShippingStep({
  form,
  shippingOptions,
  isSessionBootstrapping,
  isShippingOptionsLoading,
  isPricingLoading,
  isQuoteLoading,
  isCheckoutLoading,
  shippingInputClasses,
  errors,
  captchaToken,
  captchaError,
  isCaptchaRequired,
  captchaNode,
  onUpdateField,
  onRequestQuote,
  canContinueCurrentStep,
  continueButtonLabel,
  onContinue,
}: PurchaseShippingStepProps) {
  return (
    <>
      <PurchaseShippingQuoteSection
        form={form}
        shippingOptions={shippingOptions}
        isSessionBootstrapping={isSessionBootstrapping}
        isShippingOptionsLoading={isShippingOptionsLoading}
        isPricingLoading={isPricingLoading}
        isQuoteLoading={isQuoteLoading}
        isCheckoutLoading={isCheckoutLoading}
        shippingInputClasses={shippingInputClasses}
        errors={errors}
        captchaToken={captchaToken}
        captchaError={captchaError}
        isCaptchaRequired={isCaptchaRequired}
        captchaNode={captchaNode}
        onUpdateField={onUpdateField}
        onRequestQuote={onRequestQuote}
      />
      <PurchaseStepContinueButton label={continueButtonLabel} disabled={!canContinueCurrentStep} onContinue={onContinue} />
    </>
  );
}

export default PurchaseShippingStep;