/**
 * Renders a real brand logo from simple-icons (in its official brand
 * color) when one exists, or falls back to a generic lucide icon when
 * it doesn't (simple-icons has no entry for a few things we list, like
 * VS Code or C#).
 */
export default function TechIcon({ icon, FallbackIcon, className }) {
  if (icon) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className={className}
        fill={`#${icon.hex}`}
        aria-hidden="true"
      >
        <path d={icon.path} />
      </svg>
    );
  }
  if (FallbackIcon) {
    return <FallbackIcon className={className} strokeWidth={1.75} />;
  }
  return null;
}