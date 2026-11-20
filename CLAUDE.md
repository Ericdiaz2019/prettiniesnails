# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server (default port 3000).
- `npm run build` — production build.
- `npm run start` — serve the production build.
- `npm run lint` — `next lint`. Note: ESLint and TypeScript errors are **ignored during `next build`** (see `next.config.mjs`), so lint must be run explicitly to surface issues.

There is no test setup in this repo.

Both `package-lock.json` and `pnpm-lock.yaml` are checked in. Pick whichever matches the lockfile you intend to use and stay consistent.

## Architecture

Single-page marketing site for **Prettiness Nails** (a nail salon in Granger, IN), generated initially via v0.app and deployed on Vercel.

- **Framework:** Next.js 15.2 App Router, React 19, TypeScript. Only one route: `app/page.tsx` renders all sections (`Hero`, `Services`, `Gallery`, `Booking`, `Reviews`, `FAQ`, `Location`) in order, plus a sticky CTA. Navigation is hash-link scrolling between sections, not separate routes.
- **Layout/SEO:** `app/layout.tsx` defines page metadata, OpenGraph/Twitter tags, and injects a `NailSalon` schema.org JSON-LD block (address, hours, geo, areaServed). When changing business info — hours, address, phone, social links — update **both** the JSON-LD in `layout.tsx` and the relevant component (`Location`, `Footer`, etc.) so structured data stays consistent with what's rendered.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with theme tokens defined as CSS custom properties in `app/globals.css` (`oklch` color space, light + dark variants). Brand palette is purple/pink — change tokens at the `:root` / `.dark` level rather than hardcoding colors in components.
- **UI primitives:** shadcn/ui (`new-york` style, `neutral` base, lucide icons) under `components/ui/`. Configured in `components.json`. Use the `cn()` helper from `lib/utils.ts` for class merging. Path alias `@/*` maps to repo root.
- **Page sections** live as one component each in `components/` (no `ui/` prefix). Most are `"use client"` because they handle smooth-scroll navigation, tab state, or carousels.
- **Data:** Testimonials live in `lib/testimonials.ts`. Services, categories, add-ons, intake forms, and availability are fetched live from the **Acuity Scheduling REST API v1** via `lib/acuity.ts` and passed from `app/page.tsx` into the unified Services & Booking section (`components/booking.tsx`).
- **Booking & Acuity API:** `components/booking.tsx` combines Services & Pricing with a native 3-step booking flow backed by Next.js Route Handlers under `app/api/acuity/` (`catalog`, `availability/dates`, `availability/times`, `appointments`) using HTTP Basic Auth (`ACUITY_USER_ID` + `ACUITY_API_KEY` kept strictly server-side in `.env` / `.env.local` / Vercel env vars). See `.env.example`.
- **Images:** `next.config.mjs` enables Next.js Image Optimization with `remotePatterns` for `**.acuityscheduling.com` and `**.squarespace-cdn.com` so Acuity service photos are resized and served in WebP/AVIF on mobile.

## Conventions worth preserving

- Section components are self-contained and use `id="..."` anchors that match the `navItems` hrefs in `components/header.tsx`. If you rename a section id, update the header nav.
- Theme provider (`components/theme-provider.tsx`) wraps `next-themes` but is not currently mounted in `layout.tsx`; the site ships light-only despite the dark-mode tokens existing.
