import TerminalWindow from "@/components/ui/TerminalWindow";
import TerminalCursor from "@/components/ui/TerminalCursor";

export default function ClosingTerminal() {
  return (
    <TerminalWindow shadow="window" bodyClassName="p-4 sm:p-6 font-mono text-sm">
      <p className="flex items-center gap-1 flex-wrap">
        <span className="text-cyan">riththika@portfolio</span>
        <span className="text-text-muted">:~$</span>{" "}
        <span className="text-text-body">
          echo &quot;Let&apos;s build something awesome together.&quot;
        </span>
      </p>
      <p className="text-mint mt-2">Let&apos;s build something awesome together.</p>
      <p className="flex items-center gap-1 pt-2">
        <span className="text-cyan">riththika@portfolio</span>
        <span className="text-text-muted">:~$</span>
        <TerminalCursor className="ml-1" />
      </p>
    </TerminalWindow>
  );
}