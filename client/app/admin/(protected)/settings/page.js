"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import Field, { inputCls } from "@/components/admin/forms/Field";

const card = "rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{5,30}$/;
const URL_RE = /^https?:\/\/[^\s/$.?#][^\s]*$/i;

const toForm = (d) => ({
  email: d?.email ?? "",
  phone: d?.phone ?? "",
  location: d?.location ?? "",
  github: d?.github ?? "",
  linkedin: d?.linkedin ?? "",
  role: d?.role ?? "",
  badge: d?.badge ?? "",
  available: d?.available ?? true,
  availabilityText: d?.availabilityText ?? "",
});
const toPayload = (f) => ({
  email: f.email.trim(),
  phone: f.phone.trim(),
  location: f.location.trim(),
  github: f.github.trim(),
  linkedin: f.linkedin.trim(),
  role: f.role.trim(),
  badge: f.badge.trim(),
  available: Boolean(f.available),
  availabilityText: f.availabilityText.trim(),
});

function validate(p) {
  const e = {};
  if (p.email && !EMAIL_RE.test(p.email)) e.email = "Enter a valid email address.";
  if (p.phone && !PHONE_RE.test(p.phone)) e.phone = "Use digits, spaces, + ( ) and - only.";
  if (p.github && !URL_RE.test(p.github)) e.github = "Must be a full URL, like https://github.com/your-name.";
  if (p.linkedin && !URL_RE.test(p.linkedin)) e.linkedin = "Must be a full URL, like https://www.linkedin.com/in/your-name.";
  if (!p.role) e.role = "Role is required.";
  return e;
}

export default function AdminSettingsPage() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let active = true;
    adminFetch("/site-settings").then(({ data, error }) => {
      if (!active) return;
      if (error) return setLoadError(error);
      const f = toForm(data);
      setForm(f);
      setBaseline(JSON.stringify(toPayload(f)));
      setLoadError("");
    });
    return () => { active = false; };
  }, [attempt]);

  const dirty = useMemo(() => form !== null && JSON.stringify(toPayload(form)) !== baseline, [form, baseline]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save() {
    setServerError("");
    const payload = toPayload(form);
    const found = validate(payload);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    const { data, error } = await adminFetch("/site-settings", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (error || !data) return setServerError(error || "The server didn't return the saved settings.");

    const f = toForm(data);
    setForm(f);
    setBaseline(JSON.stringify(toPayload(f)));
    toast.success("Settings saved.");
  }

  if (loadError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
        <p>Couldn&apos;t load settings: {loadError}</p>
        <button onClick={() => { setLoadError(""); setAttempt((a) => a + 1); }} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
      </div>
    );
  }
  if (!form) return <div className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" aria-label="Loading settings" />;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold">Contact &amp; profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your contact details, social links and the short profile text in the sidebar. Anything you leave empty is hidden on the public site.
        </p>
      </div>

      {serverError && <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{serverError}</div>}

      <section className={card} aria-labelledby="set-contact">
        <h2 id="set-contact" className="text-lg font-medium">Contact details</h2>
        <p className="text-sm text-slate-400">Shown on the Contact page. Visitors can see these, so only add what you want public.</p>
        <Field label="Email" htmlFor="set-email" error={errors.email}>
          <input id="set-email" type="email" maxLength={120} value={form.email} onChange={set("email")} className={inputCls} autoComplete="off" />
        </Field>
        <Field label="Phone" htmlFor="set-phone" error={errors.phone} hint="Optional. For example +94 77 123 4567.">
          <input id="set-phone" type="tel" maxLength={30} value={form.phone} onChange={set("phone")} className={inputCls} autoComplete="off" />
        </Field>
        <Field label="Location" htmlFor="set-location">
          <input id="set-location" type="text" maxLength={80} value={form.location} onChange={set("location")} className={inputCls} />
        </Field>
      </section>

      <section className={card} aria-labelledby="set-social">
        <h2 id="set-social" className="text-lg font-medium">Social links</h2>
        <p className="text-sm text-slate-400">Shown on the Contact page and as icons at the bottom of the sidebar.</p>
        <Field label="GitHub" htmlFor="set-github" error={errors.github} hint="The full link to your profile.">
          <input id="set-github" type="url" maxLength={300} value={form.github} onChange={set("github")} placeholder="https://github.com/…" className={inputCls} />
        </Field>
        <Field label="LinkedIn" htmlFor="set-linkedin" error={errors.linkedin} hint="The full link to your profile.">
          <input id="set-linkedin" type="url" maxLength={300} value={form.linkedin} onChange={set("linkedin")} placeholder="https://www.linkedin.com/in/…" className={inputCls} />
        </Field>
      </section>

      <section className={card} aria-labelledby="set-sidebar">
        <h2 id="set-sidebar" className="text-lg font-medium">Sidebar profile</h2>
        <Field label="Role" htmlFor="set-role" required error={errors.role} hint="Shown under your name.">
          <input id="set-role" type="text" maxLength={100} value={form.role} onChange={set("role")} className={inputCls} />
        </Field>
        <Field label="Badge" htmlFor="set-badge" hint="Optional small label, for example your degree. Leave empty to hide it.">
          <input id="set-badge" type="text" maxLength={60} value={form.badge} onChange={set("badge")} className={inputCls} />
        </Field>
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} className="size-4 accent-indigo-500" />
          Show the availability line
        </label>
        <Field label="Availability text" htmlFor="set-availability" hint="For example “Available for opportunities”.">
          <input id="set-availability" type="text" maxLength={60} value={form.availabilityText} onChange={set("availabilityText")} disabled={!form.available} className={`${inputCls} disabled:opacity-50`} />
        </Field>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/90 px-6 py-3 backdrop-blur">
        {dirty && <span className="mr-auto text-sm text-amber-300">You have unsaved changes.</span>}
        <button type="button" onClick={save} disabled={saving || !dirty} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}