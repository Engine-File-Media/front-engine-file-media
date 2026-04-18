import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { QuoteResponse, ShippingOption } from '../../api/types';
import type { FormState } from '../../components/purchase/purchaseTypes';

const PURCHASE_DRAFT_TTL_MS = 30 * 60 * 1000;
const PURCHASE_DRAFT_STORAGE_KEY = 'purchase-flow-draft';

type PurchaseDraftSnapshot = {
  volumeId: string;
  form: FormState;
  currentStepIndex: number;
  completedUntilIndex: number;
  quote: QuoteResponse | null;
  lastQuotedFingerprint: string | null;
  shippingOptions: ShippingOption[];
  savedAt: number;
};

type UsePurchaseDraftArgs = {
  volumeId: string;
  form: FormState;
  currentStepIndex: number;
  completedUntilIndex: number;
  quote: QuoteResponse | null;
  lastQuotedFingerprint: string | null;
  shippingOptions: ShippingOption[];
  setForm: Dispatch<SetStateAction<FormState>>;
  setCurrentStepIndex: Dispatch<SetStateAction<number>>;
  setCompletedUntilIndex: Dispatch<SetStateAction<number>>;
  setQuote: Dispatch<SetStateAction<QuoteResponse | null>>;
  setLastQuotedFingerprint: Dispatch<SetStateAction<string | null>>;
  setShippingOptions: Dispatch<SetStateAction<ShippingOption[]>>;
};

export const usePurchaseDraft = ({
  volumeId,
  form,
  currentStepIndex,
  completedUntilIndex,
  quote,
  lastQuotedFingerprint,
  shippingOptions,
  setForm,
  setCurrentStepIndex,
  setCompletedUntilIndex,
  setQuote,
  setLastQuotedFingerprint,
  setShippingOptions,
}: UsePurchaseDraftArgs) => {
  const hasHydratedDraftRef = useRef(false);

  useEffect(() => {
    const now = Date.now();

    try {
      const rawDraft = localStorage.getItem(PURCHASE_DRAFT_STORAGE_KEY);
      if (!rawDraft) {
        hasHydratedDraftRef.current = true;
        return;
      }

      const parsed = JSON.parse(rawDraft) as PurchaseDraftSnapshot;
      if (parsed.volumeId !== volumeId || now - parsed.savedAt > PURCHASE_DRAFT_TTL_MS) {
        localStorage.removeItem(PURCHASE_DRAFT_STORAGE_KEY);
        hasHydratedDraftRef.current = true;
        return;
      }

      setForm(parsed.form);
      setCurrentStepIndex(Math.max(0, Math.min(parsed.currentStepIndex, 4)));
      setCompletedUntilIndex(Math.max(-1, Math.min(parsed.completedUntilIndex, 4)));
      setQuote(parsed.quote);
      setLastQuotedFingerprint(parsed.lastQuotedFingerprint);
      setShippingOptions(parsed.shippingOptions ?? []);
    } catch {
      localStorage.removeItem(PURCHASE_DRAFT_STORAGE_KEY);
    } finally {
      hasHydratedDraftRef.current = true;
    }
  }, [
    setCompletedUntilIndex,
    setCurrentStepIndex,
    setForm,
    setLastQuotedFingerprint,
    setQuote,
    setShippingOptions,
    volumeId,
  ]);

  useEffect(() => {
    if (!hasHydratedDraftRef.current) {
      return;
    }

    const payload: PurchaseDraftSnapshot = {
      volumeId,
      form,
      currentStepIndex,
      completedUntilIndex,
      quote,
      lastQuotedFingerprint,
      shippingOptions,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(PURCHASE_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write failures.
    }
  }, [
    completedUntilIndex,
    currentStepIndex,
    form,
    lastQuotedFingerprint,
    quote,
    shippingOptions,
    volumeId,
  ]);
};