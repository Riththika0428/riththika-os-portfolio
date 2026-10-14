"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, X } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/dates";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const LABELS = { "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WebP" };

const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const btn = "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm disabled:opacity-50";

/** Profile photo manager. Uploads happen immediately and are separate from the About form's Save button. */
export default function ProfileImageUploader() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [meta, setMeta] = useState(undefined); // undefined = loading, {exists:false} = none
  const [loadError, setLoadError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let active = true;
    adminFetch("/profile-image/meta").then(({ data, error }) => {
      if (!active) return;
      if (error) setLoadError(error);
      else setMeta(data?.exists ? data : { exists: false });
    });
    return () => {
      active = false;
    };
  }, []);

  // free the temporary preview URL whenever it is replaced or the component goes away
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  function clearChoice() {
    setFile(null);
    setPreview("");
    setProblem("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function onPick(e) {
    const picked = e.target.files?.[0];
    if (!picked) return clearChoice();
    if (!TYPES.includes(picked.type)) {
      clearChoice();
      return setProblem("Choose a JPG, PNG or WebP image.");
    }
    if (picked.size > MAX_BYTES) {
      clearChoice();
      return setProblem(`That image is ${kb(picked.size)}. The maximum is 2 MB.`);
    }
    setProblem("");
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setProblem("");
    const form = new FormData();
    form.append("image", file); // the server expects the field name "image"
    const { data, error } = await adminFetch("/profile-image", { method: "PUT", body: form });
    setBusy(false);
    if (error || !data) return setProblem(error || "The server didn't confirm the upload.");
    setMeta(data);
    setBroken(false);
    clearChoice();
    toast.success("Profile photo updated.");
  }

  async function remove() {
    setBusy(true);
    const { error } = await adminFetch("/profile-image", { method: "DELETE" });
    setBusy(false);
    setConfirming(false);
    if (error) return toast.error(error);
    setMeta({ exists: false });
    toast.success("Profile photo removed.");
  }

  const current = meta?.exists && !broken ? `${API}/api/profile-image?v=${new Date(meta.updatedAt).getTime()}` : "";
  const shown = preview || current;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4" aria-labelledby="about-photo">
      <div>
        <h2 id="about-photo" className="font-medium">Profile photo</h2>
        <p className="text-xs text-slate-500">
          Shown in the sidebar and on the About page. JPG, PNG or WebP, up to 2 MB. A square photo works best.
          Changes here are saved straight away.
        </p>
      </div>

      {loadError ? (
        <p role="alert" className="text-sm text-red-300">Couldn&apos;t load the current photo: {loadError}</p>
      ) : meta === undefined ? (
        <div className="size-24 animate-pulse rounded-full bg-slate-800" aria-label="Loading profile photo" />
      ) : (
        <div className="flex flex-wrap items-center gap-5">
          <div className="size-24 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 grid place-items-center text-xs text-slate-500">
            {shown ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shown}
                alt={preview ? "Selected photo preview" : "Current profile photo"}
                className="size-full object-cover"
                onError={() => !preview && setBroken(true)}
              />
            ) : (
              "No photo"
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="text-sm text-slate-400">
              {file
                ? `Selected: ${file.name} (${LABELS[file.type]}, ${kb(file.size)}). Not uploaded yet.`
                : meta.exists
                  ? `${LABELS[meta.contentType] ?? "Image"} · ${kb(meta.size)} · updated ${formatDateTime(meta.updatedAt)}`
                  : "No photo uploaded. The site shows your initials."}
            </p>

            <input
              ref={inputRef}
              id="profile-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPick}
              disabled={busy}
              aria-label="Choose profile photo"
              className="block w-full max-w-sm text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200 hover:file:bg-slate-700"
            />

            {problem && <p role="alert" className="text-sm text-red-300">{problem}</p>}

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={upload} disabled={!file || busy} className={`${btn} bg-indigo-600 font-medium text-white hover:bg-indigo-500`}>
                <Upload className="size-4" /> {busy && file ? "Uploading…" : meta.exists ? "Replace photo" : "Upload photo"}
              </button>
              {file && (
                <button type="button" onClick={clearChoice} disabled={busy} className={`${btn} bg-slate-800 text-slate-200 hover:bg-slate-700`}>
                  <X className="size-4" /> Cancel
                </button>
              )}
              {meta.exists && !file && (
                <button type="button" onClick={() => setConfirming(true)} disabled={busy} className={`${btn} border border-red-900 text-red-300 hover:bg-red-950/40`}>
                  <Trash2 className="size-4" /> Remove photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Remove profile photo?"
        message="The site will go back to showing your initials."
        confirmLabel="Remove"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </section>
  );
}