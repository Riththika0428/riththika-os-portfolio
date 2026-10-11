import { AlertTriangle, Target, Lightbulb } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";

const SECTIONS = [
  { key: "problem", icon: AlertTriangle, iconColor: "text-danger", eyebrow: "01 // PROBLEM IDENTIFICATION", tag: "Bottleneck", tagColor: "text-danger" },
  { key: "goal", icon: Target, iconColor: "text-cyan", eyebrow: "02 // TARGET OUTCOME", tag: "Target", tagColor: "text-cyan" },
  { key: "solution", icon: Lightbulb, iconColor: "text-mint", eyebrow: "03 // IMPLEMENTED APPROACH", tag: "Delivered", tagColor: "text-mint" },
];

const TITLES = { problem: "The Problem", goal: "The Goal", solution: "The Solution" };

export default function BentoOverview({ project }) {
  const cs = project.caseStudy;
  const visible = SECTIONS.filter((section) => cs[section.key]);
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
     {visible.map((section) => {
        const Icon = section.icon;
        return (
          <GlowCard key={section.key} className="p-6 flex flex-col gap-4">
            <div className="size-10 rounded-control bg-elevated flex items-center justify-center">
              <Icon className={`size-5 ${section.iconColor}`} strokeWidth={1.75} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-[11px] font-mono uppercase tracking-[0.5px]">
                {section.eyebrow}
              </span>
              <h3 className="text-text-heading text-lg font-semibold">
                {TITLES[section.key]}
              </h3>
            </div>
            <p className="text-text-body text-sm leading-relaxed flex-1">
              {cs[section.key]}
            </p>
            <span
              className={`inline-flex w-fit items-center gap-1.5 bg-chip text-[11px] font-mono uppercase tracking-[0.5px] px-2 py-1 rounded-chip ${section.tagColor}`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {section.tag}
            </span>
          </GlowCard>
        );
      })}
    </div>
  );
}