import GlowCard from "@/components/ui/GlowCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import { SITE } from "@/lib/constants/site";
import { getSiteSettings } from "@/lib/content";
import { normalizeSettings } from "@/lib/siteSettings";

// Role, badge and availability come from Admin → Contact & profile, the same place as the sidebar.
export default async function AboutProfileCard() {
  const { data } = await getSiteSettings();
  const settings = normalizeSettings(data);

  return (
    <GlowCard className="p-6 flex flex-col items-center text-center gap-3 h-full justify-center">
      <Avatar src={SITE.avatar} name={SITE.author} size={96} className="text-2xl" zoomable />
      <div className="flex flex-col gap-0.5">
        <span className="text-text-heading text-lg font-semibold">{SITE.author}</span>
        <span className="text-text-body text-sm">{settings.role}</span>
      </div>
      {settings.badge && (
        <span className="bg-chip2 text-text-body text-[11px] tracking-[0.66px] px-2 py-1 rounded-chip">
          {settings.badge}
        </span>
      )}
      {settings.available && settings.availabilityText && (
        <div className="bg-chip flex items-center justify-center gap-1 px-3 py-1.5 rounded-control">
          <StatusBadge label={settings.availabilityText} color="mint" />
        </div>
      )}
    </GlowCard>
  );
}