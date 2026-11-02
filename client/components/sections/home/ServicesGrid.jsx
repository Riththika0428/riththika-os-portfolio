"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Layout, Server, PenTool, Rocket, Code2, Database, Wrench, Sparkles, ArrowUpRight } from "lucide-react";
import TerminalWindow from "@/components/ui/TerminalWindow";
import TerminalCursor from "@/components/ui/TerminalCursor";
import { SERVICES } from "@/lib/data/home";

const ICONS = { Layout, Server, PenTool, Rocket, Code2, Database, Wrench, Sparkles };

const slug = (text) =>
  String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function Prompt({ children }) {
  return (
    <p>
      <span className="text-cyan">riththika@portfolio</span>
      <span className="text-text-muted">:~$</span> <span className="text-text-body">{children}</span>
    </p>
  );
}

// Cards come from Admin → Home → Services. With none, the whole section is hidden.
export default function ServicesGrid({ items = SERVICES, heading = "My Services" }) {
  const reduce = useReducedMotion();

  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="services-heading">
      <TerminalWindow title="›_ services" shadow="terminal" bodyClassName="p-5 lg:p-6 font-mono text-sm">
        <div className="flex flex-col gap-4">
          <Prompt>ls -l ~/services</Prompt>

          <h2 id="services-heading" className="text-text-heading text-base font-semibold">
            <span className="text-text-muted"># </span>
            <span>{heading}</span>
            <span className="text-text-muted"> — {items.length} {items.length === 1 ? "service" : "services"}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((service, index) => {
              const Icon = ICONS[service.icon] ?? Sparkles;
              const Wrapper = service.href ? Link : "div";
              const wrapperProps = service.href ? { href: service.href } : {};
              const num = String(index + 1).padStart(2, "0");
              return (
                <motion.div
                  key={`${service.title}-${index}`}
                  initial={reduce ? false : { opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.1, ease: "easeOut" }}
                  className="flex"
                >
                  <Wrapper
                    {...wrapperProps}
                    className="group relative w-full rounded-control border border-border bg-bg/60 p-4 flex flex-col gap-2.5 transition-all duration-200 hover:border-purple/60 hover:bg-purple/10 hover:shadow-glow-purple focus-visible:border-purple outline-none"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-text-muted">
                      <span className="truncate">
                        <span className="text-purple">{num}</span> ~/services/{slug(service.title)}
                      </span>
                      <Icon
                        className="size-5 shrink-0 text-cyan transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="text-text-heading text-[15px] font-semibold leading-snug">{service.title}</h3>

                    {service.description && (
                      <p className="text-text-muted text-[13px] leading-5">
                        <span className="text-mint/70"># </span>
                        {service.description}
                      </p>
                    )}

                    {service.href && (
                      <p className="mt-auto pt-1 text-[12px] text-mint flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                        <span aria-hidden="true">$</span> open
                        <ArrowUpRight
                          className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </p>
                    )}
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>

          <p className="flex items-center gap-1">
            <span className="text-cyan">riththika@portfolio</span>
            <span className="text-text-muted">:~$</span>
            <TerminalCursor className="ml-1" />
          </p>
        </div>
      </TerminalWindow>
    </section>
  );
}