import clsx from "clsx";
import TechIcon from "@/components/ui/icons/TechIcon";
import { TECH_ICON_MAP, FALLBACK_ICON_MAP } from "@/lib/constants/tech-icons";

const LEVEL_STYLES = {
  5: { label: "Confident", classes: "bg-mint/10 text-mint" },
  4: { label: "Comfortable", classes: "bg-cyan/10 text-cyan" },
  3: { label: "Familiar", classes: "bg-blue/10 text-blue" },
  2: { label: "Learning", classes: "bg-purple/10 text-purple" },
  1: { label: "Just Started", classes: "bg-chip text-text-muted" },
};

/**
 * Compact "skill status" card: icon + name + a colored level pill.
 * No meter, no percentage — used on both the Skills page (Core
 * Proficiencies) and the Home page (Currently Learning).
 */
export default function SkillLevelCard({ skill }) {
  const style = LEVEL_STYLES[skill.level] ?? LEVEL_STYLES[3];

  return (
    <div className="flex items-center justify-between gap-3 bg-elevated border border-border rounded-control px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-8 rounded-control bg-card flex items-center justify-center shrink-0">
          <TechIcon
            icon={TECH_ICON_MAP[skill.label]}
            FallbackIcon={FALLBACK_ICON_MAP[skill.label]}
            className="size-4"
          />
        </div>
        <span className="text-text-heading text-sm font-medium truncate">{skill.label}</span>
      </div>

      <span
        className={clsx(
          "text-[11px] font-mono px-2.5 py-1 rounded-chip shrink-0",
          style.classes
        )}
      >
        {style.label}
      </span>
    </div>
  );
}