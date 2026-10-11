/**
 * "CORE_SUBSYSTEMS // ARCHITECTURAL CAPABILITIES"-style section label,
 * with an optional right-aligned meta string (e.g. "MODULES_READY [4/4]").
 */
export default function SectionHeader({ title, comment, meta }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span className="text-text-bright text-[13px] font-bold leading-5">{title}</span>
        {comment && (
          <span className="text-text-muted text-[11px] tracking-[0.66px] leading-[14px]">
            {`// ${comment}`}
          </span>
        )}
      </div>
      {meta && (
        <span className="text-purple text-[11px] tracking-[0.66px] uppercase leading-[14px]">
          {meta}
        </span>
      )}
    </div>
  );
}