import { Infinity as InfinityIcon } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import SkillLevelCard from "@/components/ui/SkillLevelCard";
import { LEARNING_ITEMS, LEARNING_INTRO } from "@/lib/data/home";

// `intro` and `tracks` come from Admin → Learning. Without them (API down) the built-in text shows.
export default function ContinuousLearning({ intro = LEARNING_INTRO, tracks = LEARNING_ITEMS }) {
  return (
    <GlowCard className="p-6 flex flex-col gap-5 border-purple/30">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-control bg-purple/10 flex items-center justify-center text-purple shrink-0">
          <InfinityIcon className="size-4.5" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-text-heading text-lg font-semibold">Continuous Learning</h3>
          <span className="text-text-muted text-[11px] font-mono tracking-[0.5px] uppercase">
            Lifelong Sync
          </span>
        </div>
      </div>

      <p className="text-text-body text-sm leading-relaxed italic border-l-2 border-border pl-4">
        {intro}
      </p>

      {tracks.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-text-muted text-[11px] font-mono tracking-[0.5px] uppercase">
            Active Learning Tracks
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tracks.map((item, index) => (
              <SkillLevelCard key={`${item.label}-${index}`} skill={item} />
            ))}
          </div>
        </div>
      )}
    </GlowCard>
  );
}