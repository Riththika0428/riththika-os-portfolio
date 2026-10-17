"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import Field, { inputCls } from "@/components/admin/forms/Field";
import TagInput from "@/components/admin/forms/TagInput";
import { adminFetch } from "@/lib/adminApi";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const isHttpUrl = (s) => /^https?:\/\/\S+$/i.test(s);

function validate(v) {
  const e = {};
  if (!v.title.trim()) e.title = "Certification name is required.";
  if (!v.issuer.trim()) e.issuer = "Issuer is required.";
  const issued = v.issueDate.trim();
  const expiry = v.expiryDate.trim();
  if (!issued) e.issueDate = "Issue date is required.";
  else if (!MONTH_RE.test(issued)) e.issueDate = "Use YYYY-MM, for example 2026-03.";
  if (expiry && !MONTH_RE.test(expiry)) e.expiryDate = "Use YYYY-MM, for example 2029-03.";
  if (!e.issueDate && !e.expiryDate && issued && expiry && expiry < issued) {
    e.expiryDate = "Expiry can't be before the issue date.";
  }
  const url = v.credentialUrl.trim();
  if (url && !isHttpUrl(url)) e.credentialUrl = "Must be a full http(s) URL.";
  return e;
}

export default function CertificationModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [values, setValues] = useState({
    title: item?.title ?? "",
    issuer: item?.issuer ?? "",
    issueDate: item?.issueDate ?? "",
    expiryDate: item?.expiryDate ?? "",
    credentialId: item?.credentialId ?? "",
    credentialUrl: item?.credentialUrl ?? "",
    description: item?.description ?? "",
    skills: item?.skills ?? [],
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
      title: values.title.trim(),
      issuer: values.issuer.trim(),
      issueDate: values.issueDate.trim(),
      expiryDate: values.expiryDate.trim(),
      credentialId: values.credentialId.trim(),
      credentialUrl: values.credentialUrl.trim(),
      description: values.description.trim(),
      skills: values.skills,
    };
    const { data, error: err } = await adminFetch(isEdit ? `/certifications/${item._id}` : "/certifications", {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (err || !data?.certification) return setError(err || "The server didn't return the saved certification.");
    onSaved(data.certification, !isEdit);
  }

  return (
    <Modal title={isEdit ? "Edit certification" : "Add certification"} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div>
        )}

        <Field label="Certification name" htmlFor="cert-title" required error={errors.title}>
          <input id="cert-title" type="text" maxLength={160} value={values.title} onChange={set("title")} className={inputCls} autoFocus />
        </Field>

        <Field label="Issued by" htmlFor="cert-issuer" required error={errors.issuer} hint="The organisation that awarded it.">
          <input id="cert-issuer" type="text" maxLength={120} value={values.issuer} onChange={set("issuer")} className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Issue date" htmlFor="cert-issued" required error={errors.issueDate} hint="Month and year.">
            <input id="cert-issued" type="month" placeholder="YYYY-MM" value={values.issueDate} onChange={set("issueDate")} className={inputCls} />
          </Field>
          <Field label="Expiry date" htmlFor="cert-expiry" error={errors.expiryDate} hint="Leave empty if it doesn't expire.">
            <input id="cert-expiry" type="month" placeholder="YYYY-MM" value={values.expiryDate} onChange={set("expiryDate")} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Credential ID" htmlFor="cert-credential-id" hint="Optional.">
            <input id="cert-credential-id" type="text" maxLength={120} value={values.credentialId} onChange={set("credentialId")} className={inputCls} />
          </Field>
          <Field label="Credential URL" htmlFor="cert-credential-url" error={errors.credentialUrl} hint="Optional link to verify it.">
            <input id="cert-credential-url" type="text" inputMode="url" value={values.credentialUrl} onChange={set("credentialUrl")} placeholder="https://…" className={inputCls} />
          </Field>
        </div>

        <Field label="Description" htmlFor="cert-description" hint="Optional. What it covers.">
          <textarea id="cert-description" rows={3} maxLength={600} value={values.description} onChange={set("description")} className={inputCls} />
        </Field>

        <Field label="Skills" htmlFor="cert-skills" hint="Optional. Press Enter or comma to add.">
          <TagInput id="cert-skills" value={values.skills} onChange={(skills) => setValues((v) => ({ ...v, skills }))} placeholder="Cloud, Security…" />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-60">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add certification"}
          </button>
        </div>
      </form>
    </Modal>
  );
}