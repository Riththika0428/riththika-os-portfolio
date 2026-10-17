import { Award, ExternalLink } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import { formatMonth, isExpired } from "@/lib/dates";

function CertificationCard({ cert }) {
  const expired = isExpired(cert.expiryDate);

  return (
    <div className="bg-chip/60 rounded-control p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-control bg-cyan/10 flex items-center justify-center text-cyan shrink-0">
          <Award className="size-4.5" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h4 className="text-text-heading text-base font-semibold leading-snug">{cert.title}</h4>
          <span className="text-text-bright text-sm">{cert.issuer}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted text-xs font-mono">
        <span>Issued {formatMonth(cert.issueDate)}</span>
        <span>{cert.expiryDate ? `${expired ? "Expired" : "Expires"} ${formatMonth(cert.expiryDate)}` : "No expiry"}</span>
        {cert.credentialId && <span>ID: {cert.credentialId}</span>}
      </div>

      {cert.description && <p className="text-text-body text-sm leading-relaxed">{cert.description}</p>}

      {(cert.skills ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cert.skills.map((skill) => (
            <span key={skill} className="text-[12px] font-mono bg-chip2 text-text-bright px-2 py-1 rounded-chip">
              {skill}
            </span>
          ))}
        </div>
      )}

      {cert.credentialUrl && (
        <a
          href={cert.credentialUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 self-start text-[13px] text-cyan hover:underline"
        >
          View credential
          <ExternalLink className="size-3.5" strokeWidth={1.75} />
        </a>
      )}
    </div>
  );
}

/** Renders nothing until at least one certification exists, so the page is unchanged before then. */
export default function CertificationsPanel({ certifications = [] }) {
  if (certifications.length === 0) return null;

  return (
    <GlowCard className="p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-control bg-cyan/10 flex items-center justify-center text-cyan shrink-0">
          <Award className="size-4.5" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-text-heading text-lg font-semibold">Certifications</h3>
          <span className="text-text-muted text-[11px] font-mono tracking-[0.5px] uppercase">Credentials</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <CertificationCard key={cert._id} cert={cert} />
        ))}
      </div>
    </GlowCard>
  );
}