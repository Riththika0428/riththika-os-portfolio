import PageHeader from "@/components/ui/PageHeader";
import ProjectsGrid from "@/components/sections/projects/ProjectsGrid";
import DataError from "@/components/ui/DataError";
import { getProjects } from "@/lib/content";

export const metadata = {
  title: "Projects · Riththika OS",
  description: "Real-world full-stack projects built by Riththika Baskaran.",
};

export default async function ProjectsPage() {
  const { data, error } = await getProjects();

  return (
    <div className="p-4 sm:p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <div className="flex flex-col gap-3">
        <PageHeader index="02" label="PROJECTS" title="My Projects" />
        <p className="text-text-body text-base max-w-xl">
          Selected applications built to solve practical problems.
        </p>
      </div>

      {error || !data ? (
        <DataError what="projects" />
      ) : (
        <ProjectsGrid projects={data.projects} categories={data.categories} />
      )}
    </div>
  );
}