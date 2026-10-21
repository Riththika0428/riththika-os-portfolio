// CLIENT_URL may hold one site or several, comma-separated:
//   CLIENT_URL=https://riththika.dev,https://www.riththika.dev
// Each entry is reduced to its "origin" (scheme + host + port), so a trailing slash
// or a path ("http://localhost:3000/") can't silently break CORS or the CSRF check.
export function parseOrigins(value = "") {
  const items = value.split(",").map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) throw new Error("CLIENT_URL is not set");

  const origins = items.map((item) => {
    let url;
    try {
      url = new URL(item);
    } catch {
      throw new Error(`CLIENT_URL contains an invalid URL: "${item}"`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`CLIENT_URL must start with http:// or https:// (got "${item}")`);
    }
    return url.origin;
  });
  return [...new Set(origins)];
}