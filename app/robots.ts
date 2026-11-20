import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/business"

const ALLOWED_PATHS = [
  "/",
  "/llms.txt",
  "/llms-full.txt",
  "/ai.txt",
  "/.well-known/business-info.json",
  "/sitemap.xml",
]

const DISALLOWED_PATHS = ["/api/"]

export default function robots(): MetadataRoute.Robots {
  const aiAndSearchAgents = [
    "Googlebot",
    "Google-Extended",
    "Bingbot",
    "Applebot",
    "Applebot-Extended",
    "DuckDuckBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "GPTBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Meta-ExternalAgent",
    "Amazonbot",
  ]

  return {
    rules: [
      {
        userAgent: "*",
        allow: ALLOWED_PATHS,
        disallow: DISALLOWED_PATHS,
      },
      ...aiAndSearchAgents.map((userAgent) => ({
        userAgent,
        allow: ALLOWED_PATHS,
        disallow: DISALLOWED_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
