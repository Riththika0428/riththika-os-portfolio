import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import GithubIcon from "@/components/ui/icons/GithubIcon";
import LinkedinIcon from "@/components/ui/icons/LinkedinIcon";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { DEFAULT_SITE_SETTINGS, contactMethods } from "@/lib/siteSettings";

const ICONS = { Mail, Phone, MapPin, Github: GithubIcon, Linkedin: LinkedinIcon };

export default function ContactInfoPanel({ settings = DEFAULT_SITE_SETTINGS }) {
  const methods = contactMethods(settings);

  return (
    <GlowCard className="p-6 flex flex-col gap-5 h-full">
      <SectionHeader title="Contact Info" comment="DIRECT_CHANNELS" />

      {methods.length === 0 && (
        <p className="text-text-body text-sm">Contact details are coming soon. For now, please use the form.</p>
      )}

      <div className="flex flex-col gap-2">
        {methods.map((method) => {
          const Icon = ICONS[method.icon];
          const content = (
            <>
              <div className="size-9 rounded-control bg-elevated flex items-center justify-center text-cyan shrink-0">
                <Icon className="size-4" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-text-muted text-[11px] font-mono uppercase tracking-[0.5px]">
                  {method.label}
                </span>
                <span className="text-text-heading text-sm truncate">{method.value}</span>
              </div>
              {method.href && (
                <ArrowUpRight
                  className="size-3.5 text-text-muted shrink-0"
                  strokeWidth={1.75}
                />
              )}
            </>
          );

          return method.href ? (
            <a
              key={method.key}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-control hover:bg-elevated transition-colors"
            >
              {content}
            </a>
          ) : (
            <div key={method.key} className="flex items-center gap-3 px-3 py-2.5">
              {content}
            </div>
          );
        })}
      </div>
    </GlowCard>
  );
}