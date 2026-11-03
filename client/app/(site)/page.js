import HeroTerminal from "@/components/sections/home/HeroTerminal";
import HeroImagePanel from "@/components/sections/home/HeroImagePanel";
import ServicesGrid from "@/components/sections/home/ServicesGrid";
import BottomTerminal from "@/components/sections/home/BottomTerminal";
import { getHome } from "@/lib/content";

export default async function HomePage() {
  // If the API is down the Home page still shows, using the built-in text and no image.
  const { data: home } = await getHome();

  return (
    <div className="p-4 sm:p-6 lg:p-10 flex flex-col gap-6 max-w-[1280px] mx-auto">
      {/* Hero (+ 3D image when one is set) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className={home?.heroImage ? "lg:col-span-8" : "lg:col-span-12"}>
          <HeroTerminal name={home?.name} role={home?.role} tagline={home?.tagline} />
        </div>
        {home?.heroImage && (
          <div className="lg:col-span-4">
            <HeroImagePanel src={home.heroImage} alt={home.heroImageAlt} />
          </div>
        )}
      </div>

      {/* Services */}
      <ServicesGrid items={home?.highlights} />

      {/* Bottom terminal */}
      <BottomTerminal message={home?.closingMessage} />
    </div>
  );
}