import { CheckCircle2, ArrowRight } from "lucide-react";
import CaseStudySection from "@/components/ui/CaseStudySection";
import { resolveImage } from "@/lib/imageUrl";

const hasItems = (arr) => Array.isArray(arr) && arr.length > 0;

function TechGroup({ label, items }) {
  if (!hasItems(items)) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-muted text-[11px] font-mono uppercase tracking-[0.5px]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((tech) => (
          <span key={tech} className="text-[11px] font-mono bg-chip text-text-heading px-2 py-1 rounded-chip">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CaseStudyContent({ project }) {
  const cs = project.caseStudy;
  const { frontend, backend, database } = cs.techStack;
  const hasTech = hasItems(frontend) || hasItems(backend) || hasItems(database);
  const hasArchitecture = Boolean(cs.architecture.summary) || hasItems(cs.architecture.layers);

  return (
    <div className="flex flex-col gap-6">
      {cs.overview && (
        <CaseStudySection title="Project Overview" comment="OVERVIEW">
          <p className="text-text-body text-[15px] leading-relaxed">{cs.overview}</p>
        </CaseStudySection>
      )}

      {hasItems(cs.features) && (
        <CaseStudySection title="Key Features" comment={`${cs.features.length} FEATURES`}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cs.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-text-body text-sm">
                <CheckCircle2 className="size-4 text-mint shrink-0 mt-0.5" strokeWidth={1.75} />
                {feature}
              </li>
            ))}
          </ul>
        </CaseStudySection>
      )}

      {hasItems(cs.screenshots) && (
        <CaseStudySection title="UI Screenshots" comment="VISUALS">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cs.screenshots.map((src, i) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    key={`${src}-${i}`}
    src={resolveImage(src)}
    alt={`${project.title} screenshot`}
    className="rounded-control border border-border w-full h-auto"
  />
))}
          </div>
        </CaseStudySection>
      )}

      {hasTech && (
        <CaseStudySection title="Technology Stack" comment="TECH">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TechGroup label="Frontend" items={frontend} />
            <TechGroup label="Backend" items={backend} />
            <TechGroup label="Database" items={database} />
          </div>
        </CaseStudySection>
      )}

      {hasArchitecture && (
        <CaseStudySection title="System Architecture" comment="STRUCTURE">
          {cs.architecture.summary && (
            <p className="text-text-body text-sm leading-relaxed">{cs.architecture.summary}</p>
          )}
          {hasItems(cs.architecture.layers) && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 pt-2">
              {cs.architecture.layers.map((layer, i) => (
                <div key={layer} className="flex items-center gap-3">
                  <div className="bg-elevated border border-border rounded-control px-4 py-3 text-text-heading text-[13px] font-mono max-w-xs">
                    {layer}
                  </div>
                  {i < cs.architecture.layers.length - 1 && (
                    <ArrowRight className="size-4 text-text-muted rotate-90 md:rotate-0 shrink-0" strokeWidth={1.75} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CaseStudySection>
      )}

      {hasItems(cs.process) && (
        <CaseStudySection title="Development Process" comment={`${cs.process.length} STEPS`}>
          <ol className="flex flex-col gap-4">
            {cs.process.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="shrink-0 size-7 rounded-full bg-chip2 text-text-heading text-xs font-mono flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-heading text-sm font-semibold">{step.title}</span>
                  <span className="text-text-body text-sm leading-relaxed">{step.description}</span>
                </div>
              </li>
            ))}
          </ol>
        </CaseStudySection>
      )}

      {hasItems(cs.challenges) && (
        <CaseStudySection title="Challenges & Solutions" comment={`${cs.challenges.length} LOGGED`}>
          <div className="flex flex-col gap-5">
            {cs.challenges.map((item) => (
              <div key={item.challenge} className="flex flex-col gap-2 border-l-2 border-border pl-4">
                <div className="flex gap-2">
                  <span className="text-danger text-[11px] font-mono uppercase tracking-[0.5px] shrink-0">Challenge</span>
                  <p className="text-text-body text-sm leading-relaxed">{item.challenge}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-mint text-[11px] font-mono uppercase tracking-[0.5px] shrink-0">Solution</span>
                  <p className="text-text-body text-sm leading-relaxed">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </CaseStudySection>
      )}

      {hasItems(cs.results) && (
        <CaseStudySection title="Results" comment="OUTCOME">
          <ul className="flex flex-col gap-2">
            {cs.results.map((result) => (
              <li key={result} className="flex items-start gap-2 text-text-body text-sm">
                <CheckCircle2 className="size-4 text-cyan shrink-0 mt-0.5" strokeWidth={1.75} />
                {result}
              </li>
            ))}
          </ul>
        </CaseStudySection>
      )}
    </div>
  );
}