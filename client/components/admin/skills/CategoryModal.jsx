"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import Field, { inputCls } from "@/components/admin/forms/Field";
import TagInput from "@/components/admin/forms/TagInput";
import { adminFetch } from "@/lib/adminApi";
import { SKILL_ICON_OPTIONS } from "@/lib/skillOptions";

export default function CategoryModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [title, setTitle] = useState(item?.title ?? "");
  const [icon, setIcon] = useState(item?.icon ?? "Code2");
  const [skills, setSkills] = useState(item?.skills ?? []);
  const [highlight, setHighlight] = useState(Boolean(item?.highlight));
  const [titleError, setTitleError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setTitleError("Title is required.");
    setTitleError("");

    setSaving(true);
    const { data, error } = await adminFetch(
      isEdit ? `/skills/categories/${item._id}` : "/skills/categories",
      { method: isEdit ? "PUT" : "POST", body: JSON.stringify({ title: title.trim(), icon, skills, highlight }) }
    );
    setSaving(false);

    if (error || !data?.item) return setError(error || "The server didn't return the saved category.");
    onSaved(data.item, !isEdit);
  }

  return (
    <Modal title={isEdit ? "Edit category" : "Add category"} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div>
        )}

        <Field label="Title" htmlFor="cat-title" required error={titleError}>
          <input id="cat-title" type="text" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend" className={inputCls} autoFocus />
        </Field>

        <Field label="Icon" htmlFor="cat-icon">
          <select id="cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls}>
            {SKILL_ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Skills" htmlFor="cat-skills" hint="Press Enter or comma to add. Exact names such as React or Node.js show their logo on the site.">
          <TagInput id="cat-skills" value={skills} onChange={setSkills} placeholder="React, Next.js…" />
        </Field>

        <label className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200">
          <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} className="size-4 accent-indigo-500" />
          Highlight as &quot;In Progress&quot; (use for Currently Learning)
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-60">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}