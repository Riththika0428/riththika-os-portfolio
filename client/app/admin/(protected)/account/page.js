"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Field, { inputCls } from "@/components/admin/forms/Field";

const card = "rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4";
const MIN = 12;

function check(f) {
  const e = {};
  if (!f.current) e.current = "Enter your current password.";
  if (f.next.length < MIN) e.next = `Use at least ${MIN} characters.`;
  else if (new TextEncoder().encode(f.next).length > 72) e.next = "That is too long (72 bytes max).";
  else if (f.next === f.current) e.next = "Must be different from the current password.";
  if (f.confirm !== f.next) e.confirm = "The two passwords don't match.";
  return e;
}

export default function AdminAccountPage() {
  const toast = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [askAll, setAskAll] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function changePassword(e) {
    e.preventDefault();
    const found = check(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    const { error } = await adminFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
    });
    setSaving(false);
    if (error) {
      setErrors({ current: error.toLowerCase().includes("current") ? error : "", form: error });
      return toast.error(error);
    }
    setForm({ current: "", next: "", confirm: "" });
    setErrors({});
    toast.success("Password changed. Other devices were signed out.");
  }

  async function signOutEverywhere() {
    setLeaving(true);
    const { error } = await adminFetch("/auth/logout-all", { method: "POST" });
    if (error) {
      setLeaving(false);
      setAskAll(false);
      return toast.error(error);
    }
    // The cookie is gone, so the protected layout sends you to the login screen.
    window.location.assign("/admin");
  }

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Account &amp; security</h1>
        <p className="mt-1 text-sm text-slate-400">Change your admin password or sign out of every device.</p>
      </div>

      <form onSubmit={changePassword} noValidate className={card}>
        <h2 className="text-lg font-semibold">Change password</h2>
        <Field label="Current password" htmlFor="pw-current" error={errors.current}>
          <input id="pw-current" type="password" autoComplete="current-password" className={inputCls} value={form.current} onChange={set("current")} />
        </Field>
        <Field label="New password" htmlFor="pw-new" hint={`At least ${MIN} characters. A few random words works well.`} error={errors.next}>
          <input id="pw-new" type="password" autoComplete="new-password" className={inputCls} value={form.next} onChange={set("next")} />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm}>
          <input id="pw-confirm" type="password" autoComplete="new-password" className={inputCls} value={form.confirm} onChange={set("confirm")} />
        </Field>
        <p className="text-xs text-slate-500">You stay signed in here. Every other device is signed out.</p>
        <div>
          <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
            {saving ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>

      <section className={card}>
        <h2 className="text-lg font-semibold">Sign out everywhere</h2>
        <p className="text-sm text-slate-400">
          Ends every admin login, including this one. Use it if you used a shared computer or think someone else has access.
        </p>
        <div>
          <button type="button" onClick={() => setAskAll(true)} className="rounded-md border border-red-900 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-950/40">
            Sign out of all devices
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={askAll}
        title="Sign out everywhere?"
        message="You will be signed out here too and need to log in again."
        confirmLabel="Sign out everywhere"
        busy={leaving}
        onConfirm={signOutEverywhere}
        onCancel={() => setAskAll(false)}
      />
    </div>
  );
}