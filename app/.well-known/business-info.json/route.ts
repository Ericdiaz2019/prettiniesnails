import { getAcuityCatalog } from "@/lib/acuity"
import { buildBusinessInfoJson } from "@/lib/seo"

export const revalidate = 300

export async function GET() {
  const catalog = await getAcuityCatalog()
  const payload = buildBusinessInfoJson(catalog)

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
