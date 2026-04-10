import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { createCheckout, createQuote, getAddressMetadata, getBooksPricing, getShippingOptions } from '../../api/payments';
import type { AddressMetadataResponse, ApiError, BookPricing, QuoteResponse, ShippingOption } from '../../api/types';
import PurchaseGallery from '../purchase/PurchaseGallery';
import PurchaseContactForm from '../purchase/PurchaseContactForm';
import PurchasePaymentAction from '../purchase/PurchasePaymentAction';
import PurchaseShippingForm from '../purchase/PurchaseShippingForm';
import PurchaseShippingQuoteSection from '../purchase/PurchaseShippingQuoteSection';
import PurchaseSummary from '../purchase/PurchaseSummary';
import type { FieldErrors, FormState } from '../purchase/purchaseTypes';
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
import { savePurchaseState } from '../../utils/storage';

const shippingInputClasses =
  'h-11 w-full border border-black/20 bg-white px-3 text-[14px] text-[#0A0A0A] outline-none transition-colors focus:border-black/45';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxQuantity = 50;
const stateCodePattern = /^[A-Z0-9-]{1,10}$/;

const clampQuantity = (value: number) => Math.min(maxQuantity, Math.max(1, value));

const normalizeRecipientTaxIdForPayload = (countryCode: string, value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (countryCode === 'CL') {
    return trimmed.toUpperCase().replace(/[^0-9K]/g, '');
  }

  if (countryCode === 'BR') {
    return trimmed.replace(/\D/g, '');
  }

  if (countryCode === 'MX') {
    return trimmed.toUpperCase().replace(/\s+/g, '');
  }

  return trimmed;
};

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
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isShippingOptionsLoading, setIsShippingOptionsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [apiError, setApiError] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [countryQuery, setCountryQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const previousShippingOptionRef = useRef(form.shippingOption);
  const selectedCountry = useMemo(() => {
    return addressMetadata?.countries.find((country) => country.code === form.country) ?? null;
  }, [addressMetadata?.countries, form.country]);
  const selectedCountryLabel = selectedCountry?.name ?? 'Selected country';
  const requiresStateCode = addressMetadata?.fields.requiresState ?? false;
  const requiresRecipientTaxId = addressMetadata?.fields.requiresRecipientTaxId ?? false;
  const selectedSubdivisionCatalog = useMemo(() => {
    return addressMetadata?.subdivisions ?? [];
  }, [addressMetadata?.subdivisions]);
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

  useEffect(() => {
    if (selectedCountry) {
      setCountryQuery(`${selectedCountry.name} (${selectedCountry.code})`);
      return;
    }

    setCountryQuery(form.country);
  }, [form.country, selectedCountry]);

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

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

  const canRequestShippingOptions =
    Boolean(selectedBook?.id) &&
    Number.isFinite(form.quantity) &&
    form.quantity > 0 &&
    Boolean(form.address1.trim()) &&
    Boolean(form.city.trim()) &&
    Boolean(form.postalCode.trim()) &&
    Boolean(form.country.trim()) &&
    (!requiresRecipientTaxId || Boolean(normalizedRecipientTaxId)) &&
    (!requiresStateCode || Boolean(form.state.trim()));

  const canAutoQuoteOnShippingSelection =
    canRequestShippingOptions &&
    Boolean(form.shippingOption) &&
    Boolean(form.email.trim()) &&
    emailPattern.test(form.email.trim()) &&
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    Boolean(normalizedPhoneE164);

  const requestShippingOptions = useCallback(async () => {
    if (!canRequestShippingOptions || !selectedBook) {
      return;
    }

    setApiError('');
    setIsShippingOptionsLoading(true);

    try {
      const trimmedState = form.state.trim();
      const trimmedAddress2 = form.address2.trim();
      const response = await getShippingOptions({
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
      });

      const fetchedOptions = response.shippingOptions;
      setShippingOptions(fetchedOptions);

      if (fetchedOptions.length > 0 && !fetchedOptions.some((option) => option.level === form.shippingOption)) {
        updateField('shippingOption', fetchedOptions[0].level);
      }
    } catch (error) {
      const parsedError = error as ApiError;
      console.error('[PurchasePage] Shipping options request failed:', {
        message: parsedError.message,
        status: parsedError.status,
        details: parsedError.details,
        requestData: { country: form.country, quantity: form.quantity },
      });
      setShippingOptions([]);
      updateField('shippingOption', '');
      setApiError(parsedError.message || 'Unable to load shipping options.');
    } finally {
      setIsShippingOptionsLoading(false);
    }
  }, [
    canRequestShippingOptions,
    form.address1,
    form.address2,
    form.city,
    form.country,
    form.isBusiness,
    form.isPostbox,
    form.postalCode,
    form.quantity,
    form.shippingOption,
    form.state,
    normalizedRecipientTaxId,
    selectedBook,
  ]);

  useEffect(() => {
    if (!canRequestShippingOptions) {
      setShippingOptions([]);
      if (form.shippingOption) {
        updateField('shippingOption', '');
      }
      return;
    }

    const timer = window.setTimeout(() => {
      void requestShippingOptions();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    canRequestShippingOptions,
    form.shippingOption,
    requestShippingOptions,
  ]);

  const requestQuote = useCallback(async () => {
    if (!validateForm()) {
      return null;
    }

    if (!form.shippingOption) {
      setErrors((prev) => ({ ...prev, shippingOption: 'Select a shipping option.' }));
      return null;
    }

    setApiError('');
    setNotice('');
    setIsQuoteLoading(true);

    try {
      const trimmedState = form.state.trim();
      const trimmedAddress2 = form.address2.trim();
      const quoteResponse = await createQuote({
        bookId: selectedBook?.id ?? resolvedVolume.bookId,
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
      });

      console.log('[PurchasePage] Quote created successfully:', {
        quoteId: quoteResponse.quoteId,
        total: quoteResponse.costs.total,
      });
      setQuote(quoteResponse);
      setLastQuotedFingerprint(quoteFingerprint);
      setNotice('Quote generated successfully. You can continue to PayPal.');
      return quoteResponse;
    } catch (error) {
      const parsedError = error as ApiError;
      console.error('[PurchasePage] Quote creation failed:', {
        message: parsedError.message,
        status: parsedError.status,
        details: parsedError.details,
      });
      setApiError(parsedError.message || 'Unable to calculate quote.');
      return null;
    } finally {
      setIsQuoteLoading(false);
    }
  }, [
    displayCurrency,
    form,
    normalizedPhoneE164,
    normalizedRecipientTaxId,
    quoteFingerprint,
    resolvedVolume.bookId,
    selectedBook?.id,
    validateForm,
  ]);

  useEffect(() => {
    if (previousShippingOptionRef.current === form.shippingOption) {
      return;
    }

    previousShippingOptionRef.current = form.shippingOption;
    setQuote(null);
    setLastQuotedFingerprint(null);
    setNotice('');

    if (!form.shippingOption || !canAutoQuoteOnShippingSelection) {
      return;
    }

    const timer = window.setTimeout(() => {
      void requestQuote();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canAutoQuoteOnShippingSelection, form.shippingOption, requestQuote]);

  const handleCheckoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('[PurchasePage] Checkout submit initiated');

    if (isCheckoutLoading) {
      return;
    }

    setApiError('');
    setNotice('');

    let activeQuote = quote;
    if (!activeQuote || lastQuotedFingerprint !== quoteFingerprint) {
      console.log('[PurchasePage] Requesting fresh quote before checkout');
      activeQuote = await requestQuote();
    }

    if (!activeQuote) {
      console.warn('[PurchasePage] No active quote after requestQuote');
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const checkout = await createCheckout(activeQuote.quoteId);
      console.log('[PurchasePage] Checkout created successfully:', {
        quoteId: activeQuote.quoteId,
        paypalOrderId: checkout.paypalOrderId,
      });
      savePurchaseState({
        quoteId: activeQuote.quoteId,
        orderId: checkout.orderId,
        paypalOrderId: checkout.paypalOrderId,
        phoneE164: normalizedPhoneE164,
        contactEmail: form.email.trim(),
      });
      window.location.assign(checkout.approveUrl);
    } catch (error) {
      const parsedError = error as ApiError;
      console.error('[PurchasePage] Checkout creation failed:', {
        message: parsedError.message,
        status: parsedError.status,
        details: parsedError.details,
        quoteId: activeQuote.quoteId,
      });
      setApiError(parsedError.message || 'Unable to start PayPal checkout.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

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
          <form className="space-y-9" noValidate onSubmit={handleCheckoutSubmit}>
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

            <PurchaseSummary
              variant="order"
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

            <PurchaseShippingForm
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
              setCountryQuery={setCountryQuery}
              setIsCountryDropdownOpen={setIsCountryDropdownOpen}
              onUpdateField={updateField}
              onHandleCountryChange={handleCountryChange}
              formatRecipientTaxIdForInput={formatRecipientTaxIdForInput}
              getRecipientTaxIdUxHint={getRecipientTaxIdUxHint}
            />

            <PurchaseContactForm
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
            />

            <PurchaseShippingQuoteSection
              form={form}
              shippingOptions={shippingOptions}
              isShippingOptionsLoading={isShippingOptionsLoading}
              isPricingLoading={isPricingLoading}
              isQuoteLoading={isQuoteLoading}
              isCheckoutLoading={isCheckoutLoading}
              shippingInputClasses={shippingInputClasses}
              onUpdateField={updateField}
              onRequestQuote={requestQuote}
            />
            <PurchasePaymentAction
              quote={quote}
              quoteFingerprint={quoteFingerprint}
              lastQuotedFingerprint={lastQuotedFingerprint}
              isPricingLoading={isPricingLoading}
              isCheckoutLoading={isCheckoutLoading}
              isQuoteLoading={isQuoteLoading}
            />
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
