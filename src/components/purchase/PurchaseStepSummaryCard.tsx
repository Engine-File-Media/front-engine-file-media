type PurchaseStepSummaryCardProps = {
  title: string;
  lines: string[];
  onEdit: () => void;
};

function PurchaseStepSummaryCard({ title, lines, onEdit }: PurchaseStepSummaryCardProps) {
  return (
    <section className="border border-black/10 bg-[#FAFAFA] p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-3">
        <h3 className="text-[22px] leading-none text-[#0A0A0A] md:text-[24px]" style={{ fontFamily: 'Crimson Text, serif' }}>
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center border border-black/20 bg-white px-3 py-1 text-[11px] font-semibold tracking-[1.2px] text-[#0A0A0A] uppercase"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Edit
        </button>
      </div>

      <ul className="mt-3 space-y-1 text-[13px] leading-[1.35] text-[#0A0A0A]/75" style={{ fontFamily: 'Inter, sans-serif' }}>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

export default PurchaseStepSummaryCard;
