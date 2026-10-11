const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path, options) {
  try {
    const res = await fetch(`${BASE}/api${path}`, options);
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { data: null, error: json?.message || `Request failed (${res.status})`, status: res.status };
    }
    return { data: json?.data ?? null, error: null, status: res.status };
  } catch {
    return { data: null, error: "Cannot reach the server.", status: 0 };
  }
}

// no-store: admin edits appear on the next page load, no rebuild needed.
export function apiGet(path, { revalidate = 0 } = {}) {
  return request(path, revalidate ? { next: { revalidate } } : { cache: "no-store" });
}

export function apiPost(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}