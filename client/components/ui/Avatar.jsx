"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

/**
 * Circular avatar that shows a real photo when one loads, and falls
 * back to initials (matching the site's glow-ring style) if `src` is
 * missing or fails to load — so nothing breaks before a real photo
 * has been added to /public.
 */
export default function Avatar({ src, name, size = 64, className, glow = true }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");

  const dimension = { width: size, height: size };

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

  return (
    <div
      style={dimension}
      className={clsx(
        "relative rounded-full overflow-hidden shrink-0",
        glow && "shadow-glow-cyan",
        className
      )}
    >
      <Image
        src={src}
        alt={name}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}