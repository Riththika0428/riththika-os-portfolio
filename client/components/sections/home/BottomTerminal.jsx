import TerminalWindow from "@/components/ui/TerminalWindow";
import TerminalCursor from "@/components/ui/TerminalCursor";
import { CLOSING_MESSAGE } from "@/lib/data/home";

const DIRECTORIES = ["about/", "projects/", "skills/", "education/", "contact/"];

export default function BottomTerminal({ message = CLOSING_MESSAGE }) {
  return (
    <TerminalWindow
      title="›_ Terminal"
      shadow="terminal"
      bodyClassName="p-4 sm:p-6 lg:p-8 font-mono text-sm"
    >
      <div className="flex flex-col gap-3">
        <p>
          <span className="text-cyan">riththika@portfolio</span>
          <span className="text-text-muted">:~$</span>{" "}
          <span className="text-text-body">ls</span>
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 pl-0">
          {DIRECTORIES.map((dir) => (
            <span key={dir} className="text-mint">
              {dir}
            </span>
          ))}
        </div>
        <p className="pt-2">
          <span className="text-cyan">riththika@portfolio</span>
          <span className="text-text-muted">:~$</span>{" "}
          <span className="text-text-body">echo &quot;{message}&quot;</span>
        </p>
        <p className="text-mint">{message}</p>
        <p className="flex items-center gap-1 pt-1">
          <span className="text-cyan">riththika@portfolio</span>
          <span className="text-text-muted">:~$</span>
          <span className="inline-block w-2 h-4 bg-cyan animate-pulse ml-1" aria-hidden="true" />
        </p>
      </div>
      <TerminalCursor className="ml-1" />
    </TerminalWindow>
  );
}