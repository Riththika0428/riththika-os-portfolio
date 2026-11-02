import Link from "next/link";
import { Layout, Server, PenTool, Rocket, Code2, Database, Wrench, Sparkles, ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/data/home";

const ICONS = { Layout, Server, PenTool, Rocket, Code2, Database, Wrench, Sparkles };

// Cards come from Admin → Home → Services. With none, the whole section is hidden.
export default function ServicesGrid({ items = SERVICES, heading = "My Services" }) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="services-heading" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 id="services-heading" className="text-text-heading text-2xl sm:text-3xl font-semibold">
          {heading}
        </h2>
        <span aria-hidden="true" className="h-1 w-16 rounded-full bg-purple" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((service, index) => {
          const Icon = ICONS[service.icon] ?? Sparkles;
          const Wrapper = service.href ? Link : "div";
          const wrapperProps = service.href ? { href: service.href } : {};
          return (
            <Wrapper
              key={`${service.title}-${index}`}
              {...wrapperProps}
              className="group relative overflow-hidden rounded-panel border border-border bg-card p-7 flex flex-col gap-4 min-h-60 transition-all duration-300 hover:bg-purple-dim hover:border-purple hover:shadow-glow-purple hover:-translate-y-1 focus-visible:bg-purple-dim focus-visible:border-purple outline-none"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full border-[10px] border-purple/40 transition-colors duration-300 group-hover:border-white/20"
              />
              <Icon className="size-10 text-text-heading" strokeWidth={1.5} aria-hidden="true" />
              <div className="flex flex-col gap-2">
                <h3 className="text-text-heading text-lg font-semibold">{service.title}</h3>
                {service.description && (
                  <p className="text-text-muted group-hover:text-text-heading/90 text-sm leading-6 transition-colors duration-300">
                    {service.description}
                  </p>
                )}
              </div>
              {service.href && (
                <div className="mt-auto flex items-center justify-end">
                  <span className="hidden group-hover:inline-flex group-focus-visible:inline-flex mr-3 text-sm font-medium text-text-heading">
                    View All
                  </span>
                  <span className="size-10 rounded-full border border-border group-hover:border-white/60 group-hover:bg-white/10 flex items-center justify-center text-text-heading transition-colors duration-300">
                    <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                </div>
              )}
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}