import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useMemo, type ReactNode } from 'react';
import type {
  CheckoutFundingPriority,
  CheckoutFundingSource,
  CheckoutResponse,
  QuoteResponse,
} from '../../api/types';
import { DEFAULT_CHECKOUT_FUNDING_PRIORITY, isCheckoutFundingSource } from '../../api/types';

type PurchasePaymentActionProps = {
  quote: QuoteResponse | null;
  quoteFingerprint: string;
  lastQuotedFingerprint: string | null;
  isSessionBootstrapping: boolean;
  isPricingLoading: boolean;
  isCheckoutLoading: boolean;
  isQuoteLoading: boolean;
  captchaToken: string;
  captchaError: string;
  isCaptchaRequired: boolean;
  captchaNode: ReactNode;
  paypalClientId: string;
  fundingPriority: CheckoutFundingPriority;
  createCheckoutOrder: (fundingSource?: CheckoutFundingSource) => Promise<CheckoutResponse | null>;
};

const fundingLabels: Record<CheckoutFundingSource, string> = {
  card: 'Card',
  paylater: 'Pay Later',
  paypal: 'PayPal',
};

const fundingBadges: Record<CheckoutFundingSource, string> = {
  card: 'Card',
  paylater: 'Pay Later',
  paypal: 'Wallet',
};

const dedupeFundingPriority = (priority: CheckoutFundingPriority) => {
  const orderedFundingSources: CheckoutFundingSource[] = [];

  priority.forEach((source) => {
    if (isCheckoutFundingSource(source) && !orderedFundingSources.includes(source)) {
      orderedFundingSources.push(source);
    }
  });

  return orderedFundingSources.length > 0 ? orderedFundingSources : DEFAULT_CHECKOUT_FUNDING_PRIORITY;
};

function PurchasePaymentAction({
  quote,
  quoteFingerprint,
  lastQuotedFingerprint,
  isSessionBootstrapping,
  isPricingLoading,
  isCheckoutLoading,
  isQuoteLoading,
  captchaToken,
  captchaError,
  isCaptchaRequired,
  captchaNode,
  paypalClientId,
  fundingPriority,
  createCheckoutOrder,
}: PurchasePaymentActionProps) {
  const orderedFundingSources = useMemo(() => dedupeFundingPriority(fundingPriority), [fundingPriority]);

  const scriptOptions = useMemo(
    () => ({
      clientId: paypalClientId,
      components: 'buttons',
      currency: quote?.currency ?? 'USD',
      intent: 'capture',
      dataPageType: 'product-details',
      dataSdkIntegrationSource: 'developer-studio',
      ...(orderedFundingSources.some((source) => source !== 'paypal')
        ? { enableFunding: orderedFundingSources.filter((source) => source !== 'paypal') }
        : {}),
    }),
    [orderedFundingSources, paypalClientId, quote?.currency],
  );

  return (
    <section className="border border-black/10 p-5 md:p-7">
      <h2
        className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
        style={{ fontFamily: 'Crimson Text, serif' }}
      >
        Payment
      </h2>

        <div className="mt-5 space-y-4">

        <div className="border border-black/10 px-4 py-3">
          <p className="text-[14px] leading-[1.4] text-[#0A0A0A]/70" style={{ fontFamily: 'Crimson Text, serif' }}>
            Choose how you want to pay. The checkout opens in PayPal and the approval return stays on this site.
          </p>
          {quote && (
            <p className="mt-2 text-[13px] leading-[1.4] text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              Quote ID: {quote.quoteId}
            </p>
          )}
          {quote && lastQuotedFingerprint !== quoteFingerprint && (
            <p className="mt-2 text-[13px] leading-[1.4] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Form data changed after quote. Checkout will recalculate totals before creating the order.
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

        {paypalClientId ? (
          <PayPalScriptProvider options={scriptOptions}>
            <div className="space-y-3">
              {orderedFundingSources.map((fundingSource) => {
                const buttonColor = fundingSource === 'paypal' ? 'gold' : fundingSource === 'card' ? 'black' : 'blue';

                return (
                  <div key={fundingSource} className="border border-black/10 bg-[#FBFBFA] p-3">
                  <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-2">
                    <div>
                      <p className="text-[15px] text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                        {fundingLabels[fundingSource]}
                      </p>
                      <p className="text-[11px] tracking-[1.2px] text-[#0A0A0A]/55 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {fundingSource === 'paypal' ? 'Wallet checkout' : 'Alternative funding option'}
                      </p>
                    </div>
                    <span className="rounded bg-[#FFC439] px-2 py-1 text-[11px] font-semibold text-[#111]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {fundingBadges[fundingSource]}
                    </span>
                  </div>

                  <div className="mt-3">
                    <PayPalButtons
                      fundingSource={fundingSource}
                      forceReRender={[quote?.quoteId ?? '', quote?.currency ?? '', fundingSource, paypalClientId]}
                      disabled={
                        isSessionBootstrapping ||
                        isPricingLoading ||
                        isCheckoutLoading ||
                        isQuoteLoading ||
                        (isCaptchaRequired && !captchaToken)
                      }
                      style={{
                        shape: 'rect',
                        layout: 'vertical',
                        tagline: false,
                        color: buttonColor,
                      }}
                      createOrder={async () => {
                        const checkout = await createCheckoutOrder(fundingSource);

                        if (!checkout?.paypalOrderId) {
                          throw new Error('Could not create PayPal order.');
                        }

                        return checkout.paypalOrderId;
                      }}
                      onApprove={async (data) => {
                        const paypalOrderId = data.orderID;

                        if (!paypalOrderId) {
                          window.location.assign('/checkout/cancel');
                          return;
                        }

                        window.location.assign(`/checkout/success?token=${encodeURIComponent(paypalOrderId)}`);
                      }}
                      onCancel={() => {
                        window.location.assign('/checkout/cancel');
                      }}
                      onError={() => {
                        window.location.assign('/checkout/cancel');
                      }}
                    >
                      <div className="border border-black/10 bg-white px-4 py-3 text-[12px] leading-[1.4] text-[#0A0A0A]/70" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {fundingSource === 'card'
                          ? 'Card checkout is unavailable in this browser or account configuration.'
                          : fundingSource === 'paylater'
                            ? 'Pay Later checkout is unavailable right now.'
                            : 'PayPal checkout is unavailable right now.'}
                      </div>
                    </PayPalButtons>
                  </div>
                </div>
                );
              })}
            </div>
          </PayPalScriptProvider>
        ) : (
          <div className="border border-black/10 bg-[#F8F8F6] px-4 py-3">
            <p className="text-[13px] leading-[1.4] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
              PayPal client id is missing. Set VITE_PAYPAL_CLIENT_ID to render Smart Buttons.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PurchasePaymentAction;
