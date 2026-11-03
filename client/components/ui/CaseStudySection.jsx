import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Generic case-study section wrapper: GlowCard + SectionHeader + content.
 * Reused for every section (Overview, Problem, Goal, Solution, etc.) so
 * the case-study page stays visually consistent without repeating markup.
 */
export default function CaseStudySection({ title, comment, children }) {
  return (
    <GlowCard className="p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
      <SectionHeader title={title} comment={comment} />
      {children}
    </GlowCard>
  );
}