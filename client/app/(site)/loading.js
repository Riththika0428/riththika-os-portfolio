// Shown instantly while a public page fetches its data from the API.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-3" aria-hidden="true">
        <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
        <div className="h-10 w-72 max-w-full rounded bg-white/10 animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  );
}