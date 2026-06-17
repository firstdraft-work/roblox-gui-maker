import { ImageResponse } from "next/og";

export const alt =
  "Roblox GUI Maker — build Roblox UIs visually, export clean Luau";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #141a2e, #0c0e17)",
          padding: 80,
          color: "#e1e1ef",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "#00a2ff",
            color: "#001d34",
            fontSize: 44,
            fontWeight: 800,
            marginBottom: 28,
          }}
        >
          R
        </div>
        <div style={{ fontSize: 78, fontWeight: 800, letterSpacing: -2 }}>
          Roblox GUI Maker
        </div>
        <div style={{ fontSize: 32, color: "#99cbff", marginTop: 16 }}>
          Drag, drop, export clean Luau
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 44,
            fontSize: 24,
            color: "#bec7d4",
          }}
        >
          <span>Free</span>
          <span>No login</span>
          <span>Real Roblox properties</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
