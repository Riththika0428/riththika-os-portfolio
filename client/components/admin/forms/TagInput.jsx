"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({ id, value, onChange, placeholder = "Type and press Enter" }) {
  const [draft, setDraft] = useState("");

  function add(raw) {
    const incoming = raw.split(",").map((s) => s.trim().slice(0, 60)).filter(Boolean);
    if (incoming.length) {
      const next = [...value];
      for (const tag of incoming) {
        if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) next.push(tag);
      }
      onChange(next);
    }
    setDraft("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-700 bg-slate-900 p-2 focus-within:border-indigo-500">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded bg-slate-800 py-0.5 pl-2 pr-1 text-xs text-slate-200">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="rounded p-0.5 text-slate-400 hover:text-red-400"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-slate-100 outline-none placeholder:text-slate-500"
      />
    </div>
  );
}