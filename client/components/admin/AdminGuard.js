"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminApi";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let active = true;
    adminFetch("/auth/me").then(({ data, status }) => {
      if (!active) return;
      if (status === 401) return router.replace("/admin/login");
      if (data?.admin) {
        setAdmin(data.admin);
        setState("ready");
      } else {
        setState("error");
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (state === "loading") {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-400">Checking session…</div>;
  }
  if (state === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-300">
        <div className="text-center">
          <p>Can't reach the server.</p>
          <button onClick={() => window.location.reload()} className="mt-3 rounded bg-slate-800 px-4 py-2 hover:bg-slate-700">
            Retry
          </button>
        </div>
      </div>
    );
  }
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}