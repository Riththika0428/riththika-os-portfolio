import { ImageResponse } from "next/og";

export const alt = "Riththika OS — a developer operating system";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: 80, background: "#070b14", color: "#e2e8f0", fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#ef4444" }} />
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#eab308" }} />
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#22c55e" }} />
        </div>
        <div style={{ fontSize: 30, color: "#22d3ee" }}>$ whoami</div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 16 }}>Riththika Baskaran</div>
        <div style={{ fontSize: 40, color: "#94a3b8", marginTop: 16 }}>Full Stack Developer · MERN</div>
        <div style={{ fontSize: 28, color: "#6366f1", marginTop: 48 }}>Riththika OS — a developer operating system</div>
      </div>
    ),
    size
  );
}