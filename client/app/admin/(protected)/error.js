"use client";

import { useEffect } from "react";

// Keeps the admin sidebar working even if one admin page crashes.
export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-5 text-sm text-red-200">
      <p className="font-medium">This page crashed.</p>
      <p className="text-red-300/80">Your data is safe. Try again, or pick another page from the menu.</p>
      <button type="button" onClick={() => reset()} className="rounded-md bg-red-900 px-3 py-1.5 hover:bg-red-800">
        Try again
      </button>
    </div>
  );
}