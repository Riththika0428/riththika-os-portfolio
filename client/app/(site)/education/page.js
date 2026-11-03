import PageHeader from "@/components/ui/PageHeader";
import TerminalWindow from "@/components/ui/TerminalWindow";
import EducationTimeline from "@/components/sections/education/EducationTimeline";
import CertificationsPanel from "@/components/sections/education/CertificationsPanel";
import ContinuousLearning from "@/components/sections/education/ContinuousLearning";
import DataError from "@/components/ui/DataError";
import { getEducation, getCertifications, getLearning } from "@/lib/content";

export const metadata = {
  title: "Education · Riththika OS",
  description: "Academic background, certifications and continuous learning for Riththika Baskaran.",
};

export default async function EducationPage() {
  const [education, certifications, learning] = await Promise.all([getEducation(), getCertifications(), getLearning()]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <div className="flex flex-col gap-3">
        <PageHeader index="04" label="EDUCATION" title="My Education" />
        <p className="text-text-body text-base max-w-xl">
          Formal study paired with hands-on training and continuous, self-directed practice.
        </p>
      </div>

      <TerminalWindow title="education.txt" shadow="terminal" bodyClassName="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8">
          {education.error || !education.data ? (
            <DataError what="education" />
          ) : (
            <EducationTimeline entries={education.data.entries} />
          )}

          {certifications.error || !certifications.data ? (
            <DataError what="certifications" />
          ) : (
            <CertificationsPanel certifications={certifications.data.certifications} />
          )}

          <ContinuousLearning intro={learning.data?.intro} tracks={learning.data?.tracks} />
        </div>
      </TerminalWindow>
    </div>
  );
}