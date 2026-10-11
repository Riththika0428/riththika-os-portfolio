import clsx from "clsx";

export default function GlowCard({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag
      className={clsx(
        "bg-card border border-border rounded-panel shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}