"use client";

import { Plus } from "lucide-react";
import { inputCls } from "@/components/admin/forms/Field";
import RowControls from "@/components/admin/forms/RowControls";

// fields: [{ key, label, placeholder?, multiline?, maxLength? }]
export default function RowsEditor({ value, onChange, fields, itemLabel = "Item", addLabel = "Add row", max = 20 }) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));
  const update = (i, key, text) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, [key]: text } : row)));
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
      {value.length === 0 && <p className="text-sm text-slate-500">Nothing added yet.</p>}
      {value.map((row, i) => (
        <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {itemLabel} {i + 1}
            </span>
            <RowControls index={i} count={value.length} onMove={move} onRemove={remove} label={`${itemLabel} ${i + 1}`} />
          </div>
          <div className="flex flex-col gap-2">
            {fields.map((f) => {
              const props = {
                value: row[f.key] ?? "",
                onChange: (e) => update(i, f.key, e.target.value),
                placeholder: f.placeholder,
                maxLength: f.maxLength,
                className: inputCls,
              };
              return (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">{f.label}</span>
                  {f.multiline ? <textarea rows={2} {...props} /> : <input type="text" {...props} />}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, blank()])}
        disabled={value.length >= max}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
      >
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}