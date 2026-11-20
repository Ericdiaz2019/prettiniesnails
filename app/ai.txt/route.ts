import { buildAiTxt } from "@/lib/seo"

export const revalidate = 3600

export async function GET() {
  const body = buildAiTxt()

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
