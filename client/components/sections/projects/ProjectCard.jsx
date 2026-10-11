"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, LayoutTemplate } from "lucide-react";
import GithubIcon from "@/components/ui/icons/GithubIcon";
import TerminalWindow from "@/components/ui/TerminalWindow";

export default function ProjectCard({ project }) {
  const hasLiveUrl = Boolean(project.liveUrl);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative"
      style={{ "--spot-x": "50%", "--spot-y": "50%" }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-panel opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background:
            "radial-gradient(320px circle at var(--spot-x) var(--spot-y), rgba(139,92,246,0.15), transparent 70%)",
        }}
      />
      <div
        className={`pointer-events-none absolute -inset-px rounded-panel transition-opacity duration-300 shadow-glow-purple ${
          project.featured ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <TerminalWindow
        title={`${project.slug}.config`}
        right={
          <div className="flex items-center gap-2">
            {project.featured && (
              <span className="text-[10px] font-mono uppercase tracking-[0.5px] text-purple bg-purple/10 px-2 py-0.5 rounded-chip">
                Featured
              </span>
            )}
            <span className="text-text-muted text-[10px] font-mono tracking-wide uppercase">
              {project.category}
            </span>
          </div>
        }
        shadow="window"
        bodyClassName="p-0"
        className={project.featured ? "border-purple/40" : ""}
      >
        <div className="relative h-32 border-b border-border flex items-center justify-center overflow-hidden">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-purple/20 via-blue/10 to-cyan/20" />
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.25),transparent_60%)]" />
              <LayoutTemplate
                className="size-7 text-text-muted relative transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.25}
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-text-muted bg-elevated/80 backdrop-blur px-1.5 py-0.5 rounded-chip">
                preview.png
              </span>
            </>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-text-heading text-base font-semibold leading-tight">
              {project.title}
            </h3>
            <span className="text-text-muted text-[11px] font-mono shrink-0 pt-0.5">
              {project.year}
            </span>
          </div>

          <p className="text-text-body text-[13px] leading-relaxed line-clamp-2">
            {project.shortDescription || project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-mono bg-chip text-text-muted px-1.5 py-0.5 rounded-chip"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-purple to-blue text-white text-[13px] font-medium px-3 py-1.5 rounded-control shadow-glow-purple hover:opacity-90 transition-opacity"
            >
              Case Study
              <ArrowUpRight className="size-3.5" strokeWidth={2} />
            </Link>
<a
            
              href={project.githubUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 bg-transparent border border-border text-text-heading text-[13px] font-medium px-3 py-1.5 rounded-control hover:bg-elevated transition-colors"
            >
              <GithubIcon className="size-3.5" />
              GitHub
            </a>

            <a
              href={hasLiveUrl ? project.liveUrl : undefined}
              target={hasLiveUrl ? "_blank" : undefined}
              rel={hasLiveUrl ? "noreferrer" : undefined}
              aria-disabled={!hasLiveUrl}
              className={`inline-flex items-center gap-1 border border-border text-[13px] font-medium px-3 py-1.5 rounded-control transition-colors ${
                hasLiveUrl
                  ? "bg-transparent text-text-heading hover:bg-elevated"
                  : "bg-transparent text-text-disabled cursor-not-allowed"
              }`}
            >
              <ExternalLink className="size-3.5" strokeWidth={1.75} />
              Live Demo
            </a>
          </div>
        </div>
      </TerminalWindow>
    </motion.div>
  );
}