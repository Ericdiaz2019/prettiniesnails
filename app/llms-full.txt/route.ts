import { getAcuityCatalog } from "@/lib/acuity"
import { buildLlmsFullTxt } from "@/lib/seo"

export const revalidate = 300

export async function GET() {
  const catalog = await getAcuityCatalog()
  const body = buildLlmsFullTxt(catalog)

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  })
}
