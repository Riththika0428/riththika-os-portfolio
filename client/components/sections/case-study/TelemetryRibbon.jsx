export default function TelemetryRibbon({ metrics }) {
  // A project without highlights simply has no ribbon.
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-elevated border border-border rounded-panel p-4 flex flex-col gap-1"
        >
          <span className="text-text-muted text-[11px] font-mono uppercase tracking-[0.5px]">
            {metric.label}
          </span>
          <span className="text-text-heading text-xl font-semibold">{metric.value}</span>
          {metric.caption && <span className="text-text-muted text-xs">{metric.caption}</span>}
        </div>
      ))}
    </div>
  );
}