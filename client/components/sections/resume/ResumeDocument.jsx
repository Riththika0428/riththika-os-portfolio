import { Fragment } from "react";
import ResumeSection from "@/components/sections/resume/ResumeSection";
import { SITE } from "@/lib/constants/site";
import { dateRange } from "@/lib/dates";

const Dot = () => <span className="text-neutral-300">•</span>;

/**
 * Pure presentation. The page passes in:
 *   resume     – content from /api/resume
 *   education  – entries from /api/education
 *   projects   – projects from /api/projects (already filtered to the chosen ones)
 * Anything left empty in the admin is simply not shown.
 */
export default function ResumeDocument({ resume, education = [], projects = [] }) {
  const { contact } = resume;
  const skillGroups = resume.skillGroups.filter((g) => g.label);

  const contactItems = [
    contact.location && { key: "location", node: <span>{contact.location}</span> },
    contact.availability && {
      key: "availability",
      node: (
        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {contact.availability}
        </span>
      ),
    },
    contact.email && { key: "email", node: <span><strong className="font-semibold">Email:</strong> {contact.email}</span> },
    contact.github && { key: "github", node: <span><strong className="font-semibold">GH:</strong> {contact.github}</span> },
    contact.linkedin && { key: "linkedin", node: <span><strong className="font-semibold">IN:</strong> {contact.linkedin}</span> },
  ].filter(Boolean);

  return (
    <div className="bg-white text-neutral-900 rounded-md shadow-2xl w-full max-w-[850px] mx-auto p-8 sm:p-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-b-2 border-neutral-200">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            {SITE.author.toUpperCase()}
          </h1>
          {resume.headline && (
            <span className="text-neutral-600 text-sm sm:text-base font-medium">{resume.headline}</span>
          )}
        </div>
        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[12px] text-neutral-600">
            {contactItems.map((item, i) => (
              <Fragment key={item.key}>
                {i > 0 && <Dot />}
                {item.node}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Profile */}
      {resume.summary && (
        <ResumeSection title="Profile" meta="Professional Summary">
          <p className="text-sm leading-relaxed text-neutral-700">{resume.summary}</p>
        </ResumeSection>
      )}

      {/* Technical Skills */}
      {skillGroups.length > 0 && (
        <ResumeSection title="Technical Skills" meta="Core Competencies">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillGroups.map((group) => (
              <div key={group.key} className="bg-neutral-50 rounded-md p-3">
                <p className="text-sm font-semibold text-neutral-900">{group.label}:</p>
                <p className="text-[13px] text-neutral-600 leading-relaxed mt-0.5">
                  {group.items.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {/* Education */}
      {education.length > 0 && (
        <ResumeSection title="Education" meta={`${education.length} ${education.length === 1 ? "Program" : "Programs"}`}>
          <div className="flex flex-col gap-4">
            {education.map((entry) => (
              <div key={entry.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{entry.degree}</p>
                  <p className="text-[13px] text-neutral-600">{entry.institution}</p>
                </div>
                <span className="text-xs text-neutral-500 shrink-0 pt-0.5">
                  {dateRange(entry) || entry.status}
                </span>
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <ResumeSection title="Projects" meta="Selected Work">
          <div className="flex flex-col gap-4">
            {projects.map((project) => (
              <div key={project.slug}>
                <p className="text-sm">
                  <span className="font-semibold text-neutral-900">{project.title}</span>
                  {(project.stack ?? []).length > 0 && (
                    <>
                      <span className="text-neutral-400"> — </span>
                      <span className="text-neutral-500 text-[13px]">{project.stack.join(", ")}</span>
                    </>
                  )}
                </p>
                <ul className="mt-1 list-disc list-inside text-[13px] text-neutral-600 leading-relaxed">
                  <li>{project.description}</li>
                </ul>
              </div>
            ))}
          </div>
        </ResumeSection>
      )}

      {/* Experience / Learning */}
      {resume.experience && (
        <ResumeSection title="Experience / Learning" meta="Continuous Practice">
          <p className="text-sm leading-relaxed text-neutral-700">{resume.experience}</p>
        </ResumeSection>
      )}

      {/* Achievements */}
      <ResumeSection title="Achievements" meta="Recognitions">
        {resume.achievements.length > 0 ? (
          <ul className="list-disc list-inside text-[13px] text-neutral-600 leading-relaxed">
            {resume.achievements.map((item, i) => (
              <li key={`${item.title}-${i}`}>
                <span className="font-semibold text-neutral-900">{item.title}</span>
                {item.description ? ` — ${item.description}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-neutral-400 italic">No achievements added yet.</p>
        )}
      </ResumeSection>
    </div>
  );
}