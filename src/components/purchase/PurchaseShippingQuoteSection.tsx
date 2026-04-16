import type { ReactNode } from 'react';
import type { ShippingOption } from '../../api/types';
import type { FieldErrors } from './purchaseTypes';
import type { FormState } from './purchaseTypes';

type PurchaseShippingQuoteSectionProps = {
  form: FormState;
  shippingOptions: ShippingOption[];
  isSessionBootstrapping: boolean;
  isShippingOptionsLoading: boolean;
  isPricingLoading: boolean;
  isQuoteLoading: boolean;
  isCheckoutLoading: boolean;
  shippingInputClasses: string;
  errors: FieldErrors;
  captchaToken: string;
  captchaError: string;
  isCaptchaRequired: boolean;
  captchaNode: ReactNode;
  onUpdateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onRequestQuote: () => Promise<unknown>;
};

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);

function PurchaseShippingQuoteSection({
  form,
  shippingOptions,
  isSessionBootstrapping,
  isShippingOptionsLoading,
  isPricingLoading,
  isQuoteLoading,
  isCheckoutLoading,
  shippingInputClasses,
  errors,
  captchaToken,
  captchaError,
  isCaptchaRequired,
  captchaNode,
  onUpdateField,
  onRequestQuote,
}: PurchaseShippingQuoteSectionProps) {
  return (
    <section className="border border-black/10 p-5 md:p-7">
      <h2
        className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
        style={{ fontFamily: 'Crimson Text, serif' }}
      >
        Shipping Method
      </h2>

      <div className="mt-5">
        <label className="flex flex-col gap-2" htmlFor="shippingOption">
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
            {!isShippingOptionsLoading && shippingOptions.length > 0 && (
              <option value="">Select a shipping option</option>
            )}
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
          {errors.shippingOption && (
            <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {errors.shippingOption}
            </span>
          )}
        </label>
      </div>

      <div className="mt-5 border border-black/10 bg-[#F9F9F9] px-4 py-3">
        <p className="text-[13px] leading-[1.4] text-[#0A0A0A]/70" style={{ fontFamily: 'Inter, sans-serif' }}>
          Shipping options are loaded automatically when the address is complete. Select one option, complete captcha, then generate quote to see the full cost breakdown.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {captchaNode}
        {isCaptchaRequired && (
          <p className="text-[12px] text-[#0A0A0A]/65" style={{ fontFamily: 'Inter, sans-serif' }}>
            Complete captcha before requesting your quote.
          </p>
        )}
        {captchaError && (
          <p className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {captchaError}
          </p>
        )}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => {
            void onRequestQuote();
          }}
          disabled={
            isSessionBootstrapping ||
            isPricingLoading ||
            isQuoteLoading ||
            isCheckoutLoading ||
            !form.shippingOption ||
            (isCaptchaRequired && !captchaToken)
          }
          className="inline-flex w-full items-center justify-center border border-black/15 bg-white px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-[#0A0A0A] uppercase disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isQuoteLoading ? 'Calculating...' : 'Calculate total with shipping'}
        </button>
      </div>
    </section>
  );
}

export default PurchaseShippingQuoteSection;
