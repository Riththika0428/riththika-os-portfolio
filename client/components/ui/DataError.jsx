export default function DataError({ what = "content" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 border border-dashed border-border rounded-panel text-text-muted">
      <p className="text-sm font-mono">Couldn&apos;t load {what}.</p>
      <p className="text-xs">The API may be offline. Please try again in a moment.</p>
    </div>
  );
}