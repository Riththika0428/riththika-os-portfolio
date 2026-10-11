//import Link from "next/link";
//import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import GithubIcon from "@/components/ui/icons/GithubIcon";

export default function CaseStudyHero({ project }) {
  const hasLiveUrl = Boolean(project.liveUrl);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-text-muted text-sm hover:text-text-heading transition-colors w-fit"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Back to Projects
      </Link>

      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-cyan text-[11px] tracking-[0.66px] uppercase font-mono">
          <span className="size-1.5 rounded-full bg-cyan animate-pulse" aria-hidden="true" />
          Case Study · {project.category}
        </span>
        <h1 className="text-text-heading text-3xl md:text-4xl font-bold tracking-tight">
          {project.title}
        </h1>
        <p className="text-text-body text-base max-w-2xl leading-relaxed">
          {project.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="text-[11px] font-mono bg-chip text-text-muted px-2 py-1 rounded-chip"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* <a
          href={project.githubUrl || "#"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-5 py-2.5 rounded-control shadow-glow-purple hover:opacity-90 transition-opacity"
        >
          <Github className="size-4" strokeWidth={2} />
          GitHub
        </a> */}

<a
  href={project.githubUrl || "#"}
  target="_blank"
  rel="noreferrer"
  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-5 py-2.5 rounded-control shadow-glow-purple hover:opacity-90 transition-opacity"
>
  <GithubIcon className="size-4" />
  GitHub
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
          <ExternalLink className="size-4" strokeWidth={2} />
          Live Demo
        </a>
      </div>
    </div>
  );
}