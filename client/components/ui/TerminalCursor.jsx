import clsx from "clsx";

export default function TerminalCursor({ className }) {
  return (
    <span
      className={clsx("inline-block w-2 h-4 bg-cyan animate-pulse", className)}
      aria-hidden="true"
    />
  );
}