import clsx from "clsx";

/**
 * The three-dot "window chrome" wrapper used for every terminal-styled
 * surface in the design (hero terminal, the sys_learning widget, the
 * bottom stdout panel). Composes a titlebar (dots + title + optional
 * right-side slot) over arbitrary body content.
 */
export default function TerminalWindow({
  title,
  titleIcon,
  right,
  shadow = "window",
  className,
  bodyClassName,
  children,
}) {
  return (
    <div
      className={clsx(
        "bg-card rounded-panel overflow-hidden border border-border",
        shadow === "terminal" ? "shadow-terminal" : "shadow-window",
        className
      )}
    >
      <div className="bg-elevated h-9 flex items-center justify-between px-4 shrink-0 border-b border-border">
        <div className="flex gap-2 items-center">
          <span className="size-2.5 rounded-full bg-danger" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-orange" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-mint" aria-hidden="true" />
        </div>
        {title && (
          <div className="flex gap-2 items-center text-text-body text-[13px] tracking-tight">
            {titleIcon}
            <span>{title}</span>
          </div>
        )}
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <div className={clsx("p-6", bodyClassName)}>{children}</div>
    </div>
  );
}