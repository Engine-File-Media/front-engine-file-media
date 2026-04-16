import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAddressMetadata, getBooksPricing } from '../../api/payments';
import type { AddressMetadataResponse, ApiError, BookPricing, QuoteResponse } from '../../api/types';
import PurchaseGallery from '../purchase/PurchaseGallery';
import PurchaseAddressStep from '../purchase/steps/PurchaseAddressStep';
import PurchaseCheckoutStep from '../purchase/steps/PurchaseCheckoutStep';
import PurchaseContactStep from '../purchase/steps/PurchaseContactStep';
import PurchaseOrderStep from '../purchase/steps/PurchaseOrderStep';
import PurchaseShippingStep from '../purchase/steps/PurchaseShippingStep';
import PurchaseStepSummaryCard from '../purchase/PurchaseStepSummaryCard';
import PurchaseStepTimeline from '../purchase/PurchaseStepTimeline';
import PurchaseSummary from '../purchase/PurchaseSummary';
import TurnstileWidget from '../security/TurnstileWidget';
import type { TurnstileWidgetRef } from '../security/TurnstileWidget';
import type { FieldErrors, FormState } from '../purchase/purchaseTypes';
import { usePurchaseDraft } from '../../hooks/purchase/usePurchaseDraft';
import { usePurchaseCheckout } from '../../hooks/purchase/usePurchaseCheckout';
import { usePurchaseSession } from '../../hooks/purchase/usePurchaseSession';
import { usePurchaseQuote } from '../../hooks/purchase/usePurchaseQuote';
import { useShippingOptions } from '../../hooks/purchase/useShippingOptions';
import { resolveVolumeConfig } from '../../data/volumes';
import {
  composePhoneWithDialCode,
  formatPhoneForInput,
  getPhoneDialCodeByCountry,
  getPhoneInputMaxLengthByCountry,
  getPhonePlaceholderByCountry,
  isLuluPhonePatternValid,
  normalizePhoneToE164,
} from '../../utils/phone';
import { normalizeRecipientTaxIdForPayload, readCaptchaCode } from '../../utils/purchaseFlow';

const shippingInputClasses =
  'h-11 w-full border border-black/20 bg-white px-3 text-[14px] text-[#0A0A0A] outline-none transition-colors focus:border-black/45';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxQuantity = 50;
const stateCodePattern = /^[A-Z0-9-]{1,10}$/;
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';
type StepKey = 'order' | 'address' | 'contact' | 'shipping' | 'checkout';

const purchaseSteps: Array<{ key: StepKey; label: string }> = [
  { key: 'order', label: 'Order' },
  { key: 'address', label: 'Address' },
  { key: 'contact', label: 'Contact' },
  { key: 'shipping', label: 'Shipping Method' },
  { key: 'checkout', label: 'Checkout' },
];

const addressDependentFields: Array<keyof FormState> = [
  'address1',
  'address2',
  'recipientTaxId',
  'city',
  'state',
  'postalCode',
  'country',
  'isBusiness',
  'isPostbox',
];

const contactDependentFields: Array<keyof FormState> = ['email', 'firstName', 'lastName', 'phone'];

const clearErrorFields = (
  previousErrors: FieldErrors,
  fieldsToClear: Array<keyof FieldErrors>,
  nextErrors: FieldErrors,
) => {
  const clearedErrors = { ...previousErrors };
  fieldsToClear.forEach((field) => {
    delete clearedErrors[field];
  });

  return {
    ...clearedErrors,
    ...nextErrors,
  };
};

const clampQuantity = (value: number) => Math.min(maxQuantity, Math.max(1, value));

