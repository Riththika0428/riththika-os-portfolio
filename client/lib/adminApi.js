const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://riththika-os-portfolio-vyx4-g3qibnc5w.vercel.app/admin/login";

// Credentialed requests so the HTTP-only cookie is sent and received.
// Never throws; always returns { data, error, status }.
export async function adminFetch(path, options = {}) {
  try {
    // For FormData (file uploads) the browser must set Content-Type itself,
    // because it has to add the multipart boundary. Everything else is JSON.
    const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
    const res = await fetch(`${BASE}/api${path}`, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        "X-Requested-With": "riththika-admin", // CSRF guard header (see Phase 9)
        ...(options.headers || {}),
      },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { data: null, error: json?.message || `Request failed (${res.status})`, status: res.status };
    }
    return { data: json?.data ?? null, error: null, status: res.status };
  } catch {
    return { data: null, error: "Cannot reach the server.", status: 0 };
  }
}