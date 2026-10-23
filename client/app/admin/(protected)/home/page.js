"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import Field, { inputCls } from "@/components/admin/forms/Field";
import CoverImageField from "@/components/admin/forms/CoverImageField";
import HighlightsEditor from "@/components/admin/home/HighlightsEditor";

const card = "rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4";
const toForm = (d) => ({
  name: d?.name ?? "",
  role: d?.role ?? "",
  tagline: d?.tagline ?? "",
  heroImage: d?.heroImage ?? "",
  heroImageAlt: d?.heroImageAlt ?? "",
  closingMessage: d?.closingMessage ?? "Ready to build.",
  highlights: (d?.highlights ?? []).map((h) => ({ title: h.title ?? "", description: h.description ?? "", icon: h.icon ?? "Sparkles", href: h.href ?? "" })),
});
const isSitePath = (v) => v.startsWith("/") && !v.startsWith("//");
const isHttp = (v) => /^https?:\/\/\S+$/i.test(v);
const toPayload = (f) => ({
  name: f.name.trim(),
  role: f.role.trim(),
  tagline: f.tagline.trim(),
  heroImage: f.heroImage.trim(),
  heroImageAlt: f.heroImageAlt.trim(),
  closingMessage: f.closingMessage.trim(),
  highlights: f.highlights.map((h) => ({ title: h.title.trim(), description: h.description.trim(), icon: h.icon, href: h.href.trim() })),
});

export default function AdminHomePage() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let active = true;
    adminFetch("/home").then(({ data, error }) => {
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
    const found = {};
    if (!payload.name) found.name = "Name is required.";
    if (!payload.role) found.role = "Role is required.";
    if (!payload.tagline) found.tagline = "Tagline is required.";
    if (!payload.closingMessage) found.closingMessage = "Closing message is required.";
    payload.highlights.forEach((h, i) => {
      if (!h.title) found[`${i}.title`] = "Title is required.";
      if (!isSitePath(h.href) && !isHttp(h.href)) found[`${i}.href`] = "Use a site path like /projects or a full https:// link.";
    });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    const { data, error } = await adminFetch("/home", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (error || !data) return setServerError(error || "The server didn't return the saved content.");

    const f = toForm(data);
    setForm(f);
    setBaseline(JSON.stringify(toPayload(f)));
    toast.success("Home page saved.");
  }

  if (loadError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
        <p>Couldn&apos;t load Home content: {loadError}</p>
        <button onClick={() => { setLoadError(""); setAttempt((a) => a + 1); }} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">Retry</button>
      </div>
    );
  }
  if (!form) return <div className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" aria-label="Loading Home content" />;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold">Home</h1>
        <p className="mt-1 text-sm text-slate-400">Edit the hero text and the 3D image shown on the public Home page.</p>
      </div>

      {serverError && <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{serverError}</div>}

      <section className={card} aria-labelledby="home-hero">
        <h2 id="home-hero" className="text-lg font-medium">Hero text</h2>
        <Field label="Name" htmlFor="home-name" required error={errors.name} hint='Shown as "Hi, I&apos;m …".'>
          <input id="home-name" type="text" maxLength={60} value={form.name} onChange={set("name")} className={inputCls} />
        </Field>
        <Field label="Role" htmlFor="home-role" required error={errors.role}>
          <input id="home-role" type="text" maxLength={100} value={form.role} onChange={set("role")} className={inputCls} />
        </Field>
        <Field label="Tagline" htmlFor="home-tagline" required error={errors.tagline}>
          <textarea id="home-tagline" rows={3} maxLength={300} value={form.tagline} onChange={set("tagline")} className={inputCls} />
        </Field>
      </section>

      <section className={card} aria-labelledby="home-image">
        <h2 id="home-image" className="text-lg font-medium">3D image</h2>
        <p className="text-sm text-slate-400">Shown beside the hero. With no image, the hero uses the full width.</p>
        <Field label="Image" htmlFor="cover-upload">
          <CoverImageField
            value={form.heroImage}
            onChange={(heroImage) => setForm((f) => ({ ...f, heroImage }))}
            onBusyChange={setUploading}
            label="3D image"
            short="image"
            hint="A square or portrait image on a transparent or dark background works best."
          />
        </Field>
        <Field label="Image description" htmlFor="home-alt" hint="Optional. Read aloud by screen readers.">
          <input id="home-alt" type="text" maxLength={160} value={form.heroImageAlt} onChange={set("heroImageAlt")} className={inputCls} />
        </Field>
      </section>

      <section className={card} aria-labelledby="home-cards">
        <h2 id="home-cards" className="text-lg font-medium">Highlight cards</h2>
        <p className="text-sm text-slate-400">The small cards under the hero (up to 8). Remove them all to hide the row.</p>
        <HighlightsEditor value={form.highlights} onChange={(highlights) => setForm((f) => ({ ...f, highlights }))} errors={errors} />
      </section>

      <section className={card} aria-labelledby="home-terminal">
        <h2 id="home-terminal" className="text-lg font-medium">Closing terminal</h2>
        <Field label="Closing line" htmlFor="home-closing" required error={errors.closingMessage} hint="The message printed at the bottom of the Home page.">
          <input id="home-closing" type="text" maxLength={120} value={form.closingMessage} onChange={set("closingMessage")} className={inputCls} />
        </Field>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/90 px-6 py-3 backdrop-blur">
        {dirty && <span className="mr-auto text-sm text-amber-300">You have unsaved changes.</span>}
        <button type="button" onClick={save} disabled={saving || uploading || !dirty} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}