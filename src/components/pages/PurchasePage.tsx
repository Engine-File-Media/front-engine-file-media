import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import bookMockupCovers from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/BOOK-MOCKUP-COVERS.webp';
import indiceImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/INDICE.webp';
import capituloAudiImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/CAPITULO AUDI.webp';
import introduccionImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/introduccion.webp';
import toyotaCelicaImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/TOYOTA-CELICA-ST205.webp';
import { createCheckout, createQuote, getAddressMetadata, getBooksPricing, getShippingOptions } from '../../api/payments';
import type { AddressMetadataResponse, ApiError, BookPricing, QuoteResponse, ShippingOption } from '../../api/types';
import { formatPhoneForInput, getPhoneInputMaxLengthByCountry, getPhonePlaceholderByCountry, normalizePhoneToE164 } from '../../utils/phone';
import { savePurchaseState } from '../../utils/storage';

const shippingInputClasses =
  'h-11 w-full border border-black/20 bg-white px-3 text-[14px] text-[#0A0A0A] outline-none transition-colors focus:border-black/45';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const defaultBookId = 'volume-i';
const maxQuantity = 50;
const stateCodePattern = /^[A-Z0-9-]{1,10}$/;

type FormState = {
  quantity: number;
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  recipientTaxId: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  shippingOption: string;
};

const galleryImages = [
  { src: bookMockupCovers, alt: 'Volume I - Book mockup covers' },
  { src: indiceImage, alt: 'Volume I - Indice spread' },
  { src: capituloAudiImage, alt: 'Volume I - Audi chapter spread' },
  { src: introduccionImage, alt: 'Volume I - Introduction spread' },
  { src: toyotaCelicaImage, alt: 'Volume I - Toyota Celica ST205 spread' },
];

