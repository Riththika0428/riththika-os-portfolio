import EducationEntry from "@/components/sections/education/EducationEntry";


function TimelineNode({ current }) {
  return (
    <div className="relative flex items-center justify-center shrink-0">
      {current ? (
        <>
          <span className="absolute size-4 rounded-full bg-cyan/30 animate-ping" aria-hidden="true" />
          <span className="relative size-3.5 rounded-full bg-cyan shadow-glow-cyan" />
        </>
      ) : (
        <span className="size-3.5 rounded-full bg-mint shadow-glow-mint" />
      )}
    </div>
  );
}

export default function EducationTimeline({ entries = [] }) {
  return (
    <div className="relative">
      <div
        className="absolute left-[7px] top-2 bottom-2 w-px bg-border"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-8">
        {entries.map((entry) => (
          <div key={entry.key} className="relative flex gap-5">
            <div className="pt-6">
              <TimelineNode current={entry.current} />
            </div>
            <div className="flex-1 min-w-0">
              <EducationEntry entry={entry} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}