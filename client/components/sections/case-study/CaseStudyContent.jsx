import { CheckCircle2, ImageOff, ArrowRight } from "lucide-react";
import CaseStudySection from "@/components/ui/CaseStudySection";
import { resolveImage } from "@/lib/imageUrl";

function TechGroup({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-muted text-[11px] font-mono uppercase tracking-[0.5px]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((tech) => (
          <span
            key={tech}
            className="text-[11px] font-mono bg-chip text-text-heading px-2 py-1 rounded-chip"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

// A section is shown only when it has something to show, so a project with a short
// case study never displays empty boxes.
const has = (list) => Array.isArray(list) && list.length > 0;

export default function CaseStudyContent({ project }) {
  const cs = project.caseStudy ?? {};
  const features = cs.features ?? [];
  const screenshots = cs.screenshots ?? [];
  const tech = cs.techStack ?? {};
  const architecture = cs.architecture ?? {};
  const layers = architecture.layers ?? [];
  const process = cs.process ?? [];
  const challenges = cs.challenges ?? [];
  const results = cs.results ?? [];
  const hasTech = has(tech.frontend) || has(tech.backend) || has(tech.database);

  return (
    <div className="flex flex-col gap-6">
      {cs.overview?.trim() && (
        <CaseStudySection title="Project Overview" comment="OVERVIEW">
          <p className="text-text-body text-[15px] leading-relaxed">{cs.overview}</p>
        </CaseStudySection>
      )}

      {features.length > 0 && (
        <CaseStudySection title="Key Features" comment={`${features.length} FEATURES`}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-text-body text-sm">
                <CheckCircle2 className="size-4 text-mint shrink-0 mt-0.5" strokeWidth={1.75} />
                {feature}
              </li>
            ))}
          </ul>
        </CaseStudySection>
      )}

      <CaseStudySection title="UI Screenshots" comment="VISUALS">
        {screenshots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {screenshots.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={resolveImage(src)}
                alt={`${project.title} screenshot`}
                className="rounded-control border border-border w-full h-auto"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-border rounded-control text-text-muted">
            <ImageOff className="size-6" strokeWidth={1.5} />
            <p className="text-sm">Screenshots coming soon.</p>
          </div>
        )}
      </CaseStudySection>

      {hasTech && (
        <CaseStudySection title="Technology Stack" comment="TECH">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TechGroup label="Frontend" items={tech.frontend} />
            <TechGroup label="Backend" items={tech.backend} />
            <TechGroup label="Database" items={tech.database} />
          </div>
        </CaseStudySection>
      )}

      {(architecture.summary?.trim() || layers.length > 0) && (
        <CaseStudySection title="System Architecture" comment="STRUCTURE">
          {architecture.summary?.trim() && (
            <p className="text-text-body text-sm leading-relaxed">{architecture.summary}</p>
          )}
          {layers.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 pt-2">
              {layers.map((layer, i) => (
                <div key={layer} className="flex items-center gap-3">
                  <div className="bg-elevated border border-border rounded-control px-4 py-3 text-text-heading text-[13px] font-mono max-w-xs">
                    {layer}
                  </div>
                  {i < layers.length - 1 && (
                    <ArrowRight
                      className="size-4 text-text-muted rotate-90 md:rotate-0 shrink-0"
                      strokeWidth={1.75}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CaseStudySection>
      )}

      {process.length > 0 && (
        <CaseStudySection title="Development Process" comment={`${process.length} STEPS`}>
          <ol className="flex flex-col gap-4">
            {process.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="shrink-0 size-7 rounded-full bg-chip2 text-text-heading text-xs font-mono flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-heading text-sm font-semibold">{step.title}</span>
                  {step.description && (
                    <span className="text-text-body text-sm leading-relaxed">{step.description}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CaseStudySection>
      )}

      {challenges.length > 0 && (
        <CaseStudySection title="Challenges & Solutions" comment={`${challenges.length} LOGGED`}>
          <div className="flex flex-col gap-5">
            {challenges.map((item) => (
              <div key={item.challenge} className="flex flex-col gap-2 border-l-2 border-border pl-4">
                <div className="flex gap-2">
                  <span className="text-danger text-[11px] font-mono uppercase tracking-[0.5px] shrink-0">
                    Challenge
                  </span>
                  <p className="text-text-body text-sm leading-relaxed">{item.challenge}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-mint text-[11px] font-mono uppercase tracking-[0.5px] shrink-0">
                    Solution
                  </span>
                  <p className="text-text-body text-sm leading-relaxed">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </CaseStudySection>
      )}

      {results.length > 0 && (
        <CaseStudySection title="Results" comment="OUTCOME">
          <ul className="flex flex-col gap-2">
            {results.map((result) => (
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