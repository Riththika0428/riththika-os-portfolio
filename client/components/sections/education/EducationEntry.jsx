import { School, TerminalSquare } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { dateRange } from "@/lib/dates";

export default function EducationEntry({ entry }) {
     const range = dateRange(entry);
  return (
    <GlowCard className="p-6 flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-cyan text-[11px] font-mono tracking-[0.66px] bg-cyan/10 px-2 py-0.5 rounded-chip">
          {entry.tag}
        </span>
        <StatusBadge label={entry.status} color={entry.statusColor} />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-text-heading text-2xl font-semibold leading-tight">
          {entry.degree}
        </h3>
        <div className="flex items-center gap-1.5 text-text-bright text-sm">
          <School className="size-3.5" strokeWidth={1.75} />
          {entry.institution}
        </div>
      </div>

      <p className="text-text-body text-sm leading-relaxed">{entry.description}</p>
         {range && (
     <span className="text-text-muted text-xs font-mono">{range}</span>
   )}

      <div className="bg-chip/60 rounded-control p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-text-body text-[11px] font-mono tracking-[0.5px]">
          <TerminalSquare className="size-3.5 text-text-bright" strokeWidth={1.75} />
          CURRICULUM &amp; RELEVANT COURSEWORK
        </div>
        <div className="flex flex-wrap gap-2">
          {entry.subjects.map((subject) => (
            <span
              key={subject}
              className="text-[13px] font-mono bg-chip2 text-text-bright px-2 py-1 rounded-chip"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}