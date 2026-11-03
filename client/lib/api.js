// const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://riththika-os-portfolio-vyx4.vercel.app/";

// async function request(path, options) {
//   try {
//     const res = await fetch(`${BASE}/api${path}`, options);
//     const json = await res.json().catch(() => null);
//     if (!res.ok) {
//       return { data: null, error: json?.message || `Request failed (${res.status})`, status: res.status };
//     }
//     return { data: json?.data ?? null, error: null, status: res.status };
//   } catch {
//     return { data: null, error: "Cannot reach the server.", status: 0 };
//   }
// }

// // no-store: admin edits appear on the next page load, no rebuild needed.
// export function apiGet(path, { revalidate = 0 } = {}) {
//   return request(path, revalidate ? { next: { revalidate } } : { cache: "no-store" });
// }

// export function apiPost(path, body) {
//   return request(path, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });
// }


const API_ORIGIN = new URL(
  process.env.NEXT_PUBLIC_API_URL ||
    "https://riththika-os-portfolio-vyx4.vercel.app"
).origin;

function buildUrl(path) {
  const cleanPath = String(path)
    .replace(/^\/+/, "")
    .replace(/^api\/+/, "");

  return `${API_ORIGIN}/api/${cleanPath}`;
}

async function request(path, options = {}) {
  try {
    const res = await fetch(buildUrl(path), options);
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: json?.message || `Request failed (${res.status})`,
        status: res.status,
      };
    }

    return {
      data: json?.data ?? null,
      error: null,
      status: res.status,
    };
  } catch {
    return {
      data: null,
      error: "Cannot reach the server.",
      status: 0,
    };
  }
}

// One quick retry on a network failure or a 5xx, so a cold-starting API doesn't show an error page.
export async function apiGet(path, { revalidate = 0 } = {}) {
  const options = revalidate ? { next: { revalidate } } : { cache: "no-store" };
  const first = await request(path, options);
  if (first.status !== 0 && first.status < 500) return first;
  await new Promise((resolve) => setTimeout(resolve, 600));
  return request(path, options);
}

export function apiPost(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
