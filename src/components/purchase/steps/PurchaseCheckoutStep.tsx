import type { ReactNode } from 'react';
import PurchasePaymentAction from '../PurchasePaymentAction';
import type { QuoteResponse } from '../../../api/types';

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
    />
  );
}

export default PurchaseCheckoutStep;