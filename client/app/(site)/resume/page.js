import PageHeader from "@/components/ui/PageHeader";
import TerminalWindow from "@/components/ui/TerminalWindow";
import ResumeToolbar from "@/components/sections/resume/ResumeToolbar";
import ResumeDocument from "@/components/sections/resume/ResumeDocument";
import DataError from "@/components/ui/DataError";
import { getResume, getEducation, getProjects } from "@/lib/content";

export const metadata = {
  title: "Resume · Riththika OS",
  description: "Resume of Riththika Baskaran — Full Stack Developer and BIT undergraduate.",
};

export default async function ResumePage() {
  const [resumeRes, educationRes, projectsRes] = await Promise.all([getResume(), getEducation(), getProjects()]);
  // A resume with a silently missing section would be misleading, so any failure shows the error box.
  const ok = [resumeRes, educationRes, projectsRes].every((r) => !r.error && r.data);

  let projects = [];
  if (ok) {
    const { mode, slugs } = resumeRes.data.projects;
    const all = projectsRes.data.projects ?? [];
    projects = mode === "selected" ? all.filter((p) => slugs.includes(p.slug)) : all;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <PageHeader index="05" label="RESUME" title="My Resume" />

      <TerminalWindow title="resume.pdf" shadow="terminal" bodyClassName="p-0">
        <ResumeToolbar pdfUrl={ok ? resumeRes.data.pdfUrl : ""} />
        <div className="bg-bg p-3 sm:p-6 lg:p-10">
          {ok ? (
            <ResumeDocument resume={resumeRes.data} education={educationRes.data.entries ?? []} projects={projects} />
          ) : (
            <DataError what="resume" />
          )}
        </div>
      </TerminalWindow>
    </div>
  );
}