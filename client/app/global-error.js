"use client";

// Last line of defence: runs only if the root layout itself crashes.
// It must render its own <html> and <body>, and can't rely on the site's CSS.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#070b14", color: "#e2e8f0", fontFamily: "monospace" }}>
        <div role="alert" style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, margin: 0 }}>something went wrong</h1>
            <p style={{ color: "#94a3b8", marginTop: 12 }}>The site hit an unexpected problem.</p>
            <button
              type="button"
              onClick={() => reset()}
              style={{ marginTop: 20, background: "none", border: "1px solid #22d3ee", color: "#22d3ee", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}
            >
              try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}