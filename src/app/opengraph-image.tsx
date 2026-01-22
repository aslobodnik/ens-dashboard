import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ENS Wallets - DAO Treasury Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #faf9f7 0%, #f0ebe5 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Decorative top border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #1e3a5f 0%, #4a90d9 50%, #1e3a5f 100%)",
          }}
        />

        {/* Classical pillar icon */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "24px",
                height: "80px",
                background: "linear-gradient(180deg, #1e3a5f 0%, #2d4a6f 100%)",
                borderRadius: "4px",
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#1e3a5f",
              letterSpacing: "-2px",
            }}
          >
            ENS Wallets
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#5a6a7a",
              marginTop: "16px",
            }}
          >
            DAO Treasury Dashboard
          </div>
        </div>

        {/* Decorative bottom border */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #1e3a5f 0%, #4a90d9 50%, #1e3a5f 100%)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