const formatRecipientTaxIdForInput = (countryCode: string, value: string) => {
  if (countryCode === 'CL') {
    const cleaned = value.toUpperCase().replace(/[^0-9K]/g, '');
    if (cleaned.length <= 1) {
      return cleaned;
    }

    const verifier = cleaned.slice(-1);
    const body = cleaned.slice(0, -1);
    const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withDots}-${verifier}`;
  }

  if (countryCode === 'BR') {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 11) {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }

    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  if (countryCode === 'MX') {
    return value.toUpperCase().replace(/[^A-Z0-9&]/g, '').slice(0, 13);
  }

  return value;
};

const getRecipientTaxIdUxHint = (countryCode: string) => {
  if (countryCode === 'CL') return 'Format: 12.345.678-5';
  if (countryCode === 'BR') return 'Format: CPF 000.000.000-00 or CNPJ 00.000.000/0000-00';
  if (countryCode === 'MX') return 'Format: RFC (e.g. ABCD010101ABC)';
  return 'Enter the tax identifier exactly as issued.';
};

function PurchasePage() {
  const { volumeId } = useParams<{ volumeId?: string }>();
  const resolvedVolume = useMemo(() => resolveVolumeConfig(volumeId), [volumeId]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookPricing | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    quantity: 1,
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    recipientTaxId: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    isBusiness: false,
    isPostbox: false,
    phone: '',
    shippingOption: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [addressMetadata, setAddressMetadata] = useState<AddressMetadataResponse | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [lastQuotedFingerprint, setLastQuotedFingerprint] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [apiError, setApiError] = useState('');
  const [countryQuery, setCountryQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [stateQuery, setStateQuery] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [quoteCaptchaToken, setQuoteCaptchaToken] = useState('');
  const [checkoutCaptchaToken, setCheckoutCaptchaToken] = useState('');
  const [quoteCaptchaError, setQuoteCaptchaError] = useState('');
  const [checkoutCaptchaError, setCheckoutCaptchaError] = useState('');
  const [isCaptchaEnforced, setIsCaptchaEnforced] = useState(Boolean(turnstileSiteKey));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedUntilIndex, setCompletedUntilIndex] = useState(-1);
  const quoteTurnstileRef = useRef<TurnstileWidgetRef | null>(null);
  const checkoutTurnstileRef = useRef<TurnstileWidgetRef | null>(null);
  const currentStepKey = purchaseSteps[currentStepIndex]?.key ?? 'order';
  const isCaptchaRequired = isCaptchaEnforced;

  const {
    purchaseSessionId,
    isSessionBootstrapping,
    bootstrapPurchaseSession,
    clearPurchaseSessionContext,
  } = usePurchaseSession(resolvedVolume.bookId, setApiError);

  const invalidateFromStep = useCallback((stepIndex: number) => {
    setCompletedUntilIndex((prev) => Math.min(prev, stepIndex - 1));
    setCurrentStepIndex((prev) => (prev > stepIndex ? stepIndex : prev));

    if (stepIndex <= 3) {
      setQuote(null);
      setLastQuotedFingerprint(null);
      setNotice('');

      // Only clear secure session if a quote already existed.
      // This avoids session churn while user is still choosing shipping options.
      const hadQuote = Boolean(quote) || Boolean(lastQuotedFingerprint);
      if (hadQuote) {
        clearPurchaseSessionContext();
      }
    }
  }, [clearPurchaseSessionContext, lastQuotedFingerprint, quote]);

  const moveToNextStep = useCallback((stepIndex: number) => {
    setCompletedUntilIndex((prev) => Math.max(prev, stepIndex));
    setCurrentStepIndex(Math.min(stepIndex + 1, purchaseSteps.length - 1));
  }, []);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex === currentStepIndex || stepIndex > completedUntilIndex) {
        return;
      }

      invalidateFromStep(stepIndex);
      setCurrentStepIndex(stepIndex);
    },
    [completedUntilIndex, currentStepIndex, invalidateFromStep],
  );
  const selectedCountry = useMemo(() => {
    return addressMetadata?.countries.find((country) => country.code === form.country) ?? null;
  }, [addressMetadata?.countries, form.country]);
  const selectedCountryLabel = selectedCountry?.name ?? 'Selected country';
  const requiresStateCode = addressMetadata?.fields.requiresState ?? false;
  const requiresRecipientTaxId = addressMetadata?.fields.requiresRecipientTaxId ?? false;
  const selectedSubdivisionCatalog = useMemo(() => {
    return addressMetadata?.subdivisions ?? [];
  }, [addressMetadata?.subdivisions]);
  const selectedSubdivision = useMemo(() => {
    const normalizedState = form.state.trim().toUpperCase();
    return selectedSubdivisionCatalog.find((item) => item.code === normalizedState) ?? null;
  }, [form.state, selectedSubdivisionCatalog]);
  const filteredCountries = useMemo(() => {
    const countries = addressMetadata?.countries ?? [];
    const query = countryQuery.trim().toLowerCase();

    if (!query) {
      return countries;
    }

    return countries.filter((country) => {
      const nameMatch = country.name.toLowerCase().includes(query);
      const codeMatch = country.code.toLowerCase().includes(query);
      return nameMatch || codeMatch;
    });
  }, [addressMetadata?.countries, countryQuery]);
  const normalizedPhoneE164 = useMemo(() => {
    return normalizePhoneToE164(form.phone, form.country);
  }, [form.country, form.phone]);
  const phonePlaceholder = useMemo(() => {
    return getPhonePlaceholderByCountry(form.country);
  }, [form.country]);
  const phoneMaxLength = useMemo(() => {
    return getPhoneInputMaxLengthByCountry(form.country);
  }, [form.country]);
  const phoneDialCode = useMemo(() => {
    return getPhoneDialCodeByCountry(form.country);
  }, [form.country]);
  const luluPhoneCandidate = useMemo(() => {
    return composePhoneWithDialCode(form.phone, form.country);
  }, [form.country, form.phone]);
  const normalizedRecipientTaxId = useMemo(() => {
    return normalizeRecipientTaxIdForPayload(form.country, form.recipientTaxId);
  }, [form.country, form.recipientTaxId]);

  const {
    shippingOptions,
    setShippingOptions,
    isShippingOptionsLoading,
  } = useShippingOptions({
    form,
    selectedBook,
    normalizedRecipientTaxId,
    purchaseSessionId,
    shippingOption: form.shippingOption,
    setForm,
    onError: setApiError,
  });

  usePurchaseDraft({
    volumeId: resolvedVolume.id,
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
  });

  useEffect(() => {
    if (selectedCountry) {
      setCountryQuery(`${selectedCountry.name} (${selectedCountry.code})`);
      return;
    }

    setCountryQuery(form.country);
  }, [form.country, selectedCountry]);

  useEffect(() => {
    if (isStateDropdownOpen) {
      return;
    }

    if (selectedSubdivision) {
      setStateQuery(selectedSubdivision.name);
      return;
    }

    setStateQuery('');
  }, [isStateDropdownOpen, selectedSubdivision]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsModalOpen(false);
  }, [resolvedVolume.id]);

  useEffect(() => {
    const loadInitialData = async () => {
      console.log('[PurchasePage] Loading initial data...');
      setIsPricingLoading(true);
      try {
        // Load book pricing
        const pricingResponse = await getBooksPricing();
        const match =
          pricingResponse.books.find((book) => book.id === resolvedVolume.bookId) ??
          pricingResponse.books[0] ??
          null;
        console.log('[PurchasePage] Book pricing loaded:', {
          bookId: match?.id,
          price: match?.price,
          currency: match?.currency,
        });
        setSelectedBook(match);

        // Load address metadata for default country
        console.log('[PurchasePage] Loading address metadata for US...');
        const metadataResponse = await getAddressMetadata('US');
        setAddressMetadata(metadataResponse);
      } catch (error) {
        const parsedError = error as ApiError;
        console.error('[PurchasePage] Failed to load initial data:', {
          message: parsedError.message,
          status: parsedError.status,
        });
        setApiError(parsedError.message || 'Unable to load checkout data.');
      } finally {
        setIsPricingLoading(false);
      }
    };

    void loadInitialData();
  }, [resolvedVolume.bookId]);

  const quoteFingerprint = useMemo(
    () =>
      JSON.stringify({
        bookId: selectedBook?.id ?? resolvedVolume.bookId,
        quantity: form.quantity,
        email: form.email.trim().toLowerCase(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        phone: normalizedPhoneE164,
        line1: form.address1.trim(),
        line2: form.address2.trim(),
        recipientTaxId: normalizedRecipientTaxId,
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        postalCode: form.postalCode.trim(),
        country: form.country,
        isBusiness: form.isBusiness,
        isPostbox: form.isPostbox,
        shippingOption: form.shippingOption,
      }),
    [form, normalizedPhoneE164, normalizedRecipientTaxId, resolvedVolume.bookId, selectedBook?.id],
  );

  const displayCurrency = quote?.currency ?? selectedBook?.currency ?? 'USD';
  const unitBasePrice = quote?.pricing.baseUnitPrice ?? selectedBook?.price ?? selectedBook?.effectivePrice ?? 0;
  const unitEffectivePrice =
    quote?.pricing.effectiveUnitPrice ?? selectedBook?.effectivePrice ?? selectedBook?.price ?? 0;
  const saleActive =
    Boolean(quote?.pricing.sale ?? selectedBook?.sale) &&
    (quote?.pricing.discount ?? selectedBook?.discount ?? 0) > 0 &&
    unitBasePrice > unitEffectivePrice;
  const discountPercent = quote?.pricing.discount ?? selectedBook?.discount ?? 0;
  const fallbackProduct = unitEffectivePrice * form.quantity;
  const summaryProduct = quote?.costs.product ?? fallbackProduct;
  const summaryShipping = quote?.costs.shipping ?? 0;
  const summaryFulfillment = quote?.costs.fulfillment ?? 0;
  const summaryHandling = quote?.costs.handling ?? 0;
  const fallbackSubtotal = summaryProduct + summaryShipping + summaryFulfillment + summaryHandling;
  const summarySubtotalExclTax = quote?.costs.subtotalExclTax ?? quote?.costs.subtotal ?? fallbackSubtotal;
  const summaryTax = quote?.costs.tax ?? 0;
  const summaryTotalExclTax = quote?.costs.totalExclTax ?? summarySubtotalExclTax;
  const summaryTotalInclTax = quote?.costs.totalInclTax ?? quote?.costs.total ?? summaryTotalExclTax + summaryTax;
  const summaryTotal = quote?.costs.total ?? summaryTotalInclTax;
  const summaryDiscount = saleActive ? Math.max(unitBasePrice - unitEffectivePrice, 0) * form.quantity : 0;

  const handleCountryChange = useCallback(
    async (newCountryCode: string) => {
      console.log('[PurchasePage] Country changed to', newCountryCode);
      setForm((prev) => ({
        ...prev,
        country: newCountryCode,
        state: '',
        recipientTaxId: '',
        phone: formatPhoneForInput(prev.phone, newCountryCode),
      }));
      setNotice('');
      setStateQuery('');
      setIsStateDropdownOpen(false);
      
      setIsMetadataLoading(true);
      try {
        const newMetadata = await getAddressMetadata(newCountryCode);
        setAddressMetadata(newMetadata);
        console.log('[PurchasePage] Address metadata loaded for', newCountryCode, {
          requiresState: newMetadata.fields.requiresState,
          stateLabel: newMetadata.fields.stateLabel,
          subdivisions: newMetadata.subdivisions.length,
        });
      } catch (error) {
        const parsedError = error as ApiError;
        console.error('[PurchasePage] Failed to load metadata for country', {
          country: newCountryCode,
          message: parsedError.message,
        });
        setApiError(parsedError.message || `Unable to load metadata for ${newCountryCode}.`);
      } finally {
        setIsMetadataLoading(false);
      }
    },
    [],
  );

  const increaseQuantity = () => {
    updateField('quantity', clampQuantity(form.quantity + 1));
  };

  const decreaseQuantity = () => {
    updateField('quantity', clampQuantity(form.quantity - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % resolvedVolume.galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + resolvedVolume.galleryImages.length) % resolvedVolume.galleryImages.length);
  };

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    const isOrderField = key === 'quantity';
    const isAddressField = addressDependentFields.includes(key);
    const isContactField = contactDependentFields.includes(key);
    const isShippingField = key === 'shippingOption';

    if (isOrderField) {
      invalidateFromStep(0);
    } else if (isAddressField) {
      invalidateFromStep(1);
      setShippingOptions([]);
    } else if (isContactField) {
      invalidateFromStep(2);
    } else if (isShippingField) {
      invalidateFromStep(3);
    }

    setForm((prev) => {
      const nextForm = { ...prev, [key]: value };
      if ((isOrderField || isAddressField) && prev.shippingOption) {
        nextForm.shippingOption = '';
      }
      return nextForm;
    });

    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[key];
      if (isOrderField || isAddressField) {
        delete nextErrors.shippingOption;
      }
      return nextErrors;
    });
  }, [invalidateFromStep, setShippingOptions]);

  const validateForm = useCallback(() => {
    const nextErrors: FieldErrors = {};

    if (!form.email.trim() || !emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }

    if (!form.address1.trim()) {
      nextErrors.address1 = 'Address is required.';
    }

    if (!form.city.trim()) {
      nextErrors.city = 'City is required.';
    }

    if (!form.postalCode.trim()) {
      nextErrors.postalCode = 'Postal code is required.';
    }

    if (requiresRecipientTaxId && !normalizedRecipientTaxId) {
      nextErrors.recipientTaxId = `${addressMetadata?.fields.recipientTaxIdLabel ?? 'Recipient Tax ID'} is required for this destination.`;
    }

    if (requiresStateCode && !form.state.trim()) {
      nextErrors.state = 'State/Province code is required for this destination.';
    }

    const normalizedState = form.state.trim().toUpperCase();
    if (normalizedState && selectedSubdivisionCatalog) {
      const isKnownSubdivision = selectedSubdivisionCatalog.some((item) => item.code === normalizedState);
      if (!isKnownSubdivision) {
        nextErrors.state = `Use a valid ISO-3166-2 code for ${selectedCountryLabel}.`;
      }
    } else if (normalizedState && !stateCodePattern.test(normalizedState)) {
      nextErrors.state = 'Use a valid state/province code (letters, numbers, hyphen).';
    }

    if (!form.country.trim()) {
      nextErrors.country = 'Country is required.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone is required.';
    } else if (!isLuluPhonePatternValid(form.phone, form.country)) {
      nextErrors.phone = 'Phone must use 8-20 valid characters (digits, spaces, +, -, /, parentheses).';
    } else if (!normalizedPhoneE164) {
      nextErrors.phone = `Enter a valid phone number for ${selectedCountryLabel}.`;
    }

    if (!Number.isFinite(form.quantity) || form.quantity < 1 || form.quantity > maxQuantity) {
      nextErrors.quantity = `Quantity must be between 1 and ${maxQuantity}.`;
    }

    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    
    if (!isValid) {
      console.warn('[PurchasePage] Form validation failed:', {
        failedFields: Object.keys(nextErrors),
        errors: nextErrors,
      });
    } else {
      console.log('[PurchasePage] Form validation passed');
    }
    
    return isValid;
  }, [
    addressMetadata?.fields.recipientTaxIdLabel,
    form,
    normalizedPhoneE164,
    normalizedRecipientTaxId,
    requiresRecipientTaxId,
    requiresStateCode,
    selectedCountryLabel,
    selectedSubdivisionCatalog,
  ]);

  const validateOrderStep = useCallback(() => {
    const nextErrors: FieldErrors = {};
    if (!Number.isFinite(form.quantity) || form.quantity < 1 || form.quantity > maxQuantity) {
      nextErrors.quantity = `Quantity must be between 1 and ${maxQuantity}.`;
    }

    setErrors((prev) => clearErrorFields(prev, ['quantity'], nextErrors));
    return Object.keys(nextErrors).length === 0;
  }, [form.quantity]);

  const validateAddressStep = useCallback(() => {
    const nextErrors: FieldErrors = {};

    if (!form.address1.trim()) {
      nextErrors.address1 = 'Address is required.';
    }

    if (!form.city.trim()) {
      nextErrors.city = 'City is required.';
    }

    if (!form.postalCode.trim()) {
      nextErrors.postalCode = 'Postal code is required.';
    }

    if (!form.country.trim()) {
      nextErrors.country = 'Country is required.';
    }

    if (requiresRecipientTaxId && !normalizedRecipientTaxId) {
      nextErrors.recipientTaxId = `${addressMetadata?.fields.recipientTaxIdLabel ?? 'Recipient Tax ID'} is required for this destination.`;
    }

    if (requiresStateCode && !form.state.trim()) {
      nextErrors.state = 'State/Province code is required for this destination.';
    }

    const normalizedState = form.state.trim().toUpperCase();
    if (normalizedState && selectedSubdivisionCatalog) {
      const isKnownSubdivision = selectedSubdivisionCatalog.some((item) => item.code === normalizedState);
      if (!isKnownSubdivision) {
        nextErrors.state = `Use a valid ISO-3166-2 code for ${selectedCountryLabel}.`;
      }
    } else if (normalizedState && !stateCodePattern.test(normalizedState)) {
      nextErrors.state = 'Use a valid state/province code (letters, numbers, hyphen).';
    }

    setErrors((prev) =>
      clearErrorFields(prev, ['address1', 'recipientTaxId', 'city', 'state', 'postalCode', 'country'], nextErrors),
    );

    return Object.keys(nextErrors).length === 0;
  }, [
    addressMetadata?.fields.recipientTaxIdLabel,
    form.address1,
    form.city,
    form.country,
    form.postalCode,
    form.state,
    normalizedRecipientTaxId,
    requiresRecipientTaxId,
    requiresStateCode,
    selectedCountryLabel,
    selectedSubdivisionCatalog,
  ]);

  const validateContactStep = useCallback(() => {
    const nextErrors: FieldErrors = {};

    if (!form.email.trim() || !emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone is required.';
    } else if (!isLuluPhonePatternValid(form.phone, form.country)) {
      nextErrors.phone = 'Phone must use 8-20 valid characters (digits, spaces, +, -, /, parentheses).';
    } else if (!normalizedPhoneE164) {
      nextErrors.phone = `Enter a valid phone number for ${selectedCountryLabel}.`;
    }

    setErrors((prev) => clearErrorFields(prev, ['email', 'firstName', 'lastName', 'phone'], nextErrors));

    return Object.keys(nextErrors).length === 0;
  }, [form.country, form.email, form.firstName, form.lastName, form.phone, normalizedPhoneE164, selectedCountryLabel]);

  const validateShippingStep = useCallback(() => {
    const nextErrors: FieldErrors = {};

    if (!form.shippingOption) {
      nextErrors.shippingOption = 'Select a shipping option.';
    }

    setErrors((prev) => clearErrorFields(prev, ['shippingOption'], nextErrors));
    return Object.keys(nextErrors).length === 0;
  }, [form.shippingOption]);

  const handleEditStep = useCallback(
    (stepIndex: number) => {
      invalidateFromStep(stepIndex);
      setCurrentStepIndex(stepIndex);
    },
    [invalidateFromStep],
  );

  const selectedShippingOptionLabel = useMemo(() => {
    const selected = shippingOptions.find((option) => option.level === form.shippingOption);
    if (!selected) {
      return form.shippingOption || 'Not selected';
    }
    return `${selected.level} (${selected.currency} ${selected.costExclTax})`;
  }, [form.shippingOption, shippingOptions]);

  const orderSummaryLines = useMemo(
    () => [`Quantity: ${form.quantity}`, `Estimated base total: ${displayCurrency} ${(unitBasePrice * form.quantity).toFixed(2)}`],
    [displayCurrency, form.quantity, unitBasePrice],
  );

  const addressSummaryLines = useMemo(() => {
    const lines = [
      `Address: ${form.address1}${form.address2.trim() ? `, ${form.address2.trim()}` : ''}`,
      `City / State: ${form.city}${form.state.trim() ? `, ${form.state.trim().toUpperCase()}` : ''}`,
      `Postal code / Country: ${form.postalCode} / ${form.country}`,
    ];

    if (form.isBusiness) {
      lines.push('Business address: Yes');
    }
    if (form.isPostbox) {
      lines.push('PO Box address: Yes');
    }
    if (normalizedRecipientTaxId) {
      lines.push(`Tax ID: ${normalizedRecipientTaxId}`);
    }

    return lines;
  }, [form.address1, form.address2, form.city, form.country, form.isBusiness, form.isPostbox, form.postalCode, form.state, normalizedRecipientTaxId]);

  const contactSummaryLines = useMemo(
    () => [
      `Name: ${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      `Email: ${form.email.trim()}`,
      `Phone: ${normalizedPhoneE164 || luluPhoneCandidate || form.phone.trim()}`,
    ],
    [form.email, form.firstName, form.lastName, form.phone, luluPhoneCandidate, normalizedPhoneE164],
  );

  const shippingSummaryLines = useMemo(
    () => [`Method: ${selectedShippingOptionLabel}`, `Quote total: ${displayCurrency} ${summaryTotal.toFixed(2)}`],
    [displayCurrency, selectedShippingOptionLabel, summaryTotal],
  );

  const onQuoteCaptchaTokenChange = useCallback((token: string) => {
    setQuoteCaptchaToken(token);
    if (token) {
      setQuoteCaptchaError('');
    }
  }, []);

  const onCheckoutCaptchaTokenChange = useCallback((token: string) => {
    setCheckoutCaptchaToken(token);
    if (token) {
      setCheckoutCaptchaError('');
    }
  }, []);

  const handleQuoteCaptchaFailure = useCallback(
    (parsedError: ApiError) => {
      const code = readCaptchaCode(parsedError.details);
      setQuoteCaptchaToken('');
      quoteTurnstileRef.current?.reset();

      if (parsedError.status === 401 && code === 'timeout-or-duplicate') {
        setIsCaptchaEnforced(true);
        const message = 'Captcha expired or already used. Please complete it again.';
        setQuoteCaptchaError(message);
        setApiError(message);
        return;
      }

      if (parsedError.status === 401) {
        setIsCaptchaEnforced(true);
        const message =
          'Captcha verification failed. Complete the challenge and try again.';
        setQuoteCaptchaError(message);
        setApiError(message);
        return;
      }

      if (parsedError.status === 502) {
        const message =
          'Captcha verification service is temporarily unavailable. Please try again.';
        setQuoteCaptchaError(message);
        setApiError(message);
      }
    },
    [],
  );

  const handleCheckoutCaptchaFailure = useCallback(
    (parsedError: ApiError) => {
      const code = readCaptchaCode(parsedError.details);
      setCheckoutCaptchaToken('');
      checkoutTurnstileRef.current?.reset();

      if (parsedError.status === 401 && code === 'timeout-or-duplicate') {
        setIsCaptchaEnforced(true);
        const message = 'Captcha expired or already used. Please complete it again.';
        setCheckoutCaptchaError(message);
        setApiError(message);
        return;
      }

      if (parsedError.status === 401) {
        setIsCaptchaEnforced(true);
        const message =
          'Captcha verification failed. Complete the challenge and try again.';
        setCheckoutCaptchaError(message);
        setApiError(message);
        return;
      }

      if (parsedError.status === 502) {
        const message =
          'Captcha verification service is temporarily unavailable. Please try again.';
        setCheckoutCaptchaError(message);
        setApiError(message);
      }
    },
    [],
  );

  const resetQuoteCaptcha = useCallback(() => {
    setQuoteCaptchaToken('');
    quoteTurnstileRef.current?.reset();
  }, []);

  const resetCheckoutCaptcha = useCallback(() => {
    setCheckoutCaptchaToken('');
    checkoutTurnstileRef.current?.reset();
  }, []);

  const {
    requestQuote,
    isQuoteLoading,
  } = usePurchaseQuote({
    form,
    selectedBookId: selectedBook?.id ?? null,
    fallbackBookId: resolvedVolume.bookId,
    displayCurrency: quote?.currency ?? selectedBook?.currency ?? 'USD',
    quote,
    lastQuotedFingerprint,
    quoteFingerprint,
    purchaseSessionId,
    isSessionBootstrapping,
    bootstrapPurchaseSession,
    normalizedPhoneE164,
    normalizedRecipientTaxId,
    isQuoteCaptchaRequired: isCaptchaRequired && Boolean(form.shippingOption),
    quoteCaptchaToken,
    validateForm,
    setErrors,
    setQuote,
    setLastQuotedFingerprint,
    setNotice,
    setApiError,
    setQuoteCaptchaError,
    clearPurchaseSessionContext,
    onQuoteCaptchaFailure: handleQuoteCaptchaFailure,
    resetQuoteCaptcha,
  });

  const {
    submitCheckout,
    isCheckoutLoading,
  } = usePurchaseCheckout({
    quote,
    quoteFingerprint,
    lastQuotedFingerprint,
    purchaseSessionId,
    isSessionBootstrapping,
    bootstrapPurchaseSession,
    isCaptchaRequired,
    checkoutCaptchaToken,
    normalizedPhoneE164,
    contactEmail: form.email.trim(),
    clearPurchaseSessionContext,
    setCurrentStepIndex,
    setCompletedUntilIndex,
    setNotice,
    setApiError,
    setCheckoutCaptchaError,
    onCheckoutCaptchaFailure: handleCheckoutCaptchaFailure,
    resetCheckoutCaptcha,
  });

  const isQuoteCaptchaRequired = isCaptchaRequired && Boolean(form.shippingOption);

  useEffect(() => {
    setQuoteCaptchaError('');
    resetQuoteCaptcha();
  }, [form.shippingOption, resetQuoteCaptcha]);

  const quoteCaptchaNode = isQuoteCaptchaRequired ? (
    <TurnstileWidget
      ref={quoteTurnstileRef}
      siteKey={turnstileSiteKey}
      action="quote_submit"
      onTokenChange={onQuoteCaptchaTokenChange}
      onExpired={() => {
        setQuoteCaptchaToken('');
        setQuoteCaptchaError('Captcha expired. Please complete it again.');
      }}
      onError={(message) => {
        setQuoteCaptchaToken('');
        setQuoteCaptchaError(message);
      }}
    />
  ) : null;

  const checkoutCaptchaNode = isCaptchaRequired ? (
    <TurnstileWidget
      ref={checkoutTurnstileRef}
      siteKey={turnstileSiteKey}
      action="checkout_submit"
      onTokenChange={onCheckoutCaptchaTokenChange}
      onExpired={() => {
        setCheckoutCaptchaToken('');
        setCheckoutCaptchaError('Captcha expired. Please complete it again.');
      }}
      onError={(message) => {
        setCheckoutCaptchaToken('');
        setCheckoutCaptchaError(message);
      }}
    />
  ) : null;

  const handleContinueCurrentStep = useCallback(async () => {
    if (currentStepKey === 'order') {
      if (!validateOrderStep()) {
        return;
      }
      moveToNextStep(0);
      return;
    }

    if (currentStepKey === 'address') {
      if (!validateAddressStep()) {
        return;
      }
      moveToNextStep(1);
      return;
    }

    if (currentStepKey === 'contact') {
      if (!validateContactStep()) {
        return;
      }
      moveToNextStep(2);
      return;
    }

    if (currentStepKey === 'shipping') {
      if (!validateShippingStep()) {
        return;
      }

      if (quote && lastQuotedFingerprint === quoteFingerprint) {
        moveToNextStep(3);
        return;
      }

      const nextQuote = await requestQuote();
      if (!nextQuote) {
        return;
      }
      moveToNextStep(3);
    }
  }, [
    currentStepKey,
    lastQuotedFingerprint,
    moveToNextStep,
    quote,
    quoteFingerprint,
    requestQuote,
    validateAddressStep,
    validateContactStep,
    validateOrderStep,
    validateShippingStep,
  ]);

  const canContinueCurrentStep =
    (currentStepKey === 'order' && !isPricingLoading && !isSessionBootstrapping) ||
    (currentStepKey === 'address' && !isMetadataLoading && !isSessionBootstrapping) ||
    (currentStepKey === 'contact' && true) ||
    (currentStepKey === 'shipping' &&
      !isQuoteLoading &&
      !isCheckoutLoading &&
      !isSessionBootstrapping &&
      (!isQuoteCaptchaRequired || Boolean(quoteCaptchaToken)));

  const continueButtonLabel =
    currentStepKey === 'order'
      ? 'Continue to Address'
      : currentStepKey === 'address'
        ? 'Continue to Contact'
        : currentStepKey === 'contact'
          ? 'Continue to Shipping Method'
          : 'Continue to Checkout';

  return (
    <main className="w-full bg-white">
      <section className="border-b border-black/10 bg-[#F8F8F6]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-10 md:px-10 md:py-14 xl:px-12">
          <p
            className="text-[12px] font-semibold tracking-[2px] text-[#0A0A0A]/60 uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Checkout
          </p>
          <h1
            className="text-[35px] leading-[95%] text-[#0A0A0A] md:text-[44px]"
            style={{ fontFamily: 'Crimson Text, serif' }}
          >
            Purchase {resolvedVolume.title}
          </h1>
          <p
            className="max-w-3xl text-[16px] leading-[135%] text-[#0A0A0A]/70"
            style={{ fontFamily: 'Crimson Text, serif' }}
          >
            Complete your shipping details, calculate the real shipping cost, and continue to PayPal.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14 xl:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form className="space-y-9" noValidate onSubmit={submitCheckout}>
            {(apiError || notice) && (
              <section className="border border-black/10 bg-[#F8F8F6] p-4 md:p-5">
                {apiError && (
                  <p className="text-[14px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {apiError}
                  </p>
                )}
                {notice && (
                  <p className="text-[14px] text-[#0A0A0A]/80" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {notice}
                  </p>
                )}
              </section>
            )}

            <PurchaseStepTimeline
              steps={purchaseSteps}
              currentStepIndex={currentStepIndex}
              completedUntilIndex={completedUntilIndex}
              onSelectStep={goToStep}
            />

            {completedUntilIndex >= 0 && currentStepIndex !== 0 && (
              <PurchaseStepSummaryCard title="Order" lines={orderSummaryLines} onEdit={() => handleEditStep(0)} />
            )}
            {completedUntilIndex >= 1 && currentStepIndex !== 1 && (
              <PurchaseStepSummaryCard title="Address" lines={addressSummaryLines} onEdit={() => handleEditStep(1)} />
            )}
            {completedUntilIndex >= 2 && currentStepIndex !== 2 && (
              <PurchaseStepSummaryCard title="Contact" lines={contactSummaryLines} onEdit={() => handleEditStep(2)} />
            )}
            {completedUntilIndex >= 3 && currentStepIndex !== 3 && (
              <PurchaseStepSummaryCard
                title="Shipping Method"
                lines={shippingSummaryLines}
                onEdit={() => handleEditStep(3)}
              />
            )}

            {currentStepKey === 'order' && (
              <PurchaseOrderStep
                volumeTitle={resolvedVolume.title}
                isPricingLoading={isPricingLoading}
                displayCurrency={displayCurrency}
                unitEffectivePrice={unitEffectivePrice}
                unitBasePrice={unitBasePrice}
                saleActive={saleActive}
                discountPercent={discountPercent}
                quantity={form.quantity}
                quantityError={errors.quantity}
                maxQuantity={maxQuantity}
                summaryProduct={summaryProduct}
                summaryShipping={summaryShipping}
                summaryFulfillment={summaryFulfillment}
                summaryHandling={summaryHandling}
                summaryTax={summaryTax}
                summaryDiscount={summaryDiscount}
                summaryTotal={summaryTotal}
                onDecreaseQuantity={decreaseQuantity}
                onIncreaseQuantity={increaseQuantity}
                onQuantityInput={(value) => {
                  const parsed = Number(value);
                  if (Number.isNaN(parsed)) {
                    updateField('quantity', 1);
                    return;
                  }
                  updateField('quantity', clampQuantity(parsed));
                }}
                canContinueCurrentStep={canContinueCurrentStep}
                continueButtonLabel={continueButtonLabel}
                onContinue={handleContinueCurrentStep}
              />
            )}

            {currentStepKey === 'address' && (
              <PurchaseAddressStep
                form={form}
                errors={errors}
                shippingInputClasses={shippingInputClasses}
                addressMetadata={addressMetadata}
                isMetadataLoading={isMetadataLoading}
                selectedCountry={selectedCountry}
                selectedCountryLabel={selectedCountryLabel}
                requiresStateCode={requiresStateCode}
                requiresRecipientTaxId={requiresRecipientTaxId}
                selectedSubdivisionCatalog={selectedSubdivisionCatalog}
                filteredCountries={filteredCountries}
                countryQuery={countryQuery}
                isCountryDropdownOpen={isCountryDropdownOpen}
                stateQuery={stateQuery}
                isStateDropdownOpen={isStateDropdownOpen}
                setCountryQuery={setCountryQuery}
                setIsCountryDropdownOpen={setIsCountryDropdownOpen}
                setStateQuery={setStateQuery}
                setIsStateDropdownOpen={setIsStateDropdownOpen}
                onUpdateField={updateField}
                onHandleCountryChange={handleCountryChange}
                formatRecipientTaxIdForInput={formatRecipientTaxIdForInput}
                getRecipientTaxIdUxHint={getRecipientTaxIdUxHint}
                canContinueCurrentStep={canContinueCurrentStep}
                continueButtonLabel={continueButtonLabel}
                onContinue={handleContinueCurrentStep}
              />
            )}

            {currentStepKey === 'contact' && (
              <PurchaseContactStep
                form={form}
                errors={errors}
                shippingInputClasses={shippingInputClasses}
                phoneDialCode={phoneDialCode}
                phonePlaceholder={phonePlaceholder}
                phoneMaxLength={phoneMaxLength}
                normalizedPhoneE164={normalizedPhoneE164}
                luluPhoneCandidate={luluPhoneCandidate}
                onUpdateField={updateField}
                formatPhoneForInput={formatPhoneForInput}
                canContinueCurrentStep={canContinueCurrentStep}
                continueButtonLabel={continueButtonLabel}
                onContinue={handleContinueCurrentStep}
              />
            )}

            {currentStepKey === 'shipping' && (
              <PurchaseShippingStep
                form={form}
                shippingOptions={shippingOptions}
                isSessionBootstrapping={isSessionBootstrapping}
                isShippingOptionsLoading={isShippingOptionsLoading}
                isPricingLoading={isPricingLoading}
                isQuoteLoading={isQuoteLoading}
                isCheckoutLoading={isCheckoutLoading}
                shippingInputClasses={shippingInputClasses}
                errors={errors}
                captchaToken={quoteCaptchaToken}
                captchaError={quoteCaptchaError}
                isCaptchaRequired={isQuoteCaptchaRequired}
                captchaNode={quoteCaptchaNode}
                onUpdateField={updateField}
                onRequestQuote={requestQuote}
                canContinueCurrentStep={canContinueCurrentStep}
                continueButtonLabel={isQuoteLoading ? 'Calculating...' : continueButtonLabel}
                onContinue={handleContinueCurrentStep}
              />
            )}

            {currentStepKey === 'checkout' && (
              <PurchaseCheckoutStep
                quote={quote}
                quoteFingerprint={quoteFingerprint}
                lastQuotedFingerprint={lastQuotedFingerprint}
                isSessionBootstrapping={isSessionBootstrapping}
                isPricingLoading={isPricingLoading}
                isCheckoutLoading={isCheckoutLoading}
                isQuoteLoading={isQuoteLoading}
                captchaToken={checkoutCaptchaToken}
                captchaError={checkoutCaptchaError}
                isCaptchaRequired={isCaptchaRequired}
                captchaNode={checkoutCaptchaNode}
              />
            )}
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <PurchaseGallery
              volumeTitle={resolvedVolume.title}
              galleryTitle={resolvedVolume.galleryTitle}
              gallerySubtitle={resolvedVolume.gallerySubtitle}
              images={resolvedVolume.galleryImages}
              currentImageIndex={currentImageIndex}
              isModalOpen={isModalOpen}
              onOpenModal={() => setIsModalOpen(true)}
              onCloseModal={() => setIsModalOpen(false)}
              onNextImage={handleNextImage}
              onPrevImage={handlePrevImage}
            />

            <PurchaseSummary
              variant="sidebar"
              volumeTitle={resolvedVolume.title}
              isPricingLoading={isPricingLoading}
              displayCurrency={displayCurrency}
              unitEffectivePrice={unitEffectivePrice}
              unitBasePrice={unitBasePrice}
              saleActive={saleActive}
              discountPercent={discountPercent}
              quantity={form.quantity}
              quantityError={errors.quantity}
              maxQuantity={maxQuantity}
              summaryProduct={summaryProduct}
              summaryShipping={summaryShipping}
              summaryFulfillment={summaryFulfillment}
              summaryHandling={summaryHandling}
              summaryTax={summaryTax}
              summaryDiscount={summaryDiscount}
              summaryTotal={summaryTotal}
              onDecreaseQuantity={decreaseQuantity}
              onIncreaseQuantity={increaseQuantity}
              onQuantityInput={(value) => {
                const parsed = Number(value);
                if (Number.isNaN(parsed)) {
                  updateField('quantity', 1);
                  return;
                }
                updateField('quantity', clampQuantity(parsed));
              }}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}

export default PurchasePage;
