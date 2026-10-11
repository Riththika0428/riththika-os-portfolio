const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Credentialed requests so the HTTP-only cookie is sent and received.
// Never throws; always returns { data, error, status }.
export async function adminFetch(path, options = {}) {
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
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