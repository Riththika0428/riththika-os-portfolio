"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

const GRADIENTS = {
  cyan: "from-blue to-cyan shadow-glow-cyan",
  purple: "from-purple to-blue shadow-glow-purple",
  mint: "from-mint-dim to-mint shadow-glow-mint",
  blue: "from-purple to-blue shadow-glow-blue",
};

export default function ProgressBar({ icon, label, value, valueLabel, color = "cyan" }) {
  const gradient = GRADIENTS[color] ?? GRADIENTS.cyan;
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-start justify-between w-full">
        <div className="flex gap-1.5 items-center">
          {icon}
          <span className="text-text-heading text-[13px] leading-5">{label}</span>
        </div>
        <span className="text-text-bright text-[13px] font-mono leading-5">
          {valueLabel ?? `${value}%`}
        </span>
      </div>
      <div className="bg-subtle h-1.5 w-full rounded-full overflow-hidden">
        <motion.div
          className={clsx("h-full rounded-full bg-gradient-to-r", gradient)}
          initial={{ width: 0 }}
          whileInView={{ width: `${clamped}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}