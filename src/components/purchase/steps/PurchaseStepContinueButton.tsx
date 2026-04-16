type PurchaseStepContinueButtonProps = {
  label: string;
  disabled: boolean;
  onContinue: () => void;
};

function PurchaseStepContinueButton({ label, disabled, onContinue }: PurchaseStepContinueButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => {
          void onContinue();
        }}
        disabled={disabled}
        className="inline-flex items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {label}
      </button>
    </div>
  );
}

export default PurchaseStepContinueButton;