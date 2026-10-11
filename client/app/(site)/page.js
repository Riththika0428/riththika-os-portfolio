import HeroTerminal from "@/components/sections/home/HeroTerminal";
import LearningPanel from "@/components/sections/home/LearningPanel";
import QuickSkills from "@/components/sections/home/QuickSkills";
import BottomTerminal from "@/components/sections/home/BottomTerminal";

export default function HomePage() {
  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6 max-w-[1280px] mx-auto">
      {/* Hero + Currently Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <HeroTerminal />
        </div>
        <div className="lg:col-span-4">
          <LearningPanel />
        </div>
      </div>

      {/* Quick skill cards */}
      <QuickSkills />

      {/* Bottom terminal */}
      <BottomTerminal />
    </div>
  );
}