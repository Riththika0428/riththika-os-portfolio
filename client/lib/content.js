import { apiGet } from "@/lib/api";

export const getProjects = () => apiGet("/projects");
export const getProject = (slug) => apiGet(`/projects/${encodeURIComponent(slug)}`);
export const getSkills = () => apiGet("/skills");
export const getEducation = () => apiGet("/education");
export const getAbout = () => apiGet("/about");
export const getResume = () => apiGet("/resume");
export const getHome = () => apiGet("/home");
export const getSiteSettings = () => apiGet("/site-settings");
export const getLearning = () => apiGet("/learning");

// Projects created in the dashboard may have no caseStudy at all.
// Fill safe defaults so components never crash on undefined.
export function normalizeProject(p) {
  const cs = p.caseStudy ?? {};
  return {
    ...p,
    stack: p.stack ?? [],
    caseStudy: {
      metrics: cs.metrics ?? [],
      overview: cs.overview ?? "",
      problem: cs.problem ?? "",
      goal: cs.goal ?? "",
      solution: cs.solution ?? "",
      features: cs.features ?? [],
      techStack: {
        frontend: cs.techStack?.frontend ?? [],
        backend: cs.techStack?.backend ?? [],
        database: cs.techStack?.database ?? [],
      },
      architecture: {
        summary: cs.architecture?.summary ?? "",
        layers: cs.architecture?.layers ?? [],
      },
      process: cs.process ?? [],
      challenges: cs.challenges ?? [],
      results: cs.results ?? [],
      screenshots: cs.screenshots ?? [],
    },
  };
}
export const getCertifications = () => apiGet("/certifications");