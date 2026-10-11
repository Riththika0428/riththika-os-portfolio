"use client";

import { Plus } from "lucide-react";
import { inputCls } from "@/components/admin/forms/Field";
import RowControls from "@/components/admin/forms/RowControls";

export default function StringListEditor({
  value,
  onChange,
  label,
  placeholder,
  addLabel = "Add item",
  multiline = false,
  max = 30,
  maxLength = 300,
}) {
  const update = (i, text) => onChange(value.map((v, idx) => (idx === i ? text : v)));
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 && <p className="text-sm text-slate-500">Nothing added yet.</p>}
      {value.map((item, i) => {
        const props = {
          value: item,
          onChange: (e) => update(i, e.target.value),
          placeholder,
          maxLength,
          "aria-label": `${label} ${i + 1}`,
          className: inputCls,
        };
        return (
          <div key={i} className="flex items-start gap-2">
            {multiline ? <textarea rows={2} {...props} /> : <input type="text" {...props} />}
            <RowControls index={i} count={value.length} onMove={move} onRemove={remove} label={`${label} ${i + 1}`} />
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        disabled={value.length >= max}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
      >
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}