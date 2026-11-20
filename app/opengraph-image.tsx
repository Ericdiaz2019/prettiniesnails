import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const alt =
  "Prettiness Nails by Amy — Private Nail Studio in Granger, IN serving South Bend, Mishawaka, Elkhart & Goshen"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  let nailPhotoDataUri: string | null = null
  try {
    const fileBuffer = await readFile(join(process.cwd(), "public", "@Prettiness.jpg"))
    nailPhotoDataUri = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`
  } catch {
    nailPhotoDataUri = null
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fdf7fc 0%, #f5e2f4 55%, #edd2ee 100%)",
          padding: "48px 56px",
          fontFamily: "sans-serif",
          color: "#291c2e",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: nailPhotoDataUri ? "66%" : "100%",
            height: "100%",
            paddingRight: nailPhotoDataUri ? "32px" : "0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(190, 107, 209, 0.14)",
                border: "1px solid rgba(190, 107, 209, 0.35)",
                borderRadius: "9999px",
                padding: "10px 22px",
                fontSize: "20px",
                fontWeight: 600,
                color: "#7c3291",
              }}
            >
              Granger, IN · Private Nail Studio
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                fontSize: "62px",
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                color: "#26182c",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Prettiness Nails</span>
              <span style={{ color: "#a84ec0" }}>by Amy</span>
            </div>

            <div
              style={{
                fontSize: "24px",
                lineHeight: 1.4,
                color: "#524159",
              }}
            >
              Acrylic Full Sets · Fills · Gel · Builder Gel · Pedicures
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              borderTop: "1px solid rgba(168, 78, 192, 0.2)",
              paddingTop: "18px",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: 600, color: "#3d2c44" }}>
              Serving South Bend · Mishawaka · Elkhart · Goshen
            </div>
            <div style={{ fontSize: "19px", color: "#6c5975" }}>
              51509 Bittersweet Rd, Granger, IN · Tue–Sat by Appointment
            </div>
            <div style={{ fontSize: "19px", fontWeight: 600, color: "#8e3ba6" }}>
              prettinessnails.com
            </div>
          </div>
        </div>

        {nailPhotoDataUri && (
          <div
            style={{
              display: "flex",
              width: "350px",
              height: "510px",
              borderRadius: "28px",
              overflow: "hidden",
              border: "4px solid #ffffff",
              boxShadow: "0 20px 45px rgba(84, 34, 98, 0.22)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={nailPhotoDataUri}
              alt="Custom nail art by Prettiness Nails by Amy"
              width={350}
              height={510}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>
    ),
    { ...size },
  )
}
