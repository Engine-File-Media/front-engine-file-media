import type { Dispatch, SetStateAction } from 'react';
import type { AddressMetadataResponse, Country, Subdivision } from '../../api/types';
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
  onUpdateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onHandleCountryChange: (newCountryCode: string) => Promise<void>;
  formatRecipientTaxIdForInput: (countryCode: string, value: string) => string;
  getRecipientTaxIdUxHint: (countryCode: string) => string;
};

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
  onUpdateField,
  onHandleCountryChange,
  formatRecipientTaxIdForInput,
  getRecipientTaxIdUxHint,
}: PurchaseShippingFormProps) {
  return (
    <section className="border border-black/10 p-5 md:p-7">
      <h2
        className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
        style={{ fontFamily: 'Crimson Text, serif' }}
      >
        Shipping Address
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
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

        
      </div>
    </section>
  );
}

export default PurchaseShippingForm;
