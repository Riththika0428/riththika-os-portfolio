/**
 * "01 / ABOUT" eyebrow + big page title. Reused at the top of every
 * page (About = 01, Projects = 02, Skills = 03, ...) so page identity
 * stays visually consistent across the whole OS.
 */
export default function PageHeader({ index, label, title }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="inline-flex items-center gap-2 text-cyan text-[11px] tracking-[0.66px] uppercase font-mono">
        <span className="size-1.5 rounded-full bg-cyan animate-pulse" aria-hidden="true" />
        {index} / {label}
      </span>
      <h1 className="text-text-heading text-3xl md:text-4xl font-bold tracking-tight">
        {title}
      </h1>
    </div>
  );
}