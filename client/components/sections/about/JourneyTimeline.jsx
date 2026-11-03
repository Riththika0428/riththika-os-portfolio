"use client";

import { motion } from "framer-motion";
import GlowCard from "@/components/ui/GlowCard";
import SectionHeader from "@/components/ui/SectionHeader";


function TimelineNode({ now }) {
  return (
    <div className="relative flex items-center justify-center">
      {now ? (
        <>
          <span className="absolute size-4 rounded-full bg-cyan/30 animate-ping" aria-hidden="true" />
          <span className="relative size-3.5 rounded-full bg-cyan shadow-glow-cyan" />
        </>
      ) : (
        <span className="size-3.5 rounded-full bg-purple shadow-glow-purple" />
      )}
    </div>
  );
}

function MilestoneCard({ item, align, fromSide }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: fromSide === "left" ? -24 : fromSide === "right" ? 24 : 0, y: fromSide ? 0 : 12 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col gap-2 items-start text-left ${
        align === "right" ? "md:items-end md:text-right" : "md:items-start md:text-left"
      }`}
    >
      <span className="font-mono text-xs text-cyan tracking-wide">{item.year}</span>
      <h3 className="text-text-heading text-lg font-semibold">{item.title}</h3>
      <p className="text-text-body text-sm leading-relaxed max-w-sm">{item.description}</p>
      <div className={`flex flex-wrap gap-2 ${align === "right" ? "md:justify-end" : ""}`}>
        {(item.tags ?? []).map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-mono bg-chip text-text-muted px-2 py-1 rounded-chip"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function JourneyTimeline({ journey = [] }) {
  return (
    <GlowCard className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      <SectionHeader title="Developer Journey" comment="MILESTONES_LOG" meta={`${journey.length} ENTRIES`} />

      <div className="relative">
        {/* vertical guideline — draws itself in as you scroll */}
        <motion.div
          className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-border origin-top"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeInOut" }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-12 md:gap-16">
           {journey.map((item, i) => {
            const contentOnRight = i % 2 === 1;

            return (
              <div
                key={item.key}
                className="relative grid grid-cols-1 md:grid-cols-[1fr_2.5rem_1fr] md:items-center gap-4 md:gap-6 pl-10 md:pl-0"
              >
                {/* mobile node */}
                <motion.div
                  className="md:hidden absolute left-4 top-1 -translate-x-1/2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <TimelineNode now={item.now} />
                </motion.div>

                {/* desktop: left column */}
                <div className="hidden md:block">
                  {!contentOnRight && <MilestoneCard item={item} align="right" fromSide="left" />}
                </div>
                {/* desktop: center node */}
                <motion.div
                  className="hidden md:flex justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <TimelineNode now={item.now} />
                </motion.div>
                {/* desktop: right column */}
                <div className="hidden md:block">
                  {contentOnRight && <MilestoneCard item={item} align="left" fromSide="right" />}
                </div>

                {/* mobile: single-column content */}
                <div className="md:hidden">
                  <MilestoneCard item={item} align="left" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlowCard>
  );
}