import GithubIcon from "@/components/ui/icons/GithubIcon";
import { ExternalLink } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import StatusBadge from "@/components/ui/StatusBadge";

export default function FinalCTA({ project }) {
  const hasLiveUrl = Boolean(project.liveUrl);

  return (
    <GlowCard className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex flex-col gap-3 max-w-md">
        <StatusBadge label="Case Study Complete" color="mint" />
        <h3 className="text-text-heading text-2xl font-semibold">
          Interested in the code?
        </h3>
        <p className="text-text-body text-sm leading-relaxed">
          {project.title} is open on GitHub — clone it, read through the
          implementation, or reach out if you&apos;d like to talk through any
          of the decisions above.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 shrink-0">
        <a
          href={project.githubUrl || "#"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-5 py-2.5 rounded-control shadow-glow-purple hover:opacity-90 transition-opacity"
        >
          <GithubIcon className="size-4" />
          View on GitHub
        </a>
        <a
          href={hasLiveUrl ? project.liveUrl : undefined}
          target={hasLiveUrl ? "_blank" : undefined}
          rel={hasLiveUrl ? "noreferrer" : undefined}
          aria-disabled={!hasLiveUrl}
          className={`inline-flex items-center gap-2 border border-border text-sm font-medium px-5 py-2.5 rounded-control transition-colors ${
            hasLiveUrl
              ? "bg-transparent text-text-heading hover:bg-elevated"
              : "bg-transparent text-text-disabled cursor-not-allowed"
          }`}
        >
          <ExternalLink className="size-4" strokeWidth={1.75} />
          Live Demo
        </a>
      </div>
    </GlowCard>
  );
}