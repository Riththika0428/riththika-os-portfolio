import PageHeader from "@/components/ui/PageHeader";
import TerminalWindow from "@/components/ui/TerminalWindow";
import EducationTimeline from "@/components/sections/education/EducationTimeline";
import ContinuousLearning from "@/components/sections/education/ContinuousLearning";
import DataError from "@/components/ui/DataError";
import { getEducation } from "@/lib/content";

export const metadata = {
  title: "Education · Riththika OS",
  description: "Academic background and continuous learning for Riththika Baskaran.",
};

export default async function EducationPage() {
  const { data, error } = await getEducation();

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <div className="flex flex-col gap-3">
        <PageHeader index="04" label="EDUCATION" title="My Education" />
        <p className="text-text-body text-base max-w-xl">
          Formal study paired with hands-on training and continuous, self-directed practice.
        </p>
      </div>

      <TerminalWindow title="education.txt" shadow="terminal" bodyClassName="p-6 lg:p-8">
        <div className="flex flex-col gap-8">
          {error || !data ? (
            <DataError what="education" />
          ) : (
            <EducationTimeline entries={data.entries} />
          )}
          <ContinuousLearning />
        </div>
      </TerminalWindow>
    </div>
  );
}