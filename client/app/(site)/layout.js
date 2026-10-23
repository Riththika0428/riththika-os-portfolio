import MainLayout from "@/components/layout/MainLayout";
import { getSiteSettings } from "@/lib/content";
import { normalizeSettings } from "@/lib/siteSettings";

export default async function SiteLayout({ children }) {
  // If the API is down the site still loads, with the default sidebar text and no contact links.
  const { data } = await getSiteSettings();
  return <MainLayout settings={normalizeSettings(data)}>{children}</MainLayout>;
}