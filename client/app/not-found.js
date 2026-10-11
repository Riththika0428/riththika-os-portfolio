import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-10">
      <div className="text-center">
        <p className="text-text-muted text-[11px] tracking-[0.66px] uppercase font-mono">404</p>
        <h1 className="mt-2 text-text-heading text-3xl font-mono">process not found</h1>
        <p className="mt-2 text-text-body text-sm">
          The window you tried to open doesn&apos;t exist.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-cyan hover:underline">
          return to desktop
        </Link>
      </div>
    </div>
  );
}