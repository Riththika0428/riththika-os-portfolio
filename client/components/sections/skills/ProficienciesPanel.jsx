import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import SkillLevelCard from "@/components/ui/SkillLevelCard";

export default function ProficienciesPanel({ proficiencies = [] }) {
  return (
    <GlowCard className="p-6 lg:p-8 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <SectionHeader title="Core Proficiencies" comment="SELF_ASSESSED" />
        <p className="text-text-muted text-xs">
          Reflects personal learning progress, not a certification or external benchmark.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proficiencies.map((skill) => (
          <SkillLevelCard key={skill.key} skill={skill} />
        ))}
      </div>
    </GlowCard>
  );
}