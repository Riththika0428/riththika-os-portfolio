import PageHeader from "@/components/ui/PageHeader";
import AboutTabs from "@/components/sections/about/AboutTabs";
import AboutProfileCard from "@/components/sections/about/AboutProfileCard";
import JourneyTimeline from "@/components/sections/about/JourneyTimeline";
import DataError from "@/components/ui/DataError";
import { getAbout } from "@/lib/content";

export const metadata = {
  title: "About · Riththika OS",
  description: "About Riththika Baskaran — Full Stack Developer and BIT undergraduate.",
};

export default async function AboutPage() {
  const { data, error } = await getAbout();
  const ok = !error && data;

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <PageHeader index="01" label="ABOUT" title="About Me" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          {ok ? (
            <AboutTabs introParagraphs={data.introParagraphs} profileFields={data.profileFields} />
          ) : (
            <DataError what="about content" />
          )}
        </div>
        <div className="lg:col-span-4">
          <AboutProfileCard />
        </div>
      </div>

      {ok && <JourneyTimeline journey={data.journey} />}
    </div>
  );
}