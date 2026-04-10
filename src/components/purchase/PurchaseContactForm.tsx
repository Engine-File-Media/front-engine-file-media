import type { FieldErrors, FormState } from './purchaseTypes';

type PurchaseContactFormProps = {
  form: FormState;
  errors: FieldErrors;
  shippingInputClasses: string;
  phoneDialCode: string;
  phonePlaceholder: string;
  phoneMaxLength: number;
  normalizedPhoneE164: string;
  luluPhoneCandidate: string;
  onUpdateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  formatPhoneForInput: (value: string, country: string) => string;
};

function PurchaseContactForm({
  form,
  errors,
  shippingInputClasses,
  phoneDialCode,
  phonePlaceholder,
  phoneMaxLength,
  normalizedPhoneE164,
  luluPhoneCandidate,
  onUpdateField,
  formatPhoneForInput,
}: PurchaseContactFormProps) {
  return (
    <section className="border border-black/10 p-5 md:p-7">
      <h2
        className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
        style={{ fontFamily: 'Crimson Text, serif' }}
      >
        Contact
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

        <label className="md:col-span-2 flex flex-col gap-2" htmlFor="phone">
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
      </div>
    </section>
  );
}

export default PurchaseContactForm;
