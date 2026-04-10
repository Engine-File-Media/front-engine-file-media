type PurchaseStep = {
  key: string;
  label: string;
};

type PurchaseStepTimelineProps = {
  steps: PurchaseStep[];
  currentStepIndex: number;
  completedUntilIndex: number;
  onSelectStep: (index: number) => void;
};

function PurchaseStepTimeline({
  steps,
  currentStepIndex,
  completedUntilIndex,
  onSelectStep,
}: PurchaseStepTimelineProps) {
  return (
    <section className="border border-black/10 bg-[#FBFBFA] p-4 md:p-5">
      <ol className="grid grid-cols-1 gap-2 md:grid-cols-5 md:gap-3">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = index <= completedUntilIndex;
          const isClickable = isCurrent || isCompleted;

          return (
            <li key={step.key} className="flex min-w-0 items-center gap-2 md:gap-3">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onSelectStep(index)}
                aria-current={isCurrent ? 'step' : undefined}
                className="group flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center border text-[11px] font-semibold ${
                    isCurrent
                      ? 'border-black bg-black text-white'
                      : isCompleted
                        ? 'border-black/50 bg-white text-[#0A0A0A]'
                        : 'border-black/20 bg-white text-[#0A0A0A]/45'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {index + 1}
                </span>
                <span
                  className={`truncate text-[11px] font-semibold tracking-[1px] uppercase ${
                    isCurrent ? 'text-[#0A0A0A]' : isCompleted ? 'text-[#0A0A0A]/80' : 'text-[#0A0A0A]/45'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && <span className="hidden text-[#0A0A0A]/35 md:inline">{'->'}</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default PurchaseStepTimeline;
