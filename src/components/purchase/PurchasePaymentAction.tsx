import type { ReactNode } from 'react';
import type { QuoteResponse } from '../../api/types';

type PurchasePaymentActionProps = {
  quote: QuoteResponse | null;
  quoteFingerprint: string;
  lastQuotedFingerprint: string | null;
  isPricingLoading: boolean;
  isCheckoutLoading: boolean;
  isQuoteLoading: boolean;
  captchaToken: string;
  captchaError: string;
  isCaptchaRequired: boolean;
  captchaNode: ReactNode;
};

function PurchasePaymentAction({
  quote,
  quoteFingerprint,
  lastQuotedFingerprint,
  isPricingLoading,
  isCheckoutLoading,
  isQuoteLoading,
  captchaToken,
  captchaError,
  isCaptchaRequired,
  captchaNode,
}: PurchasePaymentActionProps) {
  return (
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

        <div className="space-y-2">
          {captchaNode}
          {isCaptchaRequired && (
            <p className="text-[12px] text-[#0A0A0A]/65" style={{ fontFamily: 'Inter, sans-serif' }}>
              Complete captcha before continuing to PayPal.
            </p>
          )}
          {captchaError && (
            <p className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {captchaError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            isPricingLoading ||
            isCheckoutLoading ||
            isQuoteLoading ||
            (isCaptchaRequired && !captchaToken)
          }
          className="inline-flex w-full items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isCheckoutLoading ? 'Redirecting...' : 'Continue to PayPal'}
        </button>
      </div>
    </section>
  );
}

export default PurchasePaymentAction;
