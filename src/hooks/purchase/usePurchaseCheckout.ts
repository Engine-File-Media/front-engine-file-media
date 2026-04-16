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
  setNotice: (value: string) => void;
  setApiError: (value: string) => void;
  setCheckoutCaptchaError: (value: string) => void;
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
  setNotice,
  setApiError,
  setCheckoutCaptchaError,
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

      setApiError('');
      setNotice('');

      if (isSessionBootstrapping) {
        setApiError('Preparing secure purchase session. Please wait a moment.');
        return;
      }

      if (!purchaseSessionId) {
        setApiError('Secure purchase session is missing. Please restart purchase.');
        return;
      }

      if (!turnstileSiteKey) {
        setApiError('Captcha configuration is missing. Set VITE_TURNSTILE_SITE_KEY to continue.');
        return;
      }

      if (isCaptchaRequired && !checkoutCaptchaToken) {
        const message = 'Complete captcha before continuing to PayPal.';
        setCheckoutCaptchaError(message);
        setApiError(message);
        return;
      }

      const activeQuote = quote;
      if (!activeQuote || lastQuotedFingerprint !== quoteFingerprint) {
        setApiError('Quote is outdated. Return to Shipping Method and generate a fresh quote.');
        setNotice('');
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
          setApiError('Your purchase session expired. We are creating a new session, then please generate a fresh quote.');
          setCurrentStepIndex(3);
          setCompletedUntilIndex((prev) => Math.min(prev, 2));
          setNotice('');
          void bootstrapPurchaseSession(true);
          return;
        }

        if (parsedError.status === 401) {
          onCheckoutCaptchaFailure(parsedError);
          const code = readApiCode(parsedError.details);
          if (code !== 'timeout-or-duplicate') {
            setApiError('Session or captcha is invalid. Complete captcha again and retry checkout.');
          }
          return;
        }

        if (parsedError.status === 409) {
          setApiError('Checkout state conflict detected. Generate a fresh quote and try again.');
          setCurrentStepIndex(3);
          setCompletedUntilIndex((prev) => Math.min(prev, 2));
          return;
        }

        if (parsedError.status === 400) {
          setApiError('Invalid checkout request. Review your quote and try again.');
          return;
        }

        if (parsedError.status === 502) {
          onCheckoutCaptchaFailure(parsedError);
          return;
        }

        setApiError(parsedError.message || 'Unable to start PayPal checkout.');
      } finally {
        setIsCheckoutLoading(false);
        resetCheckoutCaptcha();
      }
    },
    [
      bootstrapPurchaseSession,
      clearPurchaseSessionContext,
      contactEmail,
      isCaptchaRequired,
      isCheckoutLoading,
      isSessionBootstrapping,
      lastQuotedFingerprint,
      checkoutCaptchaToken,
      normalizedPhoneE164,
      onCheckoutCaptchaFailure,
      purchaseSessionId,
      quote,
      quoteFingerprint,
      resetCheckoutCaptcha,
      setApiError,
      setCheckoutCaptchaError,
      setCompletedUntilIndex,
      setCurrentStepIndex,
      setNotice,
    ],
  );

  return {
    submitCheckout,
    isCheckoutLoading,
  };
};