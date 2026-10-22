"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import ImageLightbox from "@/components/ui/ImageLightbox";

/**
 * Circular avatar that shows a real photo when one loads, and falls
 * back to initials (matching the site's glow-ring style) if `src` is
 * missing or fails to load — so nothing breaks before a real photo
 * has been added to /public.
 *
 * `zoomable`: clicking a loaded photo opens it full size in a viewer.
 */
export default function Avatar({ src, name, size = 64, className, glow = true, zoomable = false }) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");

  const dimension = { width: size, height: size };
  // Photos served by the API live on another origin. `unoptimized` loads them directly,
  // so next.config.mjs needs no image host settings.
  const remote = /^https?:\/\//.test(src);

  if (!src || failed) {
    return (
      <div
        style={dimension}
        className={clsx(
          "rounded-full bg-subtle flex items-center justify-center text-text-heading font-semibold shrink-0",
          glow && "shadow-glow-cyan",
          className
        )}
      >
        {initials}
      </div>
    );
  }

  const photo = (
    <Image
      src={src}
      alt={name}
      fill
      sizes={`${size}px`}
      className="object-cover"
      unoptimized={remote}
      onError={() => setFailed(true)}
    />
  );
  const ring = clsx("relative rounded-full overflow-hidden shrink-0", glow && "shadow-glow-cyan", className);

  if (!zoomable) {
    return (
      <div style={dimension} className={ring}>
        {photo}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        style={dimension}
        onClick={() => setOpen(true)}
        aria-label={`View ${name} photo`}
        className={clsx(ring, "cursor-zoom-in transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan")}
      >
        {photo}
      </button>
      {open && <ImageLightbox src={src} alt={name} onClose={() => setOpen(false)} />}
    </>
  );
}