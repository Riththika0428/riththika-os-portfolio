import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const btn =
  "inline-flex size-7 items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent";

export default function RowControls({ index, count, onMove, onRemove, label }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${label} up`} className={btn}>
        <ChevronUp className="size-4" />
      </button>
      <button type="button" onClick={() => onMove(index, 1)} disabled={index === count - 1} aria-label={`Move ${label} down`} className={btn}>
        <ChevronDown className="size-4" />
      </button>
      <button type="button" onClick={() => onRemove(index)} aria-label={`Remove ${label}`} className={`${btn} hover:border-red-800 hover:text-red-400`}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}