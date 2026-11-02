"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Layout, Server, PenTool, Rocket, Code2, Database, Wrench, Sparkles, ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/data/home";

const ICONS = { Layout, Server, PenTool, Rocket, Code2, Database, Wrench, Sparkles };

// Cards come from Admin → Home → Services. With none, the whole section is hidden.
export default function ServicesGrid({ items = SERVICES, heading = "My Services" }) {
  const reduce = useReducedMotion();

  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="services-heading" className="flex flex-col gap-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <h2 id="services-heading" className="text-text-heading text-xl sm:text-2xl font-semibold">
          {heading}
        </h2>
        <motion.span
          aria-hidden="true"
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: 64 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-1 rounded-full bg-purple"
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((service, index) => {
          const Icon = ICONS[service.icon] ?? Sparkles;
          const Wrapper = service.href ? Link : "div";
          const wrapperProps = service.href ? { href: service.href } : {};
          return (
            // Outer motion layer: staggered fade-up when scrolled into view.
            <motion.div
              key={`${service.title}-${index}`}
              initial={reduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.12, ease: "easeOut" }}
              className="flex"
            >
              <Wrapper
                {...wrapperProps}
                className="group relative w-full overflow-hidden rounded-panel border border-border bg-card p-5 flex flex-col gap-3 transition-all duration-300 hover:bg-purple-dim hover:border-purple hover:shadow-glow-purple hover:-translate-y-1.5 focus-visible:bg-purple-dim focus-visible:border-purple outline-none"
              >
                {/* shine sweep on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[420%] transition-all duration-700 ease-out"
                />
                {/* decorative ring, top-right: spins slowly, faster on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-7 -right-7 size-20 rounded-full border-[7px] border-purple/40 border-b-transparent transition-colors duration-300 group-hover:border-white/25 group-hover:border-b-transparent motion-safe:animate-[spin_12s_linear_infinite] motion-safe:group-hover:animate-[spin_3s_linear_infinite]"
                />
                <Icon
                  className="size-8 text-text-heading transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-text-heading text-base font-semibold">{service.title}</h3>
                  {service.description && (
                    <p className="text-text-muted group-hover:text-text-heading/90 text-[13px] leading-5 transition-colors duration-300">
                      {service.description}
                    </p>
                  )}
                </div>
                {service.href && (
                  <div className="mt-auto pt-1 flex items-center justify-end">
                    <span className="hidden group-hover:inline-flex group-focus-visible:inline-flex mr-3 text-sm font-medium text-text-heading">
                      View All
                    </span>
                    <span className="size-8 rounded-full border border-border group-hover:border-white/60 group-hover:bg-white/10 flex items-center justify-center text-text-heading transition-colors duration-300">
                      <ArrowUpRight
                        className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-125"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                )}
              </Wrapper>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}