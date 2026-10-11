"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import { Layout, Server, PenTool, Rocket, ArrowUpRight } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import { QUICK_SKILLS } from "@/lib/data/home";

const ICONS = { Layout, Server, PenTool, Rocket };

const DRIFT = {
  x: [0, -20, 0, 20, 0],
  transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
};

export default function QuickSkills() {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start(DRIFT);
  }, [controls]);

  return (
    <motion.div
      animate={controls}
      onHoverStart={() => controls.stop()}
      onHoverEnd={() => controls.start(DRIFT)}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {QUICK_SKILLS.map((skill) => {
        const Icon = ICONS[skill.icon];
        return (
          <GlowCard
            key={skill.key}
            as={Link}
            href={skill.href}
            className="group relative p-5 flex flex-col gap-3 hover:border-purple/40 hover:shadow-glow-purple transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="size-9 rounded-control bg-elevated flex items-center justify-center text-cyan transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                {Icon && <Icon className="size-4.5" strokeWidth={1.75} />}
              </div>
              <ArrowUpRight
                className="size-4 text-text-muted opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200"
                strokeWidth={2}
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-text-heading text-sm font-semibold">{skill.title}</h3>
              <p className="text-text-muted text-[13px] leading-5">{skill.description}</p>
            </div>
          </GlowCard>
        );
      })}
    </motion.div>
  );
}