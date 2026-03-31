import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clearPurchaseState } from '../../utils/storage';

function PurchaseCancelPage() {
  useEffect(() => {
    clearPurchaseState();
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 md:px-10">
      <section className="border border-black/10 bg-[#F8F8F6] p-7 md:p-10">
        <h1
          className="text-[35px] leading-[95%] text-[#0A0A0A] md:text-[42px]"
          style={{ fontFamily: 'Crimson Text, serif' }}
        >
          Payment cancelled
        </h1>

        <p
          className="mt-4 text-[17px] leading-[1.4] text-[#0A0A0A]/80"
          style={{ fontFamily: 'Crimson Text, serif' }}
        >
          The PayPal checkout was cancelled. Your quote was not charged. You can return and try again.
        </p>

        <Link
          to="/purchase"
          className="mt-7 inline-flex items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Return to checkout
        </Link>
      </section>
    </main>
  );
}

export default PurchaseCancelPage;
