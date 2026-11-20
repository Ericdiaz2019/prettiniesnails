import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #be6bd1 0%, #9b48b5 100%)",
          color: "#ffffff",
          fontSize: "20px",
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        P
      </div>
    ),
    { ...size },
  )
}
