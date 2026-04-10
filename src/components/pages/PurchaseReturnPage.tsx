import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { capturePaypalOrder } from '../../api/payments';
import { clearPurchaseState, getPurchaseState } from '../../utils/storage';
import type { ApiError } from '../../api/types';

function PurchaseReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your payment...');
  const didCapture = useRef(false);

  useEffect(() => {
    if (didCapture.current) {
      return;
    }
    didCapture.current = true;

    const runCapture = async () => {
      const token = searchParams.get('token');
      const stored = getPurchaseState();
      const paypalOrderId = token || stored?.paypalOrderId;

      if (!paypalOrderId) {
        setStatus('error');
        setMessage('Missing PayPal order reference. Please restart the checkout flow.');
        return;
      }

      try {
        const luluPayload = {
          ...(stored?.contactEmail ? { contactEmail: stored.contactEmail } : {}),
          ...(stored?.phoneE164 ? { phoneNumber: stored.phoneE164 } : {}),
        };

        const response = await capturePaypalOrder(paypalOrderId, {
          orderId: stored?.orderId,
          ...(Object.keys(luluPayload).length > 0 ? { lulu: luluPayload } : {}),
        });
        clearPurchaseState();
        setStatus('success');
        setMessage(
          `Payment captured. Order ${response.order.id} is now ${response.order.status}.`,
        );
      } catch (error) {
        const apiError = error as ApiError;
        setStatus('error');
        setMessage(apiError.message || 'Unable to capture PayPal payment.');
      }
    };

    runCapture();
  }, [searchParams]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 md:px-10">
      <section className="border border-black/10 bg-[#F8F8F6] p-7 md:p-10">
        <h1
          className="text-[35px] leading-[95%] text-[#0A0A0A] md:text-[42px]"
          style={{ fontFamily: 'Crimson Text, serif' }}
        >
          Purchase confirmation
        </h1>

        <p
          className="mt-4 text-[17px] leading-[1.4] text-[#0A0A0A]/80"
          style={{ fontFamily: 'Crimson Text, serif' }}
        >
          {status === 'loading'
            ? 'Please wait while we finalize your order with PayPal and Lulu.'
            : message}
        </p>

        {status !== 'loading' && (
          <Link
            to="/purchase"
            className="mt-7 inline-flex items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Back to purchase page
          </Link>
        )}
      </section>
    </main>
  );
}

export default PurchaseReturnPage;
