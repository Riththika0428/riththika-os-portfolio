"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await adminFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSubmitting(false);
    if (error) return setError(error);
    router.replace("/admin/dashboard");
  }

  const input =
    "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-widest text-slate-100">RITHTHIKA OS</h1>
          <p className="mt-1 text-xs tracking-widest text-slate-400">ADMIN LOGIN</p>
        </div>

        <label className="block text-sm text-slate-300">
          Email
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 ${input}`} />
        </label>

        <label className="block text-sm text-slate-300">
          Password
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`mt-1 ${input}`} />
        </label>

        {error && <p role="alert" className="rounded bg-red-950/60 px-3 py-2 text-sm text-red-300">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          {submitting ? "Signing in…" : "SIGN IN"}
        </button>
      </form>
    </main>
  );
}