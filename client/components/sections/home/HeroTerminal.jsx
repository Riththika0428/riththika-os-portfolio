import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import TerminalWindow from "@/components/ui/TerminalWindow";

// The text comes from the Home page settings in the admin panel; the defaults match the old design.
export default function HeroTerminal({
  name = "Riththika",
  role = "Full Stack Developer",
  tagline = "I build clean, responsive and user-focused web applications that solve real-world problems.",
}) {
  return (
    <TerminalWindow title="welcome.sh" shadow="terminal" bodyClassName="p-10 lg:p-12">
      <div className="flex flex-col gap-8">
        <p className="font-mono text-sm text-mint">
          <span className="text-cyan">riththika</span>
          <span className="text-text-muted">@</span>
          <span className="text-cyan">portfolio</span>
          <span className="text-text-muted">:~$</span>{" "}
          <span className="text-text-body">whoami</span>
        </p>

        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-heading leading-tight">
            Hi, I&apos;m <span className="text-gradient-primary">{name}</span>
          </h1>
          <p className="text-lg md:text-xl text-text-heading font-medium">{role}</p>
          <p className="text-text-body text-base max-w-xl leading-relaxed">{tagline}</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-5 py-2.5 rounded-control shadow-glow-purple hover:opacity-90 transition-opacity"
          >
            View My Projects
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 bg-transparent border border-border text-text-heading text-sm font-medium px-5 py-2.5 rounded-control hover:bg-elevated transition-colors"
          >
            Download CV
            <Download className="size-4" strokeWidth={2} />
          </a>
        </div>
      </div>
    </TerminalWindow>
  );
}