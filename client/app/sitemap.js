import { SITE, ROUTES } from "@/lib/constants/site";
import { getProjects } from "@/lib/content";

// Rebuilt on every request, so a project you add in the admin shows up without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const pages = ROUTES.map((r) => ({
    url: `${SITE.url}${r.path === "/" ? "" : r.path}`,
    changeFrequency: r.path === "/" ? "weekly" : "monthly",
    priority: r.path === "/" ? 1 : 0.7,
  }));

  const { data } = await getProjects();
  const projects = (data?.projects ?? [])
    .filter((p) => typeof p?.slug === "string" && /^[a-z0-9-]+$/i.test(p.slug))
    .map((p) => ({
      url: `${SITE.url}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...pages, ...projects];
}