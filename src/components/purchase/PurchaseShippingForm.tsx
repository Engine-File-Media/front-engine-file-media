import type { Dispatch, SetStateAction } from 'react';
import type { AddressMetadataResponse, Country, ShippingOption, Subdivision } from '../../api/types';
import type { FieldErrors, FormState } from './purchaseTypes';

type PurchaseShippingFormProps = {
  form: FormState;
  errors: FieldErrors;
  shippingInputClasses: string;
  addressMetadata: AddressMetadataResponse | null;
  isMetadataLoading: boolean;
  selectedCountry: Country | null;
  selectedCountryLabel: string;
  requiresStateCode: boolean;
  requiresRecipientTaxId: boolean;
  selectedSubdivisionCatalog: Subdivision[];
  filteredCountries: Country[];
  countryQuery: string;
  isCountryDropdownOpen: boolean;
  setCountryQuery: Dispatch<SetStateAction<string>>;
  setIsCountryDropdownOpen: Dispatch<SetStateAction<boolean>>;
  phoneDialCode: string;
  phonePlaceholder: string;
  phoneMaxLength: number;
  normalizedPhoneE164: string;
  luluPhoneCandidate: string;
  shippingOptions: ShippingOption[];
  isShippingOptionsLoading: boolean;
  isPricingLoading: boolean;
  isQuoteLoading: boolean;
  isCheckoutLoading: boolean;
  onUpdateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onHandleCountryChange: (newCountryCode: string) => Promise<void>;
  onRequestQuote: () => Promise<unknown>;
  formatRecipientTaxIdForInput: (countryCode: string, value: string) => string;
  getRecipientTaxIdUxHint: (countryCode: string) => string;
  formatPhoneForInput: (value: string, country: string) => string;
};

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);

function PurchaseShippingForm({
  form,
  errors,
  shippingInputClasses,
  addressMetadata,
  isMetadataLoading,
  selectedCountry,
  selectedCountryLabel,
  requiresStateCode,
  requiresRecipientTaxId,
  selectedSubdivisionCatalog,
  filteredCountries,
  countryQuery,
  isCountryDropdownOpen,
  setCountryQuery,
  setIsCountryDropdownOpen,
  phoneDialCode,
  phonePlaceholder,
  phoneMaxLength,
  normalizedPhoneE164,
  luluPhoneCandidate,
  shippingOptions,
  isShippingOptionsLoading,
  isPricingLoading,
  isQuoteLoading,
  isCheckoutLoading,
  onUpdateField,
  onHandleCountryChange,
  onRequestQuote,
  formatRecipientTaxIdForInput,
  getRecipientTaxIdUxHint,
  formatPhoneForInput,
}: PurchaseShippingFormProps) {
  return (
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
            onChange={(event) => onUpdateField('email', event.target.value)}
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
            onChange={(event) => onUpdateField('firstName', event.target.value)}
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
            onChange={(event) => onUpdateField('lastName', event.target.value)}
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
            onChange={(event) => onUpdateField('address1', event.target.value)}
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
            onChange={(event) => onUpdateField('address2', event.target.value)}
          />
          <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
            For additional address details such as apartment or office number.
          </span>
        </label>

        <label className="flex items-center gap-3 border border-black/20 bg-[#FAFAFA] px-3 py-2" htmlFor="isBusiness">
          <input
            id="isBusiness"
            name="isBusiness"
            type="checkbox"
            checked={form.isBusiness}
            onChange={(event) => onUpdateField('isBusiness', event.target.checked)}
            className="h-4 w-4 accent-black"
          />
          <span className="text-[12px] font-semibold tracking-[1.1px] text-[#0A0A0A]/80 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            Business address
          </span>
        </label>

        <label className="flex items-center gap-3 border border-black/20 bg-[#FAFAFA] px-3 py-2" htmlFor="isPostbox">
          <input
            id="isPostbox"
            name="isPostbox"
            type="checkbox"
            checked={form.isPostbox}
            onChange={(event) => onUpdateField('isPostbox', event.target.checked)}
            className="h-4 w-4 accent-black"
          />
          <span className="text-[12px] font-semibold tracking-[1.1px] text-[#0A0A0A]/80 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            PO Box address
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
                onUpdateField('recipientTaxId', formatRecipientTaxIdForInput(form.country, event.target.value))
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
            onChange={(event) => onUpdateField('city', event.target.value)}
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
              onChange={(event) => onUpdateField('state', event.target.value)}
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
              onChange={(event) => onUpdateField('state', event.target.value.toUpperCase())}
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
            onChange={(event) => onUpdateField('postalCode', event.target.value)}
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
                        void onHandleCountryChange(country.code);
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
          <div className="flex h-11 overflow-hidden border border-black/20 bg-white">
            <div
              className="inline-flex min-w-16 items-center justify-center border-r border-black/20 px-3 text-[13px] font-semibold text-[#0A0A0A]/75"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {phoneDialCode || '+'}
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="h-full w-full bg-white px-3 text-[14px] text-[#0A0A0A] outline-none"
              placeholder={phonePlaceholder}
              maxLength={phoneMaxLength}
              value={form.phone}
              onChange={(event) =>
                onUpdateField(
                  'phone',
                  formatPhoneForInput(event.target.value.replace(/^\+/, ''), form.country).slice(0, phoneMaxLength),
                )
              }
            />
          </div>
          <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
            {normalizedPhoneE164
              ? `Will be sent as ${normalizedPhoneE164} (Lulu input: ${luluPhoneCandidate || `${phoneDialCode} ...`}).`
              : `Use 8-20 chars for Lulu format. Example: ${phoneDialCode || '+'} 111 111 111`}
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
            onChange={(event) => onUpdateField('shippingOption', event.target.value)}
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
          onClick={() => {
            void onRequestQuote();
          }}
          disabled={isPricingLoading || isQuoteLoading || isCheckoutLoading || !form.shippingOption}
          className="inline-flex w-full items-center justify-center border border-black/15 bg-white px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-[#0A0A0A] uppercase disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isQuoteLoading ? 'Calculating...' : 'Calculate total with shipping'}
        </button>
      </div>
    </section>
  );
}

export default PurchaseShippingForm;
