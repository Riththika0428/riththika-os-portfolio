"use client";

import { Plus } from "lucide-react";
import { inputCls } from "@/components/admin/forms/Field";
import RowControls from "@/components/admin/forms/RowControls";

export const HIGHLIGHT_ICONS = ["Layout", "Server", "PenTool", "Rocket", "Code2", "Database", "Wrench", "Sparkles"];
const MAX = 8;

/** The small cards under the hero on the Home page. value: [{ title, description, icon, href }] */
export default function HighlightsEditor({ value, onChange, errors = {} }) {
  const update = (i, key, text) => onChange(value.map((row, idx) => (idx === i ? { ...row, [key]: text } : row)));
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 && <p className="text-sm text-slate-500">No cards. The row is hidden on the Home page.</p>}
      {value.map((row, i) => (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Card {i + 1}</span>
            <RowControls index={i} count={value.length} onMove={move} onRemove={remove} label={`card ${i + 1}`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Title</span>
              <input type="text" value={row.title} maxLength={60} onChange={(e) => update(i, "title", e.target.value)} className={inputCls} aria-label={`Card ${i + 1} title`} />
              {errors[`${i}.title`] && <span role="alert" className="text-xs text-red-400">{errors[`${i}.title`]}</span>}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Description</span>
              <textarea rows={2} value={row.description} maxLength={160} onChange={(e) => update(i, "description", e.target.value)} className={inputCls} aria-label={`Card ${i + 1} description`} />
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Icon</span>
                <select value={row.icon} onChange={(e) => update(i, "icon", e.target.value)} className={inputCls} aria-label={`Card ${i + 1} icon`}>
                  {HIGHLIGHT_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Link</span>
                <input type="text" value={row.href} maxLength={300} onChange={(e) => update(i, "href", e.target.value)} placeholder="/projects or https://…" className={inputCls} aria-label={`Card ${i + 1} link`} />
                {errors[`${i}.href`] && <span role="alert" className="text-xs text-red-400">{errors[`${i}.href`]}</span>}
              </label>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { title: "", description: "", icon: "Sparkles", href: "/projects" }])}
        disabled={value.length >= MAX}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
      >
        <Plus className="size-4" /> Add card
      </button>
    </div>
  );
}