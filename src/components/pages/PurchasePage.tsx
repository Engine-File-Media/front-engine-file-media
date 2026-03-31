import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import bookMockupCovers from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/BOOK-MOCKUP-COVERS.webp';
import indiceImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/INDICE.webp';
import capituloAudiImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/CAPITULO AUDI.webp';
import introduccionImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/introduccion.webp';
import toyotaCelicaImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/TOYOTA-CELICA-ST205.webp';
import { createCheckout, createQuote, getBooksPricing } from '../../api/payments';
import type { ApiError, BookPricing, QuoteResponse } from '../../api/types';
import { savePurchaseState } from '../../utils/storage';

const shippingInputClasses =
  'h-11 w-full border border-black/20 bg-white px-3 text-[14px] text-[#0A0A0A] outline-none transition-colors focus:border-black/45';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const defaultBookId = 'volume-i';

const galleryImages = [
  { src: bookMockupCovers, alt: 'Volume I - Book mockup covers' },
  { src: indiceImage, alt: 'Volume I - Indice spread' },
  { src: capituloAudiImage, alt: 'Volume I - Audi chapter spread' },
  { src: introduccionImage, alt: 'Volume I - Introduction spread' },
  { src: toyotaCelicaImage, alt: 'Volume I - Toyota Celica ST205 spread' },
];

type FormState = {
  quantity: number;
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  shippingOption: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);

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
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    shippingOption: 'PRIORITY_MAIL',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [lastQuotedFingerprint, setLastQuotedFingerprint] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const response = await getBooksPricing();
        const match =
          response.books.find((book) => book.id === defaultBookId) ??
          response.books[0] ??
          null;
        setSelectedBook(match);
      } catch (error) {
        const parsedError = error as ApiError;
        setApiError(parsedError.message || 'Unable to load pricing.');
      } finally {
        setIsPricingLoading(false);
      }
    };

    void loadPricing();
  }, []);

  const quoteFingerprint = useMemo(
    () =>
      JSON.stringify({
        bookId: selectedBook?.id ?? defaultBookId,
        quantity: form.quantity,
        email: form.email.trim().toLowerCase(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        phone: form.phone.trim(),
        line1: form.address1.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        postalCode: form.postalCode.trim(),
        country: form.country,
        shippingOption: form.shippingOption,
      }),
    [form, selectedBook?.id],
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
  const summaryTax = quote?.costs.tax ?? 0;
  const summaryTotal = quote?.costs.total ?? fallbackProduct;
  const summaryDiscount = saleActive ? Math.max(unitBasePrice - unitEffectivePrice, 0) * form.quantity : 0;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
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

    if (!form.country.trim()) {
      nextErrors.country = 'Country is required.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone is required.';
    }

    if (form.quantity <= 0) {
      nextErrors.quantity = 'Quantity must be at least 1.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const requestQuote = async () => {
    if (!validateForm()) {
      return null;
    }

    setApiError('');
    setNotice('');
    setIsQuoteLoading(true);

    try {
      const trimmedState = form.state.trim();
      const quoteResponse = await createQuote({
        bookId: selectedBook?.id ?? defaultBookId,
        address: {
          line1: form.address1.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country,
          ...(trimmedState ? { state: trimmedState.toUpperCase() } : {}),
        },
        phone: form.phone.trim(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        quantity: form.quantity,
        shippingOption: form.shippingOption,
        currency: displayCurrency,
      });

      setQuote(quoteResponse);
      setLastQuotedFingerprint(quoteFingerprint);
      setNotice('Quote generated successfully. You can continue to PayPal.');
      return quoteResponse;
    } catch (error) {
      const parsedError = error as ApiError;
      setApiError(parsedError.message || 'Unable to calculate quote.');
      return null;
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleQuoteSubmit = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    await requestQuote();
  };

  const handleCheckoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCheckoutLoading) {
      return;
    }

    setApiError('');
    setNotice('');

    let activeQuote = quote;
    if (!activeQuote || lastQuotedFingerprint !== quoteFingerprint) {
      activeQuote = await requestQuote();
    }

    if (!activeQuote) {
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const checkout = await createCheckout(activeQuote.quoteId);
      savePurchaseState({
        quoteId: activeQuote.quoteId,
        orderId: checkout.orderId,
        paypalOrderId: checkout.paypalOrderId,
      });
      window.location.assign(checkout.approveUrl);
    } catch (error) {
      const parsedError = error as ApiError;
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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_24rem] xl:grid-cols-[minmax(0,1.15fr)_30rem]">
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
                    Quantity of volumes
                  </span>
                  <select
                    id="volumeQty"
                    name="volumeQty"
                    className={shippingInputClasses}
                    value={String(form.quantity)}
                    onChange={(event) => updateField('quantity', Number(event.target.value))}
                  >
                    <option value="1">1 Volume</option>
                    <option value="2">2 Volumes</option>
                    <option value="3">3 Volumes</option>
                    <option value="4">4 Volumes</option>
                    <option value="5">5 Volumes</option>
                  </select>
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

                <label className="flex flex-col gap-2" htmlFor="city">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    City
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
                    State / Province
                  </span>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="CA"
                    value={form.state}
                    onChange={(event) => updateField('state', event.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-2" htmlFor="postalCode">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Postal code
                  </span>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="Postal code"
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
                  <select
                    id="country"
                    name="country"
                    className={shippingInputClasses}
                    value={form.country}
                    onChange={(event) => updateField('country', event.target.value)}
                  >
                    <option value="CL">Chile</option>
                    <option value="AR">Argentina</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                    <option value="US">United States</option>
                    <option value="ES">Spain</option>
                  </select>
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
                    placeholder="+1 305 555 0123"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
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
                  >
                    <option value="PRIORITY_MAIL">PRIORITY_MAIL</option>
                    <option value="MAIL">MAIL</option>
                    <option value="EXPRESS">EXPRESS</option>
                  </select>
                </label>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleQuoteSubmit}
                  disabled={isQuoteLoading || isCheckoutLoading || isPricingLoading}
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

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
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
                    className="h-62 w-full cursor-pointer object-cover transition-opacity hover:opacity-95"
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
