import clsx from "clsx";

const COLOR_MAP = {
  mint: { dot: "bg-mint", text: "text-mint-pale", glow: "shadow-glow-mint" },
  cyan: { dot: "bg-cyan", text: "text-text-bright", glow: "shadow-glow-cyan" },
  purple: { dot: "bg-purple", text: "text-purple", glow: "shadow-glow-purple" },
  muted: { dot: "bg-text-muted", text: "text-text-muted", glow: "" },
};

/**
 * Small pill: a colored (optionally glowing) dot + uppercase label.
 * Used for "ONLINE", "SYS_INITIALIZED", "Available for opportunities", etc.
 */
export default function StatusBadge({ label, color = "mint", glow = true, className }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.mint;

  return (
    <span className={clsx("inline-flex items-center gap-1.5", className)}>
      <span
        className={clsx("size-2 rounded-full", c.dot, glow && c.glow)}
        aria-hidden="true"
      />
      <span className={clsx("text-[11px] tracking-[0.66px] uppercase", c.text)}>
        {label}
      </span>
    </span>
  );
}