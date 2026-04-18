import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { createQuote } from '../../api/payments';
import type { ApiError, QuoteResponse } from '../../api/types';
import type { FieldErrors, FormState } from '../../components/purchase/purchaseTypes';
import { hashPayload, readApiCode } from '../../utils/purchaseFlow';
import { resolveIdempotencyKey } from '../../utils/storage';

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

type UsePurchaseQuoteArgs = {
  form: FormState;
  selectedBookId: string | null;
  fallbackBookId: string;
  displayCurrency: string;
  quote: QuoteResponse | null;
  lastQuotedFingerprint: string | null;
  quoteFingerprint: string;
  purchaseSessionId: string;
  isSessionBootstrapping: boolean;
  bootstrapPurchaseSession: (force?: boolean) => Promise<string | null>;
  normalizedPhoneE164: string;
  normalizedRecipientTaxId: string;
  isQuoteCaptchaRequired: boolean;
  quoteCaptchaToken: string;
  validateForm: () => boolean;
  setErrors: Dispatch<SetStateAction<FieldErrors>>;
  setQuote: Dispatch<SetStateAction<QuoteResponse | null>>;
  setLastQuotedFingerprint: Dispatch<SetStateAction<string | null>>;
  setQuoteCaptchaError: Dispatch<SetStateAction<string>>;
  clearPurchaseSessionContext: () => void;
  onInternalError: (message: string) => void;
  onInfo: (message: string) => void;
  onQuoteCaptchaFailure: (parsedError: ApiError) => void;
  resetQuoteCaptcha: () => void;
};

type UsePurchaseQuoteResult = {
  requestQuote: () => Promise<QuoteResponse | null>;
  isQuoteLoading: boolean;
};

export const usePurchaseQuote = ({
  form,
  selectedBookId,
  fallbackBookId,
  displayCurrency,
  quote,
  lastQuotedFingerprint,
  quoteFingerprint,
  purchaseSessionId,
  isSessionBootstrapping,
  bootstrapPurchaseSession,
  normalizedPhoneE164,
  normalizedRecipientTaxId,
  isQuoteCaptchaRequired,
  quoteCaptchaToken,
  validateForm,
  setErrors,
  setQuote,
  setLastQuotedFingerprint,
  setQuoteCaptchaError,
  clearPurchaseSessionContext,
  onInternalError,
  onInfo,
  onQuoteCaptchaFailure,
  resetQuoteCaptcha,
}: UsePurchaseQuoteArgs): UsePurchaseQuoteResult => {
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  const requestQuote = useCallback(async () => {
    if (quote && lastQuotedFingerprint === quoteFingerprint) {
      onInfo('Using current quote without recalculation.');
      return quote;
    }

    if (isSessionBootstrapping) {
      onInternalError('Preparing secure purchase session.');
      return null;
    }

    let activePurchaseSessionId = purchaseSessionId;
    if (!activePurchaseSessionId) {
      activePurchaseSessionId = (await bootstrapPurchaseSession(true)) ?? '';
      if (!activePurchaseSessionId) {
        return null;
      }
    }

    if (!turnstileSiteKey) {
      onInternalError('Captcha configuration is missing. Set VITE_TURNSTILE_SITE_KEY to continue.');
      return null;
    }

    if (isQuoteCaptchaRequired && !quoteCaptchaToken) {
      const message = 'Complete captcha before requesting your quote.';
      setQuoteCaptchaError(message);
      setErrors((prev) => ({ ...prev, shippingOption: 'Select a shipping option.' }));
      onInternalError(message);
      return null;
    }

    if (!validateForm()) {
      return null;
    }

    if (!form.shippingOption) {
      setErrors((prev) => ({ ...prev, shippingOption: 'Select a shipping option.' }));
      return null;
    }

    setIsQuoteLoading(true);

    try {
      const trimmedState = form.state.trim();
      const trimmedAddress2 = form.address2.trim();
      const quotePayload = {
        bookId: selectedBookId ?? fallbackBookId,
        address: {
          line1: form.address1.trim(),
          ...(trimmedAddress2 ? { line2: trimmedAddress2 } : {}),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country,
          isBusiness: form.isBusiness,
          isPostbox: form.isPostbox,
          ...(trimmedState ? { state: trimmedState.toUpperCase() } : {}),
          ...(normalizedRecipientTaxId ? { recipientTaxId: normalizedRecipientTaxId } : {}),
        },
        phone: normalizedPhoneE164,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        quantity: form.quantity,
        shippingOption: form.shippingOption,
        currency: displayCurrency,
      };
      const quotePayloadHash = hashPayload({
        sessionId: activePurchaseSessionId,
        payload: quotePayload,
      });
      const idempotencyKey = resolveIdempotencyKey('quote', quotePayloadHash, activePurchaseSessionId);
      const quoteResponse = await createQuote(quotePayload, {
        purchaseSessionId: activePurchaseSessionId,
        idempotencyKey,
        captchaToken: quoteCaptchaToken,
      });

      setQuote(quoteResponse);
      setLastQuotedFingerprint(quoteFingerprint);
      onInfo('Quote generated successfully.');
      return quoteResponse;
    } catch (error) {
      const parsedError = error as ApiError;

      if (parsedError.status === 410) {
        clearPurchaseSessionContext();
        onInternalError('Purchase session expired. Bootstrapping a new session.');
        void bootstrapPurchaseSession(true);
        return null;
      }

      if (parsedError.status === 401) {
        onQuoteCaptchaFailure(parsedError);
        const code = readApiCode(parsedError.details);
        if (code !== 'timeout-or-duplicate') {
          onInternalError('Session or captcha is invalid during quote request.');
        }
        return null;
      }

      if (parsedError.status === 409) {
        clearPurchaseSessionContext();
        onInternalError('Purchase session conflict detected during quote request.');
        return null;
      }

      if (parsedError.status === 400) {
        onInternalError('Invalid quote payload sent to backend.');
        return null;
      }

      if (parsedError.status === 502) {
        onQuoteCaptchaFailure(parsedError);
        return null;
      }

      onInternalError(parsedError.message || 'Unable to calculate quote.');
      return null;
    } finally {
      setIsQuoteLoading(false);
      resetQuoteCaptcha();
    }
  }, [
    bootstrapPurchaseSession,
    clearPurchaseSessionContext,
    displayCurrency,
    fallbackBookId,
    form,
    isQuoteCaptchaRequired,
    isSessionBootstrapping,
    lastQuotedFingerprint,
    normalizedPhoneE164,
    normalizedRecipientTaxId,
    onQuoteCaptchaFailure,
    purchaseSessionId,
    quote,
    quoteCaptchaToken,
    setQuoteCaptchaError,
    quoteFingerprint,
    resetQuoteCaptcha,
    selectedBookId,
    setErrors,
    setLastQuotedFingerprint,
    setQuote,
    validateForm,
    onInternalError,
    onInfo,
  ]);

  return {
    requestQuote,
    isQuoteLoading,
  };
};