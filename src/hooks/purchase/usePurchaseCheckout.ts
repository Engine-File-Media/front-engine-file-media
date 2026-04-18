import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { createCheckout } from '../../api/payments';
import type { ApiError, QuoteResponse } from '../../api/types';
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
  resetCheckoutCaptcha: () => void;
};

type UsePurchaseCheckoutResult = {
  submitCheckout: (event: FormEvent<HTMLFormElement>) => Promise<void>;
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
  resetCheckoutCaptcha,
}: UsePurchaseCheckoutArgs): UsePurchaseCheckoutResult => {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const submitCheckout = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isCheckoutLoading) {
        return;
      }

      if (isSessionBootstrapping) {
        onInternalError('Preparing secure purchase session.');
        return;
      }

      if (!purchaseSessionId) {
        onInternalError('Secure purchase session is missing.');
        return;
      }

      if (!turnstileSiteKey) {
        onInternalError('Captcha configuration is missing. Set VITE_TURNSTILE_SITE_KEY to continue.');
        return;
      }

      if (isCaptchaRequired && !checkoutCaptchaToken) {
        const message = 'Complete captcha before continuing to PayPal.';
        setCheckoutCaptchaError(message);
        onInternalError(message);
        return;
      }

      const activeQuote = quote;
      if (!activeQuote || lastQuotedFingerprint !== quoteFingerprint) {
        onInternalError('Quote is outdated at checkout submit.');
        setCurrentStepIndex(3);
        setCompletedUntilIndex((prev) => Math.min(prev, 2));
        return;
      }

      const activeCaptchaToken = checkoutCaptchaToken;
      if (isCaptchaRequired) {
        setCheckoutCaptchaError('');
      }

      setIsCheckoutLoading(true);

      try {
        const checkoutPayload = { quoteId: activeQuote.quoteId };
        const checkoutPayloadHash = hashPayload({
          sessionId: purchaseSessionId,
          payload: checkoutPayload,
        });
        const idempotencyKey = resolveIdempotencyKey('checkout', checkoutPayloadHash, purchaseSessionId);
        const checkout = await createCheckout(activeQuote.quoteId, {
          purchaseSessionId,
          idempotencyKey,
          captchaToken: activeCaptchaToken,
        });

        savePurchaseState({
          quoteId: activeQuote.quoteId,
          orderId: checkout.orderId,
          paypalOrderId: checkout.paypalOrderId,
          phoneE164: normalizedPhoneE164,
          contactEmail,
        });
        markPurchaseResultPending();
        window.location.assign(checkout.approveUrl);
      } catch (error) {
        const parsedError = error as ApiError;

        if (parsedError.status === 410) {
          clearPurchaseSessionContext();
          onInternalError('Purchase session expired during checkout.');
          setCurrentStepIndex(3);
          setCompletedUntilIndex((prev) => Math.min(prev, 2));
          void bootstrapPurchaseSession(true);
          return;
        }

        if (parsedError.status === 401) {
          onCheckoutCaptchaFailure(parsedError);
          const code = readApiCode(parsedError.details);
          if (code !== 'timeout-or-duplicate') {
            onInternalError('Session or captcha is invalid during checkout.');
          }
          return;
        }

        if (parsedError.status === 409) {
          onInternalError('Checkout state conflict detected.');
          setCurrentStepIndex(3);
          setCompletedUntilIndex((prev) => Math.min(prev, 2));
          return;
        }

        if (parsedError.status === 400) {
          onInternalError('Invalid checkout payload sent to backend.');
          return;
        }

        if (parsedError.status === 502) {
          onCheckoutCaptchaFailure(parsedError);
          return;
        }

        onInternalError(parsedError.message || 'Unable to start PayPal checkout.');
      } finally {
        setIsCheckoutLoading(false);
        resetCheckoutCaptcha();
      }
    },
    [
      bootstrapPurchaseSession,
      clearPurchaseSessionContext,
      contactEmail,
      checkoutCaptchaToken,
      isCaptchaRequired,
      isCheckoutLoading,
      isSessionBootstrapping,
      lastQuotedFingerprint,
      normalizedPhoneE164,
      onInternalError,
      onCheckoutCaptchaFailure,
      purchaseSessionId,
      quote,
      quoteFingerprint,
      resetCheckoutCaptcha,
      setCheckoutCaptchaError,
      setCompletedUntilIndex,
      setCurrentStepIndex,
    ],
  );

  return {
    submitCheckout,
    isCheckoutLoading,
  };
};