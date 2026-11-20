# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Commands

- `npm run dev` — start the Next.js dev server (default port 3000).
- `npm run build` — production build.
- `npm run start` — serve the production build.
- `npx tsc --noEmit` — strict TypeScript check. Note: ESLint and TypeScript errors are **ignored during `next build`** (see `next.config.mjs`), so run `npx tsc --noEmit` explicitly after edits.

There is no test setup in this repo.

Both `package-lock.json` and `pnpm-lock.yaml` are checked in. Vercel installs via `pnpm`, so keep `pnpm-lock.yaml` in sync whenever `package.json` changes.

## Architecture

Single-page marketing & booking site for **Prettiness Nails by Amy** (a private nail studio in Granger, IN), deployed on Vercel at `https://prettinessnails.com`.

- **Framework:** Next.js 15.2 App Router, React 19, TypeScript. Main page `app/page.tsx` renders `Hero`, `About`, `Reviews`, `Booking` (unified Services & Booking + Studio Location/Map/Hours), `FAQ`, `Footer`, and `StickyCTA`. Navigation uses hash-link scrolling between sections.
- **Canonical Business Data & SEO:**
  - `lib/business.ts` is the **single source of truth** for business name, NAP (address, phone, email), exact coordinates, Google Maps / Apple Maps URLs, social links, service areas, hours (**Closed Sunday & Monday**, Tue–Thu 3:00 PM–6:30 PM, Fri–Sat 9:00 AM–6:30 PM), policies, and payment methods.
  - `lib/seo.ts` generates server-rendered Schema.org `@graph` JSON-LD (`NailSalon` with live Acuity `OfferCatalog`, `WebSite`, `WebPage`, `FAQPage`, `BreadcrumbList`), plus plain-text/JSON AI discovery outputs.
  - `app/layout.tsx` configures `metadataBase`, canonical URL, OpenGraph/Twitter tags, local geo tags, and `<link rel="alternate" type="text/plain">` references to `/llms.txt` and `/llms-full.txt`.
  - `app/page.tsx` injects the dynamic JSON-LD directly into SSR HTML (not `afterInteractive`) so non-JS search and AI crawlers always see full business info + live services.
  - Visual & crawler routes: `app/robots.ts` (`/robots.txt`), `app/sitemap.ts` (`/sitemap.xml`), `app/manifest.ts` (`/manifest.webmanifest`), `app/opengraph-image.tsx`, `app/icon.tsx`, `app/apple-icon.tsx`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `app/ai.txt/route.ts`, and `app/.well-known/business-info.json/route.ts`.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with theme tokens defined as CSS custom properties in `app/globals.css` (`oklch` color space, light + dark variants). Brand palette is purple/pink — change tokens at the `:root` / `.dark` level rather than hardcoding colors in components.
- **UI primitives:** shadcn/ui (`new-york` style, `neutral` base, lucide icons) under `components/ui/`. Use the `cn()` helper from `lib/utils.ts` for class merging. Path alias `@/*` maps to repo root.
- **Data:** Testimonials live in `lib/testimonials.ts`, FAQs in `lib/faqs.ts`. Services, categories, add-ons, intake forms, and availability are fetched live from the **Acuity Scheduling REST API v1** via `lib/acuity.ts` and passed from `app/page.tsx` into `components/booking.tsx`.
- **Booking & Acuity API:** `components/booking.tsx` combines Services & Pricing with a native 3-step booking flow backed by Next.js Route Handlers under `app/api/acuity/` (`catalog`, `availability/dates`, `availability/times`, `appointments`) using HTTP Basic Auth (`ACUITY_USER_ID` + `ACUITY_API_KEY` kept strictly server-side in `.env` / Vercel env vars). See `.env.example`.
- **Images:** `next.config.mjs` enables Next.js Image Optimization with `remotePatterns` for `**.acuityscheduling.com` and `**.squarespace-cdn.com` so Acuity service photos are resized and served in WebP/AVIF on mobile.

## Conventions worth preserving

- Keep business info (hours, address, phone, maps links, policies) centralized in `lib/business.ts` so UI, JSON-LD, `/llms.txt`, `/llms-full.txt`, `/ai.txt`, and `/.well-known/business-info.json` never drift out of sync.
- Section components use `id="..."` anchors that match `navItems` in `components/header.tsx` and links in `components/footer.tsx`.
- Theme provider (`components/theme-provider.tsx`) wraps `next-themes` but is not currently mounted in `layout.tsx`; the site ships light-only despite dark-mode tokens existing.
