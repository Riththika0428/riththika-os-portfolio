"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import Field, { inputCls } from "@/components/admin/forms/Field";
import { adminFetch } from "@/lib/adminApi";
import { LEVEL_OPTIONS } from "@/lib/skillOptions";

export default function ProficiencyModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [label, setLabel] = useState(item?.label ?? "");
  const [level, setLevel] = useState(item?.level ?? 3);
  const [labelError, setLabelError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!label.trim()) return setLabelError("Name is required.");
    setLabelError("");

    setSaving(true);
    const { data, error } = await adminFetch(
      isEdit ? `/skills/proficiencies/${item._id}` : "/skills/proficiencies",
      { method: isEdit ? "PUT" : "POST", body: JSON.stringify({ label: label.trim(), level: Number(level) }) }
    );
    setSaving(false);

    if (error || !data?.item) return setError(error || "The server didn't return the saved skill.");
    onSaved(data.item, !isEdit);
  }

  return (
    <Modal title={isEdit ? "Edit proficiency" : "Add proficiency"} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div>
        )}

        <Field label="Skill name" htmlFor="prof-label" required error={labelError} hint="Use the exact name (for example React) so its logo appears.">
          <input id="prof-label" type="text" maxLength={60} value={label} onChange={(e) => setLabel(e.target.value)} className={inputCls} autoFocus />
        </Field>

        <Field label="Level" htmlFor="prof-level" hint="Your own assessment. The site notes that it isn't a certification.">
          <select id="prof-level" value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
            {LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label} ({o.value}/5)</option>
            ))}
          </select>
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-60">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add skill"}
          </button>
        </div>
      </form>
    </Modal>
  );
}