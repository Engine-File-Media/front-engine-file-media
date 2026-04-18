import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { capturePaypalOrder } from '../../api/payments';
import {
  clearPurchaseSession,
  getPurchaseState,
  resolveIdempotencyKey,
  setPurchaseResultStatus,
} from '../../utils/storage';
import type { ApiError } from '../../api/types';

const hashPayload = (payload: unknown) => JSON.stringify(payload);

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
        setPurchaseResultStatus('error');
        setStatus('error');
        setMessage('Missing PayPal order reference. Please restart the checkout flow.');
        return;
      }

      try {
        const luluPayload = {
          ...(stored?.contactEmail ? { contactEmail: stored.contactEmail } : {}),
          ...(stored?.phoneE164 ? { phoneNumber: stored.phoneE164 } : {}),
        };

        const capturePayload = {
          orderId: stored?.orderId,
          ...(Object.keys(luluPayload).length > 0 ? { lulu: luluPayload } : {}),
        };
        const capturePayloadHash = hashPayload({
          paypalOrderId,
          payload: capturePayload,
        });
        const idempotencyKey = resolveIdempotencyKey('capture', capturePayloadHash, paypalOrderId);

        const response = await capturePaypalOrder(paypalOrderId, capturePayload, {
          idempotencyKey,
        });
        setPurchaseResultStatus('captured');
        setStatus('success');
        setMessage(
          `Payment captured. Order ${response.order.id} is now ${response.order.status}.`,
        );
      } catch (error) {
        const apiError = error as ApiError;
        setPurchaseResultStatus('error');
        setStatus('error');

        if (apiError.status === 410) {
          clearPurchaseSession();
          setMessage('Purchase session expired. Please return to Volume I and start again.');
          return;
        }

        if (apiError.status === 401) {
          setMessage('Session is invalid for capture. Please restart purchase from Volume I.');
          return;
        }

        if (apiError.status === 409) {
          setMessage('Capture conflict detected. Wait a moment and retry from this page once.');
          return;
        }

        if (apiError.status === 400) {
          setMessage('Capture request is invalid. Please restart the purchase flow.');
          return;
        }

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
            to="/volume-i"
            className="mt-7 inline-flex items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Back to Volume I
          </Link>
        )}
      </section>
    </main>
  );
}

export default PurchaseReturnPage;
