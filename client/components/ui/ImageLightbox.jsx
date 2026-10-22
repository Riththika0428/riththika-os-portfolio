"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Full-screen image viewer. Closes on Escape, on the X button, or when the dark
 * background is clicked. Rendered into <body> so the sidebar can't clip or cover it.
 */
export default function ImageLightbox({ src, alt, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement; // give focus back to the picture when we close
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // the page behind must not scroll

    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={alt || "Image preview"}
        onClick={(e) => e.stopPropagation()}
        className="relative"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close image"
          className="absolute -top-3 -right-3 z-10 grid size-9 place-items-center rounded-full bg-elevated text-text-heading shadow-lg ring-1 ring-border hover:bg-subtle"
        >
          <X className="size-5" strokeWidth={2} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] max-w-[90vw] rounded-panel object-contain shadow-glow-cyan"
        />
        {alt && <p className="mt-3 text-center text-sm text-text-body">{alt}</p>}
      </div>
    </div>,
    document.body
  );
}