import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import SkillLevelCard from "@/components/ui/SkillLevelCard";
import { LEARNING_ITEMS } from "@/lib/data/home";

export default function LearningPanel() {
  return (
    <GlowCard className="p-6 flex flex-col gap-5 h-full">
      <SectionHeader title="Currently Learning" comment="IN_PROGRESS" />
      <div className="flex flex-col gap-3">
        {LEARNING_ITEMS.map((item) => (
          <SkillLevelCard key={item.key} skill={item} />
        ))}
      </div>
    </GlowCard>
  );
}