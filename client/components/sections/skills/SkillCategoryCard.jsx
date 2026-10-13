import { Layout, Server, Code2, Database, Wrench, Sparkles } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

const CATEGORY_ICONS = { Layout, Server, Code2, Database, Wrench, Sparkles };

export default function SkillCategoryCard({ category }) {
  const CategoryIcon = CATEGORY_ICONS[category.icon];
  const highlight = category.highlight;

  return (
    <GlowCard
      className={`p-5 flex flex-col gap-4 transition-colors ${
        highlight ? "border-purple/40" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`size-8 rounded-control flex items-center justify-center ${
              highlight ? "bg-purple/10 text-purple" : "bg-elevated text-cyan"
            }`}
          >
            {CategoryIcon && <CategoryIcon className="size-4" strokeWidth={1.75} />}
          </div>
          <h3 className="text-text-heading text-sm font-semibold">{category.title}</h3>
        </div>
        {highlight && (
          <span className="text-[10px] font-mono uppercase tracking-[0.5px] text-purple bg-chip px-2 py-0.5 rounded-chip">
            In Progress
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {category.skills.map((skill) => (
          <span
            key={skill}
            className={`inline-flex items-center text-[12px] font-mono px-2.5 py-1.5 rounded-control transition-colors ${
              highlight
                ? "bg-purple/10 text-purple hover:bg-purple/20"
                : "bg-chip text-text-body hover:bg-chip2"
            }`}
          >
            {skill}
          </span>
        ))}
      </div>
    </GlowCard>
  );
}