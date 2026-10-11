"use client";

import { X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

/**
 * Mobile drawer: reuses Sidebar for content so nav stays in sync with
 * desktop by construction — only the drawer chrome (overlay, close
 * button, slide-in) lives here.
 */
export default function MobileNav({ open, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden transition-opacity ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 left-0 w-[260px] shadow-terminal transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar className="h-full" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 -right-10 p-2 bg-elevated rounded-control text-text-body"
          aria-label="Close menu"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}