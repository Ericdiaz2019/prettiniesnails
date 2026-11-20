import type { MetadataRoute } from "next"
import { BUSINESS } from "@/lib/business"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BUSINESS.name,
    short_name: BUSINESS.shortName,
    description: BUSINESS.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#fcf8fb",
    theme_color: "#be6bd1",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
