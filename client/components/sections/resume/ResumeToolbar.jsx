import { Download, ExternalLink } from "lucide-react";

export default function ResumeToolbar({ pdfUrl }) {
  const href = pdfUrl || "/resume.pdf";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6 py-3 border-b border-border bg-elevated">
      <div className="flex flex-wrap gap-3">
        <a
          href={href}
          download
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple to-blue text-white text-sm font-medium px-4 py-2 rounded-control shadow-glow-purple hover:opacity-90 transition-opacity"
        >
          <Download className="size-4" strokeWidth={2} />
          Download Resume
        </a>
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 bg-transparent border border-border text-text-heading text-sm font-medium px-4 py-2 rounded-control hover:bg-card transition-colors"
        >
          <ExternalLink className="size-4" strokeWidth={1.75} />
          Open Resume
        </a>
      </div>
      <span className="text-text-muted text-[11px] font-mono uppercase tracking-[0.5px]">
        Format: PDF
      </span>
    </div>
  );
}