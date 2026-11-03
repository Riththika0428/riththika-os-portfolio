import { notFound } from "next/navigation";
import { getProject, normalizeProject } from "@/lib/content";
import DataError from "@/components/ui/DataError";
import CaseStudyHero from "@/components/sections/case-study/CaseStudyHero";
import TelemetryRibbon from "@/components/sections/case-study/TelemetryRibbon";
import BentoOverview from "@/components/sections/case-study/BentoOverview";
import CaseStudyContent from "@/components/sections/case-study/CaseStudyContent";
import FinalCTA from "@/components/sections/case-study/FinalCTA";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data } = await getProject(slug);
  if (!data?.project) return { title: "Project not found · Riththika OS" };
  return {
    title: `${data.project.title} · Riththika OS`,
    description: data.project.description,
  };
}

export default async function ProjectCaseStudyPage({ params }) {
  const { slug } = await params;
  const { data, error, status } = await getProject(slug);

  if (status === 404) notFound();
  if (error || !data?.project) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1000px] mx-auto">
        <DataError what="this project" />
      </div>
    );
  }

  const project = normalizeProject(data.project);

  return (
    <div className="p-4 sm:p-6 lg:p-10 flex flex-col gap-8 max-w-[1000px] mx-auto">
      <CaseStudyHero project={project} />
      <TelemetryRibbon metrics={project.caseStudy.metrics} />
      <BentoOverview project={project} />
      <CaseStudyContent project={project} />
      <FinalCTA project={project} />
    </div>
  );
}