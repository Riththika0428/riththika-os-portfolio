"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import Field, { inputCls } from "@/components/admin/forms/Field";
import TagInput from "@/components/admin/forms/TagInput";
import { adminFetch } from "@/lib/adminApi";
import { EDUCATION_STATUS_OPTIONS } from "@/lib/educationOptions";

const MONTH_RE = /^(\d{4}-(0[1-9]|1[0-2]))?$/;

function validate(v) {
  const e = {};
  if (!v.institution.trim()) e.institution = "Institution is required.";
  if (!v.degree.trim()) e.degree = "Degree is required.";
  const start = v.startDate.trim();
  const end = v.endDate.trim();
  if (!MONTH_RE.test(start)) e.startDate = "Use YYYY-MM, for example 2024-03.";
  if (!MONTH_RE.test(end)) e.endDate = "Use YYYY-MM, for example 2026-09.";
  if (!e.startDate && !e.endDate && start && end && end < start) {
    e.endDate = "End date can't be before the start date.";
  }
  return e;
}

export default function EducationModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [values, setValues] = useState({
    institution: item?.institution ?? "",
    degree: item?.degree ?? "",
    tag: item?.tag ?? "",
    status: item?.status ?? "Currently Studying",
    startDate: item?.startDate ?? "",
    endDate: item?.endDate ?? "",
    description: item?.description ?? "",
    subjects: item?.subjects ?? [],
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    const payload = {
      institution: values.institution.trim(),
      degree: values.degree.trim(),
      tag: values.tag.trim(),
      status: values.status,
      startDate: values.startDate.trim(),
      endDate: values.endDate.trim(),
      description: values.description.trim(),
      subjects: values.subjects,
    };
    const { data, error } = await adminFetch(isEdit ? `/education/${item._id}` : "/education", {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (error || !data?.entry) return setError(error || "The server didn't return the saved entry.");
    onSaved(data.entry, !isEdit);
  }

  return (
    <Modal title={isEdit ? "Edit entry" : "Add entry"} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div>
        )}

        <Field label="Institution" htmlFor="edu-institution" required error={errors.institution}>
          <input id="edu-institution" type="text" maxLength={120} value={values.institution} onChange={set("institution")} placeholder="e.g. University of Moratuwa" className={inputCls} autoFocus />
        </Field>

        <Field label="Degree" htmlFor="edu-degree" required error={errors.degree}>
          <input id="edu-degree" type="text" maxLength={160} value={values.degree} onChange={set("degree")} placeholder="e.g. Bachelor of Information Technology" className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="edu-status" hint="Sets the badge colour on the site.">
            <select id="edu-status" value={values.status} onChange={set("status")} className={inputCls}>
              {EDUCATION_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Small label" htmlFor="edu-tag" hint='Optional. Shown above the title, e.g. "DEGREE PROGRAM // 01".'>
            <input id="edu-tag" type="text" maxLength={60} value={values.tag} onChange={set("tag")} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start" htmlFor="edu-start" error={errors.startDate} hint="Month and year (optional).">
            <input id="edu-start" type="month" placeholder="YYYY-MM" value={values.startDate} onChange={set("startDate")} className={inputCls} />
          </Field>
          <Field label="End" htmlFor="edu-end" error={errors.endDate} hint="Leave empty if ongoing.">
            <input id="edu-end" type="month" placeholder="YYYY-MM" value={values.endDate} onChange={set("endDate")} className={inputCls} />
          </Field>
        </div>

        <Field label="Description" htmlFor="edu-description">
          <textarea id="edu-description" rows={4} maxLength={1000} value={values.description} onChange={set("description")} className={inputCls} />
        </Field>

        <Field label="Subjects / coursework" htmlFor="edu-subjects" hint="Press Enter or comma to add.">
          <TagInput id="edu-subjects" value={values.subjects} onChange={(subjects) => setValues((v) => ({ ...v, subjects }))} placeholder="Databases, Networking…" />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-60">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add entry"}
          </button>
        </div>
      </form>
    </Modal>
  );
}