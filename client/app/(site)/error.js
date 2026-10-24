"use client";

import { useEffect } from "react";
import Link from "next/link";

// Catches unexpected crashes in any public page, so visitors never see a blank screen.
// The real message stays in the console / server log; visitors only see a friendly text.
export default function SiteError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-10">
      <div role="alert" className="text-center max-w-md">
        <p className="text-text-muted text-[11px] tracking-[0.66px] uppercase font-mono">error</p>
        <h1 className="mt-2 text-text-heading text-3xl font-mono">something crashed</h1>
        <p className="mt-2 text-text-body text-sm">
          This window hit an unexpected problem. Try again, or head back to the desktop.
        </p>
        {error?.digest && <p className="mt-2 text-text-muted text-xs font-mono">ref: {error.digest}</p>}
        <div className="mt-6 flex items-center justify-center gap-5">
          <button type="button" onClick={() => reset()} className="text-sm text-cyan hover:underline">
            try again
          </button>
          <Link href="/" className="text-sm text-text-body hover:underline">
            return to desktop
          </Link>
        </div>
      </div>
    </div>
  );
}