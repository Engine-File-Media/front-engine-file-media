import PurchaseContactForm from '../PurchaseContactForm';
import PurchaseStepContinueButton from './PurchaseStepContinueButton';
import type { FieldErrors, FormState } from '../purchaseTypes';

type PurchaseContactStepProps = {
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
  canContinueCurrentStep: boolean;
  continueButtonLabel: string;
  onContinue: () => void;
};

function PurchaseContactStep({
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
  canContinueCurrentStep,
  continueButtonLabel,
  onContinue,
}: PurchaseContactStepProps) {
  return (
    <>
      <PurchaseContactForm
        form={form}
        errors={errors}
        shippingInputClasses={shippingInputClasses}
        phoneDialCode={phoneDialCode}
        phonePlaceholder={phonePlaceholder}
        phoneMaxLength={phoneMaxLength}
        normalizedPhoneE164={normalizedPhoneE164}
        luluPhoneCandidate={luluPhoneCandidate}
        onUpdateField={onUpdateField}
        formatPhoneForInput={formatPhoneForInput}
      />
      <PurchaseStepContinueButton label={continueButtonLabel} disabled={!canContinueCurrentStep} onContinue={onContinue} />
    </>
  );
}

export default PurchaseContactStep;