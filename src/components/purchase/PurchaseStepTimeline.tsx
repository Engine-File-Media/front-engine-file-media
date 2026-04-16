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

const stepDisplayLabels: Record<string, string> = {
  order: 'Order',
  address: 'Shipping',
  contact: 'Contact',
  shipping: 'Shipping Method',
  checkout: 'Checkout',
};

const iconPathByStep: Record<string, string> = {
  order: 'M3 10h18M6 14h2m3 0h5M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z',
  address: 'M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  contact: 'M7 7h10M7 12h10m-10 5h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
  shipping: 'M5 8h14M5 12h14m-9 4h9M3 6a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.6.8l3.6 4.8a2 2 0 0 1 .4 1.2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z',
  checkout: 'M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 7 2 2 4-4m-5-9v4h4V3h-4Z',
};

function PurchaseStepTimeline({
  steps,
  currentStepIndex,
  completedUntilIndex,
  onSelectStep,
}: PurchaseStepTimelineProps) {
  return (
    <section>
      <ol className="mb-2 flex w-full items-start gap-2 sm:gap-3 md:gap-4">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = index <= completedUntilIndex;
          const isClickable = isCurrent || isCompleted;
          const isLocked = !isCurrent && !isCompleted;
          const displayLabel = stepDisplayLabels[step.key] ?? step.label;
          const iconPath = iconPathByStep[step.key] ?? iconPathByStep.checkout;

          return (
            <li key={step.key} className="relative flex min-w-0 flex-1 flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onSelectStep(index)}
                aria-current={isCurrent ? 'step' : undefined}
                className="group flex w-full flex-col items-center text-center disabled:cursor-not-allowed"
              >
                <span
                  className={`z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border lg:h-12 lg:w-12 ${
                    isCurrent
                      ? 'border-[#0A0A0A] bg-[#E8F0FF] text-[#0A0A0A]'
                      : isCompleted
                        ? 'border-[#0A0A0A] bg-[#EEF4EA] text-[#0A0A0A]'
                        : 'border-black/15 bg-[#F1F1EF] text-[#0A0A0A]/45'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12.2 9.2 16.5 19 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d={iconPath}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={`mt-2 text-[11px] font-medium leading-tight sm:text-[12px] ${
                    isLocked ? 'text-[#0A0A0A]/45' : 'text-[#0A0A0A]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {displayLabel}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={`absolute top-5 left-[calc(50%+1.5rem)] right-[-50%] hidden h-1 rounded-full md:block ${
                    index <= completedUntilIndex
                      ? 'bg-[#C8D8C0]'
                      : 'bg-[#E5E7EB]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default PurchaseStepTimeline;
