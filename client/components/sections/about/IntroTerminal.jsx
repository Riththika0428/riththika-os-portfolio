"use client";

import { motion } from "framer-motion";
import TerminalWindow from "@/components/ui/TerminalWindow";
import StatusBadge from "@/components/ui/StatusBadge";
import TerminalCursor from "@/components/ui/TerminalCursor";
import { INTRO_PARAGRAPHS, PROFILE_FIELDS } from "@/lib/data/about";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function IntroTerminal() {
  return (
    <TerminalWindow title="about-me.txt" shadow="terminal" bodyClassName="p-0">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT: narrative */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col gap-4 lg:border-r border-border"
        >
          <p className="font-mono text-xs text-text-muted">
            <span className="text-cyan">$</span> cat about-me.txt
          </p>
          <div className="flex flex-col gap-4">
            {INTRO_PARAGRAPHS.map((paragraph, i) => (
              <motion.p
                key={i}
                variants={item}
                className="text-text-body text-[15px] leading-relaxed"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
          <motion.div variants={item}>
            <TerminalCursor />
          </motion.div>
        </motion.div>

        {/* RIGHT: profile info card */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col gap-4 bg-elevated/40"
        >
          <motion.p
            variants={item}
            className="font-mono text-[11px] text-text-muted tracking-[0.5px]"
          >
            {"// engineer_profile.json"}
          </motion.p>
          <div className="bg-card border border-border rounded-panel divide-y divide-border overflow-hidden">
            {PROFILE_FIELDS.map((field) => (
              <motion.div
                key={field.key}
                variants={item}
                className="flex items-center justify-between px-4 py-3 hover:bg-elevated/60 transition-colors"
              >
                <span className="text-text-muted text-[13px] font-mono">{field.label}</span>
                <span className="text-text-heading text-[13px] font-mono text-right">
                  {field.value}
                </span>
              </motion.div>
            ))}
          </div>
          <motion.div
            variants={item}
            className="bg-chip flex items-center px-4 py-2.5 rounded-control"
          >
            <StatusBadge label="Available for opportunities" color="mint" />
          </motion.div>
        </motion.div>
      </div>
    </TerminalWindow>
  );
}