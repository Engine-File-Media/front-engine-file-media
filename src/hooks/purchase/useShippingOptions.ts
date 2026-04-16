import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ApiError, ShippingOption, BookPricing } from '../../api/types';
import { getShippingOptions } from '../../api/payments';
import type { FormState } from '../../components/purchase/purchaseTypes';

const SHIPPING_OPTIONS_CACHE_TTL_MS = 2 * 60 * 1000;
const PURCHASE_SHIPPING_CACHE_STORAGE_KEY = 'purchase-shipping-options-cache';

type ShippingCacheSnapshot = {
  entries: Record<string, { expiresAt: number; options: ShippingOption[] }>;
};

type FormLike = {
  quantity: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isBusiness: boolean;
  isPostbox: boolean;
};

type UseShippingOptionsArgs = {
  form: FormLike;
  selectedBook: BookPricing | null;
  normalizedRecipientTaxId: string;
  purchaseSessionId: string;
  shippingOption: string;
  setForm: Dispatch<SetStateAction<FormState>>;
  onError: (message: string) => void;
};

type UseShippingOptionsResult = {
  shippingOptions: ShippingOption[];
  setShippingOptions: Dispatch<SetStateAction<ShippingOption[]>>;
  isShippingOptionsLoading: boolean;
};

export const useShippingOptions = ({
  form,
  selectedBook,
  normalizedRecipientTaxId,
  purchaseSessionId,
  shippingOption,
  setForm,
  onError,
}: UseShippingOptionsArgs): UseShippingOptionsResult => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isShippingOptionsLoading, setIsShippingOptionsLoading] = useState(false);
  const shippingOptionsCacheRef = useRef<Map<string, { expiresAt: number; options: ShippingOption[] }>>(new Map());

  useEffect(() => {
    const now = Date.now();

    try {
      const rawCache = localStorage.getItem(PURCHASE_SHIPPING_CACHE_STORAGE_KEY);
      if (!rawCache) {
        return;
      }

      const parsed = JSON.parse(rawCache) as ShippingCacheSnapshot;
      const filteredEntries = Object.entries(parsed.entries ?? {}).filter(([, value]) => value.expiresAt > now);
      shippingOptionsCacheRef.current = new Map(filteredEntries);
    } catch {
      shippingOptionsCacheRef.current = new Map();
    }
  }, []);

  useEffect(() => {
    if (!selectedBook) {
      setShippingOptions([]);
      return;
    }

    if (!form.address1.trim() || !form.city.trim() || !form.postalCode.trim() || !form.country.trim()) {
      setShippingOptions([]);
      if (shippingOption) {
        setForm((prev) => ({ ...prev, shippingOption: '' }));
      }
      return;
    }

    const trimmedState = form.state.trim();
    const trimmedAddress2 = form.address2.trim();
    const shippingRequestPayload = {
      bookId: selectedBook.id,
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
      quantity: form.quantity,
      currency: selectedBook.currency,
    };

    const cacheKey = JSON.stringify(shippingRequestPayload);
    const scopedCacheKey = `${purchaseSessionId || 'no-session'}:${cacheKey}`;
    const now = Date.now();
    const cachedEntry = shippingOptionsCacheRef.current.get(scopedCacheKey);

    if (cachedEntry && cachedEntry.expiresAt > now) {
      setShippingOptions(cachedEntry.options);

      if (!cachedEntry.options.some((option) => option.level === shippingOption)) {
        setForm((prev) => ({ ...prev, shippingOption: '' }));
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setIsShippingOptionsLoading(true);

      void (async () => {
        try {
          const response = await getShippingOptions(shippingRequestPayload);
          const fetchedOptions = response.shippingOptions;

          setShippingOptions(fetchedOptions);
          shippingOptionsCacheRef.current.set(scopedCacheKey, {
            expiresAt: now + SHIPPING_OPTIONS_CACHE_TTL_MS,
            options: fetchedOptions,
          });

          if (!fetchedOptions.some((option) => option.level === shippingOption)) {
            setForm((prev) => ({ ...prev, shippingOption: '' }));
          }
        } catch (error) {
          const parsedError = error as ApiError;
          setShippingOptions([]);
          shippingOptionsCacheRef.current.delete(scopedCacheKey);
          setForm((prev) => ({ ...prev, shippingOption: '' }));
          onError(parsedError.message || 'Unable to load shipping options.');
        } finally {
          setIsShippingOptionsLoading(false);
        }
      })();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    form.address1,
    form.address2,
    form.city,
    form.country,
    form.isBusiness,
    form.isPostbox,
    form.postalCode,
    form.quantity,
    form.state,
    normalizedRecipientTaxId,
    onError,
    purchaseSessionId,
    selectedBook,
    setForm,
    shippingOption,
  ]);

  return {
    shippingOptions,
    setShippingOptions,
    isShippingOptionsLoading,
  };
};