type FieldErrors = Partial<Record<keyof FormState, string>>;

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);

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
    const loadInitialData = async () => {
      console.log('[PurchasePage] Loading initial data...');
      try {
        // Load book pricing
        const pricingResponse = await getBooksPricing();
        const match =
          pricingResponse.books.find((book) => book.id === defaultBookId) ??
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
  }, []);

  const quoteFingerprint = useMemo(
    () =>
      JSON.stringify({
        bookId: selectedBook?.id ?? defaultBookId,
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
        shippingOption: form.shippingOption,
      }),
    [form, normalizedPhoneE164, normalizedRecipientTaxId, selectedBook?.id],
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
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
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
        bookId: selectedBook?.id ?? defaultBookId,
        address: {
          line1: form.address1.trim(),
          ...(trimmedAddress2 ? { line2: trimmedAddress2 } : {}),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country,
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
            Purchase Volume I
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

            <section className="border border-black/10 p-5 md:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
                <h2
                  className="text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
                  style={{ fontFamily: 'Crimson Text, serif' }}
                >
                  Order
                </h2>
                <p
                  className="text-[13px] tracking-[1.4px] text-[#0A0A0A]/60 uppercase"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isPricingLoading ? 'Loading price...' : `${displayCurrency} ${unitEffectivePrice.toFixed(2)} each`}
                </p>
              </div>

              {saleActive && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[13px] text-[#0A0A0A]/50 line-through" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatMoney(unitBasePrice, displayCurrency)}
                  </span>
                  <span className="text-[14px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatMoney(unitEffectivePrice, displayCurrency)}
                  </span>
                  <span className="rounded bg-[#F4E7E7] px-2 py-1 text-[11px] font-semibold tracking-[1px] text-[#7A1E1E] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2" htmlFor="volumeQty">
                  <span
                    className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Quantity
                  </span>
                  <div className="flex h-11 items-center overflow-hidden border border-black/20 bg-white">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="h-full w-11 border-r border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      id="volumeQty"
                      name="volumeQty"
                      type="number"
                      min={1}
                      max={maxQuantity}
                      inputMode="numeric"
                      className="h-full w-full bg-white px-3 text-center text-[14px] text-[#0A0A0A] outline-none"
                      value={form.quantity}
                      onChange={(event) => {
                        const parsed = Number(event.target.value);
                        if (Number.isNaN(parsed)) {
                          updateField('quantity', 1);
                          return;
                        }
                        updateField('quantity', clampQuantity(parsed));
                      }}
                    />
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="h-full w-11 border-l border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Max {maxQuantity} volumes per order.
                  </span>
                  {errors.quantity && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.quantity}
                    </span>
                  )}
                </label>

                <div className="flex flex-col justify-end border border-black/10 bg-[#FAFAFA] px-4 py-3">
                  <span
                    className="text-[11px] tracking-[1.2px] text-[#0A0A0A]/60 uppercase"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Estimated total
                  </span>
                  <strong
                    className="mt-1 text-[26px] leading-none text-[#0A0A0A]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                  >
                    {formatMoney(summaryTotal, displayCurrency)}
                  </strong>
                </div>
              </div>
            </section>

            <section className="border border-black/10 p-5 md:p-7">
              <h2
                className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Contact & Shipping
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="email">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={shippingInputClasses}
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                  {errors.email && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.email}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="firstName">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    First name
                  </span>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="Name"
                    value={form.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                  />
                  {errors.firstName && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.firstName}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="lastName">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Last name
                  </span>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="Surname"
                    value={form.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                  />
                  {errors.lastName && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.lastName}
                    </span>
                  )}
                </label>

                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="address1">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Address
                  </span>
                  <input
                    id="address1"
                    name="address1"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="Street and number"
                    value={form.address1}
                    onChange={(event) => updateField('address1', event.target.value)}
                  />
                  {errors.address1 && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.address1}
                    </span>
                  )}
                </label>

                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="address2">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Address (continued) - Optional
                  </span>
                  <input
                    id="address2"
                    name="address2"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="Apt., Suite, Building, etc."
                    value={form.address2}
                    onChange={(event) => updateField('address2', event.target.value)}
                  />
                  <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                    For additional address details such as apartment or office number.
                  </span>
                </label>

                {requiresRecipientTaxId && (
                  <label className="md:col-span-2 flex flex-col gap-2" htmlFor="recipientTaxId">
                    <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {addressMetadata?.fields.recipientTaxIdLabel ?? 'Recipient Tax ID'}
                    </span>
                    <input
                      id="recipientTaxId"
                      name="recipientTaxId"
                      type="text"
                      className={shippingInputClasses}
                      placeholder={addressMetadata?.fields.recipientTaxIdLabel ?? 'Recipient Tax ID'}
                      value={form.recipientTaxId}
                      onChange={(event) =>
                        updateField('recipientTaxId', formatRecipientTaxIdForInput(form.country, event.target.value))
                      }
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Required for {selectedCountryLabel}. {getRecipientTaxIdUxHint(form.country)}
                    </span>
                    {errors.recipientTaxId && (
                      <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {errors.recipientTaxId}
                      </span>
                    )}
                  </label>
                )}

                <label className="flex flex-col gap-2" htmlFor="city">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    City / Locality
                  </span>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="City"
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                  />
                  {errors.city && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.city}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="state">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {addressMetadata?.fields.stateLabel ?? 'State / Province'}
                  </span>
                  {selectedSubdivisionCatalog.length > 0 ? (
                    <select
                      id="state"
                      name="state"
                      className={shippingInputClasses}
                      value={form.state}
                      onChange={(event) => updateField('state', event.target.value)}
                    >
                      <option value="">Select</option>
                      {selectedSubdivisionCatalog.map((subdivision) => (
                        <option key={subdivision.code} value={subdivision.code}>
                          {subdivision.code} - {subdivision.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="state"
                      name="state"
                      type="text"
                      className={shippingInputClasses}
                      placeholder="State/Province code"
                      value={form.state}
                      onChange={(event) => updateField('state', event.target.value.toUpperCase())}
                    />
                  )}
                  {requiresStateCode && (
                    <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Required for {selectedCountryLabel}.
                    </span>
                  )}
                  {errors.state && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.state}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="postalCode">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {addressMetadata?.fields.postalCodeLabel ?? 'Postal code'}
                  </span>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    className={shippingInputClasses}
                    placeholder={addressMetadata?.fields.postalCodeLabel ?? 'Postal code'}
                    value={form.postalCode}
                    onChange={(event) => updateField('postalCode', event.target.value)}
                  />
                  {errors.postalCode && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.postalCode}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="country">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Country
                  </span>
                  <div className="relative">
                    <input
                      id="country"
                      name="country"
                      type="text"
                      autoComplete="off"
                      className={shippingInputClasses}
                      placeholder="Type to search country"
                      value={countryQuery}
                      onFocus={() => {
                        setIsCountryDropdownOpen(true);
                        setCountryQuery('');
                      }}
                      onChange={(event) => {
                        setCountryQuery(event.target.value);
                        setIsCountryDropdownOpen(true);
                      }}
                      onBlur={() => {
                        window.setTimeout(() => {
                          setIsCountryDropdownOpen(false);
                          if (selectedCountry) {
                            setCountryQuery(`${selectedCountry.name} (${selectedCountry.code})`);
                          }
                        }, 120);
                      }}
                      disabled={isMetadataLoading || !addressMetadata}
                    />
                    {isCountryDropdownOpen && !isMetadataLoading && addressMetadata && (
                      <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-black/20 bg-white shadow-sm">
                        {filteredCountries.length === 0 ? (
                          <div className="px-3 py-2 text-[13px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                            No countries found.
                          </div>
                        ) : (
                          filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-[#0A0A0A] transition-colors hover:bg-black/5"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                setCountryQuery(`${country.name} (${country.code})`);
                                setIsCountryDropdownOpen(false);
                                void handleCountryChange(country.code);
                              }}
                            >
                              <span>{country.name}</span>
                              <span className="text-[#0A0A0A]/55">{country.code}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {filteredCountries.length} countries match your search.
                  </span>
                  {errors.country && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.country}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="phone">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Phone
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={shippingInputClasses}
                    placeholder={phonePlaceholder}
                    maxLength={phoneMaxLength}
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        'phone',
                        formatPhoneForInput(event.target.value, form.country).slice(0, phoneMaxLength),
                      )
                    }
                  />
                  <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {normalizedPhoneE164 ? `Will be sent as ${normalizedPhoneE164}` : 'International validation by country (E.164 on submit).'}
                  </span>
                  {errors.phone && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="shippingOption">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Shipping method
                  </span>
                  <select
                    id="shippingOption"
                    name="shippingOption"
                    className={shippingInputClasses}
                    value={form.shippingOption}
                    onChange={(event) => updateField('shippingOption', event.target.value)}
                    disabled={isShippingOptionsLoading || shippingOptions.length === 0}
                  >
                    {isShippingOptionsLoading && <option value="">Loading shipping options...</option>}
                    {!isShippingOptionsLoading && shippingOptions.length === 0 && (
                      <option value="">Fill address to load options</option>
                    )}
                    {shippingOptions.map((option) => {
                      const optionPrice = Number(option.costExclTax);
                      const formattedOptionPrice = Number.isNaN(optionPrice)
                        ? `${option.costExclTax} ${option.currency}`
                        : formatMoney(optionPrice, option.currency);
                      const trackingLabel = option.traceable ? 'Trackable' : 'No tracking';
                      const deliveryLabel = `${option.totalDaysMin}-${option.totalDaysMax} business days`;
                      return (
                        <option key={`${option.id}-${option.level}`} value={option.level}>
                          {`${option.level} | ${formattedOptionPrice} | ${trackingLabel} | ${deliveryLabel}`}
                        </option>
                      );
                    })}
                  </select>
                  {shippingOptions.length > 0 && (
                    <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Includes estimated delivery and tracking availability per option.
                    </span>
                  )}
                </label>
              </div>

              <div className="mt-5 border border-black/10 bg-[#F9F9F9] px-4 py-3">
                <p className="text-[13px] leading-[1.4] text-[#0A0A0A]/70" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Shipping options are loaded automatically when the address is complete. Generate the quote to see the full cost breakdown.
                </p>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => void requestQuote()}
                  disabled={isPricingLoading || isQuoteLoading || isCheckoutLoading || !form.shippingOption}
                  className="inline-flex w-full items-center justify-center border border-black/15 bg-white px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-[#0A0A0A] uppercase disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isQuoteLoading ? 'Calculating...' : 'Calculate total with shipping'}
                </button>
              </div>
            </section>
            <section className="border border-black/10 p-5 md:p-7">
              <h2
                className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Payment
              </h2>

              <div className="mt-5 space-y-4">
                <label className="flex items-center justify-between gap-3 border border-black/20 bg-[#F9F9F9] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" checked readOnly className="h-4 w-4 accent-black" />
                    <span className="text-[16px] text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                      PayPal
                    </span>
                  </div>
                  <span className="rounded bg-[#FFC439] px-3 py-1 text-[12px] font-bold text-[#111]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    PayPal
                  </span>
                </label>

                <div className="border border-black/10 px-4 py-3">
                  <p className="text-[14px] leading-[1.4] text-[#0A0A0A]/70" style={{ fontFamily: 'Crimson Text, serif' }}>
                    You will be redirected to PayPal to complete the payment.
                  </p>
                  {quote && (
                    <p className="mt-2 text-[13px] leading-[1.4] text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Quote ID: {quote.quoteId}
                    </p>
                  )}
                  {quote && lastQuotedFingerprint !== quoteFingerprint && (
                    <p className="mt-2 text-[13px] leading-[1.4] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Form data changed after quote. Checkout will recalculate totals before redirecting.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPricingLoading || isCheckoutLoading || isQuoteLoading}
                  className="inline-flex w-full items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isCheckoutLoading ? 'Redirecting...' : 'Continue to PayPal'}
                </button>
              </div>
            </section>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="border border-black/10 p-5 md:p-6">
              <h3
                className="text-[26px] leading-none text-[#0A0A0A]"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Volume I Gallery
              </h3>

              <p
                className="mt-2 text-[14px] leading-[1.4] text-[#0A0A0A]/70"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Preview of selected spreads and cover mockups.
              </p>

              <div className="mt-5 space-y-3">
                <div className="relative border border-black/10 bg-[#FAFAFA]">
                  <img
                    src={galleryImages[currentImageIndex].src}
                    alt={galleryImages[currentImageIndex].alt}
                    onClick={() => setIsModalOpen(true)}
                    className="h-96 w-full cursor-pointer object-cover transition-opacity hover:opacity-95 md:h-120 xl:h-136"
                  />
                  <button
                    onClick={handlePrevImage}
                    type="button"
                    className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[12px] text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {currentImageIndex + 1} / {galleryImages.length}
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    className="border-b border-black/10 pb-0.5 text-[12px] text-[#0A0A0A]/60 transition-colors hover:border-black/45 hover:text-[#0A0A0A]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    View fullscreen
                  </button>
                </div>
              </div>
            </section>

            <section className="border border-black/10 p-5 md:p-6">
              <h3 className="text-[26px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                Order Summary
              </h3>

              <div className="mt-5 space-y-3 border-b border-black/10 pb-4 text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Volume I x{form.quantity}</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryProduct, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Shipping</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryShipping, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Fulfillment</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryFulfillment, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Handling</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryHandling, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Tax</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryTax, displayCurrency)}</span>
                </div>
                {saleActive && summaryDiscount > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#0A0A0A]/70">Discount</span>
                    <span className="text-[#7A1E1E]">-{formatMoney(summaryDiscount, displayCurrency)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-[13px] tracking-[1.3px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total
                </span>
                <strong className="text-[30px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                  {formatMoney(summaryTotal, displayCurrency)}
                </strong>
              </div>
            </section>
          </aside>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative flex h-full max-h-screen w-full max-w-5xl flex-col items-center justify-center bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <img
              src={galleryImages[currentImageIndex].src}
              alt={galleryImages[currentImageIndex].alt}
              className="max-h-full max-w-full object-contain"
            />

            <button
              onClick={handlePrevImage}
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              aria-label="Previous image"
              type="button"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={handleNextImage}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              aria-label="Next image"
              type="button"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[14px] text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PurchasePage;
