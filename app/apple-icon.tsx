import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "36px",
          background: "linear-gradient(135deg, #be6bd1 0%, #8f3fa8 100%)",
          color: "#ffffff",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: "96px", fontWeight: 700, lineHeight: 1 }}>P</div>
        <div
          style={{
            fontSize: "18px",
            fontFamily: "sans-serif",
            letterSpacing: "0.14em",
            marginTop: "6px",
            opacity: 0.92,
          }}
        >
          NAILS
        </div>
      </div>
    ),
    { ...size },
  )
}
