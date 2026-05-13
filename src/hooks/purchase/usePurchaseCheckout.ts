import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { createCheckout } from '../../api/payments';
import type {
  ApiError,
  CheckoutFundingSource,
  CheckoutResponse,
  QuoteResponse,
} from '../../api/types';
import { normalizeCheckoutFundingSource } from '../../api/types';
import { hashPayload, readApiCode } from '../../utils/purchaseFlow';
import { markPurchaseResultPending, resolveIdempotencyKey, savePurchaseState } from '../../utils/storage';

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

type UsePurchaseCheckoutArgs = {
  quote: QuoteResponse | null;
  quoteFingerprint: string;
  lastQuotedFingerprint: string | null;
  purchaseSessionId: string;
  isSessionBootstrapping: boolean;
  bootstrapPurchaseSession: (force?: boolean) => Promise<string | null>;
  isCaptchaRequired: boolean;
  checkoutCaptchaToken: string;
  normalizedPhoneE164: string;
  contactEmail: string;
  clearPurchaseSessionContext: () => void;
  setCurrentStepIndex: Dispatch<SetStateAction<number>>;
  setCompletedUntilIndex: Dispatch<SetStateAction<number>>;
  setCheckoutCaptchaError: (value: string) => void;
  onInternalError: (message: string) => void;
  onCheckoutCaptchaFailure: (parsedError: ApiError) => void;
  onCheckoutCreated?: (checkout: CheckoutResponse) => void;
  resetCheckoutCaptcha: () => void;
};

type UsePurchaseCheckoutResult = {
  submitCheckout: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  createCheckoutOrder: (fundingSource?: CheckoutFundingSource) => Promise<CheckoutResponse | null>;
  isCheckoutLoading: boolean;
};

export const usePurchaseCheckout = ({
  quote,
  quoteFingerprint,
  lastQuotedFingerprint,
  purchaseSessionId,
  isSessionBootstrapping,
  bootstrapPurchaseSession,
  isCaptchaRequired,
  checkoutCaptchaToken,
  normalizedPhoneE164,
  contactEmail,
  clearPurchaseSessionContext,
  setCurrentStepIndex,
  setCompletedUntilIndex,
  setCheckoutCaptchaError,
  onInternalError,
  onCheckoutCaptchaFailure,
  onCheckoutCreated,
  resetCheckoutCaptcha,
}: UsePurchaseCheckoutArgs): UsePurchaseCheckoutResult => {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const executeCheckout = useCallback(
    async (
      requestedFundingSource: CheckoutFundingSource = 'card',
      redirectToApproveUrl: boolean,
      allowCardFallback: boolean,
    ): Promise<CheckoutResponse | null> => {
      if (isSessionBootstrapping) {
        onInternalError('Preparing secure purchase session.');
        return null;
      }

      if (!purchaseSessionId) {
        onInternalError('Secure purchase session is missing.');
        return null;
      }

      if (!turnstileSiteKey) {
        onInternalError('Captcha configuration is missing. Set VITE_TURNSTILE_SITE_KEY to continue.');
        return null;
      }

      if (isCaptchaRequired && !checkoutCaptchaToken) {
        const message = 'Complete captcha before continuing to PayPal.';
        setCheckoutCaptchaError(message);
        onInternalError(message);
        return null;
      }

      const activeQuote = quote;
      if (!activeQuote || lastQuotedFingerprint !== quoteFingerprint) {
        onInternalError('Quote is outdated at checkout submit.');
        setCurrentStepIndex(3);
        setCompletedUntilIndex((prev) => Math.min(prev, 2));
        return null;
      }

      const normalizedFundingSource = normalizeCheckoutFundingSource(requestedFundingSource);
      const activeCaptchaToken = checkoutCaptchaToken;

      if (isCaptchaRequired) {
        setCheckoutCaptchaError('');
      }

      const checkoutPayload = {
        quoteId: activeQuote.quoteId,
        fundingSource: normalizedFundingSource,
      };
      const checkoutPayloadHash = hashPayload({
        sessionId: purchaseSessionId,
        payload: checkoutPayload,
      });
      const idempotencyKey = resolveIdempotencyKey('checkout', checkoutPayloadHash, purchaseSessionId);

      try {
        const checkout = await createCheckout(activeQuote.quoteId, {
          purchaseSessionId,
          idempotencyKey,
          captchaToken: activeCaptchaToken,
        }, normalizedFundingSource);

        savePurchaseState({
          quoteId: activeQuote.quoteId,
          orderId: checkout.orderId,
          paypalOrderId: checkout.paypalOrderId,
          phoneE164: normalizedPhoneE164,
          contactEmail,
        });
        markPurchaseResultPending();
        onCheckoutCreated?.(checkout);

        if (redirectToApproveUrl) {
          window.location.assign(checkout.approveUrl);
        }

        return checkout;
      } catch (error) {
        const parsedError = error as ApiError;

        if (parsedError.status === 410) {
          clearPurchaseSessionContext();
          onInternalError('Purchase session expired during checkout.');
          setCurrentStepIndex(3);
          setCompletedUntilIndex((prev) => Math.min(prev, 2));
          void bootstrapPurchaseSession(true);
          return null;
        }

        if (parsedError.status === 401) {
          onCheckoutCaptchaFailure(parsedError);
          const code = readApiCode(parsedError.details);
          if (code !== 'timeout-or-duplicate') {
            onInternalError('Session or captcha is invalid during checkout.');
          }
          return null;
        }

        if (parsedError.status === 409) {
          onInternalError('Checkout state conflict detected.');
          setCurrentStepIndex(3);
          setCompletedUntilIndex((prev) => Math.min(prev, 2));
          return null;
        }

        if (parsedError.status === 400 && normalizedFundingSource !== 'card' && allowCardFallback) {
          onInternalError('Invalid checkout funding source. Falling back to card.');
          return executeCheckout('card', redirectToApproveUrl, false);
        }

        if (parsedError.status === 400) {
          onInternalError('Invalid checkout payload sent to backend.');
          return null;
        }

        if (parsedError.status === 502) {
          onCheckoutCaptchaFailure(parsedError);
          return null;
        }

        onInternalError(parsedError.message || 'Unable to start PayPal checkout.');
        return null;
      }
    },
    [
      bootstrapPurchaseSession,
      checkoutCaptchaToken,
      clearPurchaseSessionContext,
      contactEmail,
      isCaptchaRequired,
      isSessionBootstrapping,
      lastQuotedFingerprint,
      normalizedPhoneE164,
      onCheckoutCaptchaFailure,
      onCheckoutCreated,
      onInternalError,
      purchaseSessionId,
      quote,
      quoteFingerprint,
      setCheckoutCaptchaError,
      setCompletedUntilIndex,
      setCurrentStepIndex,
    ],
  );

  const submitCheckout = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isCheckoutLoading) {
        return;
      }
      setIsCheckoutLoading(true);

      try {
        await executeCheckout('card', true, false);
      } finally {
        setIsCheckoutLoading(false);
        resetCheckoutCaptcha();
      }
    },
    [
      isCheckoutLoading,
      executeCheckout,
      resetCheckoutCaptcha,
    ],
  );

  return {
    submitCheckout,
    createCheckoutOrder: async (fundingSource?: CheckoutFundingSource) => {
      if (isCheckoutLoading) {
        return null;
      }

      setIsCheckoutLoading(true);
      try {
        return await executeCheckout(fundingSource ?? 'card', false, true);
      } finally {
        setIsCheckoutLoading(false);
        resetCheckoutCaptcha();
      }
    },
    isCheckoutLoading,
  };
};