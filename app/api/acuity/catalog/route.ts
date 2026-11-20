import { NextResponse } from "next/server"
import { getAcuityCatalog } from "@/lib/acuity"

export const dynamic = "force-dynamic"

export async function GET() {
  const catalog = await getAcuityCatalog()

  if (!catalog.configured) {
    return NextResponse.json(catalog, { status: 503 })
  }

  if (catalog.error) {
    return NextResponse.json(catalog, { status: 502 })
  }

  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  })
}
