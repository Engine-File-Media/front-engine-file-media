import bookMockupCovers from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/BOOK-MOCKUP-COVERS.webp';
import indiceImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/INDICE.webp';
import capituloAudiImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/CAPITULO AUDI.webp';
import introduccionImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/introduccion.webp';
import toyotaCelicaImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/TOYOTA-CELICA-ST205.webp';

const shippingInputClasses =
  'h-11 w-full border border-black/20 bg-white px-3 text-[14px] text-[#0A0A0A] outline-none transition-colors focus:border-black/45';

const galleryImages = [
  { src: bookMockupCovers, alt: 'Volume I - Book mockup covers' },
  { src: indiceImage, alt: 'Volume I - Indice spread' },
  { src: capituloAudiImage, alt: 'Volume I - Audi chapter spread' },
  { src: introduccionImage, alt: 'Volume I - Introduction spread' },
  { src: toyotaCelicaImage, alt: 'Volume I - Toyota Celica ST205 spread' },
];

function PurchasePage() {
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
            Complete your shipping details and review the selected magazine edition.
            This page is visual only and does not process real payments.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14 xl:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_24rem] xl:grid-cols-[minmax(0,1.15fr)_30rem]">
          <form className="space-y-9" noValidate>
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
                  USD 100.00 each
                </p>
              </div>

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
                    defaultValue="1"
                  >
                    <option value="1">1 Volume</option>
                    <option value="2">2 Volumes</option>
                    <option value="3">3 Volumes</option>
                    <option value="4">4 Volumes</option>
                    <option value="5">5 Volumes</option>
                  </select>
                </label>

                <div className="flex flex-col justify-end border border-black/10 bg-[#FAFAFA] px-4 py-3">
                  <span
                    className="text-[11px] tracking-[1.2px] text-[#0A0A0A]/60 uppercase"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Estimated total (visual)
                  </span>
                  <strong
                    className="mt-1 text-[26px] leading-none text-[#0A0A0A]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                  >
                    USD 125.00
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
                  <input id="email" name="email" type="email" className={shippingInputClasses} placeholder="you@email.com" />
                </label>

                <label className="flex flex-col gap-2" htmlFor="firstName">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    First name
                  </span>
                  <input id="firstName" name="firstName" type="text" className={shippingInputClasses} placeholder="Name" />
                </label>

                <label className="flex flex-col gap-2" htmlFor="lastName">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Last name
                  </span>
                  <input id="lastName" name="lastName" type="text" className={shippingInputClasses} placeholder="Surname" />
                </label>

                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="address1">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Address
                  </span>
                  <input id="address1" name="address1" type="text" className={shippingInputClasses} placeholder="Street and number" />
                </label>

                <label className="flex flex-col gap-2" htmlFor="city">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    City
                  </span>
                  <input id="city" name="city" type="text" className={shippingInputClasses} placeholder="City" />
                </label>

                <label className="flex flex-col gap-2" htmlFor="postalCode">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Postal code
                  </span>
                  <input id="postalCode" name="postalCode" type="text" className={shippingInputClasses} placeholder="Postal code" />
                </label>

                <label className="flex flex-col gap-2" htmlFor="country">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Country
                  </span>
                  <select id="country" name="country" className={shippingInputClasses} defaultValue="CL">
                    <option value="CL">Chile</option>
                    <option value="AR">Argentina</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                    <option value="US">United States</option>
                    <option value="ES">Spain</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2" htmlFor="phone">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Phone
                  </span>
                  <input id="phone" name="phone" type="tel" className={shippingInputClasses} placeholder="+56 ..." />
                </label>
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
                    <input type="radio" name="paymentMethod" defaultChecked className="h-4 w-4 accent-black" />
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
                </div>

                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Continue to PayPal
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
                <img
                  src={galleryImages[0].src}
                  alt={galleryImages[0].alt}
                  className="h-62 w-full border border-black/10 object-cover"
                />
                <div className="grid grid-cols-2 gap-3">
                  {galleryImages.slice(1).map((image) => (
                    <img
                      key={image.alt}
                      src={image.src}
                      alt={image.alt}
                      className="h-26 w-full border border-black/10 object-cover"
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-black/10 p-5 md:p-6">
              <h3 className="text-[26px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                Order Summary
              </h3>

              <div className="mt-5 space-y-3 border-b border-black/10 pb-4 text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Volume I x1</span>
                  <span className="text-[#0A0A0A]">USD 100.00</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Shipping</span>
                  <span className="text-[#0A0A0A]">USD 25.00</span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-[13px] tracking-[1.3px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total
                </span>
                <strong className="text-[30px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                  USD 125.00
                </strong>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default PurchasePage;


