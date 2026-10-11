export default function ResumeSection({ title, meta, children }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-1.5">
        <h2 className="text-[15px] font-bold uppercase tracking-wide text-neutral-900">
          {title}
        </h2>
        {meta && <span className="text-xs text-neutral-500">{meta}</span>}
      </div>
      {children}
    </section>
  );
}