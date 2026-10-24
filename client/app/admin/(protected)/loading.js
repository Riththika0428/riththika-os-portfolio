export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-48 rounded bg-slate-800 animate-pulse" aria-hidden="true" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-xl border border-slate-800 bg-slate-900/50 animate-pulse" aria-hidden="true" />
      ))}
    </div>
  );
}