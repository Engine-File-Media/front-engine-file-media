import type { ReactNode } from 'react';
import PurchasePaymentAction from '../PurchasePaymentAction';
import type { CheckoutFundingPriority, CheckoutResponse, CheckoutFundingSource, QuoteResponse } from '../../../api/types';

type PurchaseCheckoutStepProps = {
  quote: QuoteResponse | null;
  quoteFingerprint: string;
  lastQuotedFingerprint: string | null;
  isSessionBootstrapping: boolean;
  isPricingLoading: boolean;
  isCheckoutLoading: boolean;
  isQuoteLoading: boolean;
  captchaToken: string;
  captchaError: string;
  isCaptchaRequired: boolean;
  captchaNode: ReactNode;
  paypalClientId: string;
  fundingPriority: CheckoutFundingPriority;
  createCheckoutOrder: (fundingSource?: CheckoutFundingSource) => Promise<CheckoutResponse | null>;
};

function PurchaseCheckoutStep({
  quote,
  quoteFingerprint,
  lastQuotedFingerprint,
  isSessionBootstrapping,
  isPricingLoading,
  isCheckoutLoading,
  isQuoteLoading,
  captchaToken,
  captchaError,
  isCaptchaRequired,
  captchaNode,
  paypalClientId,
  fundingPriority,
  createCheckoutOrder,
}: PurchaseCheckoutStepProps) {
  return (
    <PurchasePaymentAction
      quote={quote}
      quoteFingerprint={quoteFingerprint}
      lastQuotedFingerprint={lastQuotedFingerprint}
      isSessionBootstrapping={isSessionBootstrapping}
      isPricingLoading={isPricingLoading}
      isCheckoutLoading={isCheckoutLoading}
      isQuoteLoading={isQuoteLoading}
      captchaToken={captchaToken}
      captchaError={captchaError}
      isCaptchaRequired={isCaptchaRequired}
      captchaNode={captchaNode}
      paypalClientId={paypalClientId}
      fundingPriority={fundingPriority}
      createCheckoutOrder={createCheckoutOrder}
    />
  );
}

export default PurchaseCheckoutStep;