"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Braces } from "lucide-react";
import TerminalCursor from "@/components/ui/TerminalCursor";
import StatusBadge from "@/components/ui/StatusBadge";


const TABS = [
  { key: "readme", label: "readme.md", icon: FileText },
  { key: "profile", label: "profile.json", icon: Braces },
];

export default function AboutTabs({ introParagraphs = [], profileFields = [] }) {
  const [active, setActive] = useState("readme");

  return (
    <div className="bg-card border border-border rounded-panel shadow-terminal overflow-hidden h-full">
      <div className="bg-elevated flex items-center border-b border-border">
        <div className="flex gap-2 items-center px-4 h-9 shrink-0 border-r border-border">
          <span className="size-2.5 rounded-full bg-danger" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-orange" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-mint" aria-hidden="true" />
        </div>
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={`relative flex items-center gap-2 px-4 h-9 text-[13px] font-mono transition-colors ${
                  isActive
                    ? "text-text-heading bg-card"
                    : "text-text-muted hover:text-text-body"
                }`}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="about-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {active === "readme" && (
            <motion.div
              key="readme"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <p className="font-mono text-xs text-text-muted">
                <span className="text-cyan">$</span> cat readme.md
              </p>
             {introParagraphs.map((paragraph, i) => (
                <p key={i} className="text-text-body text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <TerminalCursor />
            </motion.div>
          )}

          {active === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-0.5 font-mono text-[13px] leading-6">
                <span className="text-text-muted">{"{"}</span>
                {profileFields.map((field, i) => (
                  <div key={field.key} className="pl-4">
                    <span className="text-cyan">&quot;{field.label.toLowerCase()}&quot;</span>
                    <span className="text-text-muted">: </span>
                    <span className="text-mint">&quot;{field.value}&quot;</span>
                     {i < profileFields.length - 1 && (
                      <span className="text-text-muted">,</span>
                    )}
                  </div>
                ))}
                <span className="text-text-muted">{"}"}</span>
              </div>
              <div className="bg-chip flex items-center px-4 py-2.5 rounded-control w-fit">
                <StatusBadge label="Available for opportunities" color="mint" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}