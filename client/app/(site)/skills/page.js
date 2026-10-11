import PageHeader from "@/components/ui/PageHeader";
import TerminalWindow from "@/components/ui/TerminalWindow";
import SkillCategoryCard from "@/components/sections/skills/SkillCategoryCard";
import ProficienciesPanel from "@/components/sections/skills/ProficienciesPanel";
import DataError from "@/components/ui/DataError";
import { getSkills } from "@/lib/content";

export const metadata = {
  title: "Skills · Riththika OS",
  description: "Technical skills and current learning focus for Riththika Baskaran.",
};

export default async function SkillsPage() {
  const { data, error } = await getSkills();

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <PageHeader index="03" label="SKILLS" title="My Skills" />

      {error || !data ? (
        <DataError what="skills" />
      ) : (
        <>
          <TerminalWindow title="skills --all" shadow="terminal" bodyClassName="p-6 lg:p-8">
            <p className="font-mono text-xs text-text-muted mb-6">
              <span className="text-cyan">riththika@portfolio</span>
              <span className="text-text-muted">:~$</span> skills --all
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.categories.map((category) => (
                <SkillCategoryCard key={category.key} category={category} />
              ))}
            </div>
          </TerminalWindow>
          <ProficienciesPanel proficiencies={data.coreProficiencies} />
        </>
      )}
    </div>
  );
}