import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import MotionProvider from "@/components/motion-provider"
import { BUSINESS, SITE_URL } from "@/lib/business"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#be6bd1",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prettiness Nails by Amy | Nail Salon in Granger & South Bend, IN",
    template: "%s | Prettiness Nails by Amy",
  },
  description: BUSINESS.shortDescription,
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.owner, url: SITE_URL }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  category: "Beauty & Personal Care",
  keywords: [
    "Prettiness Nails",
    "Prettiness Nails by Amy",
    "nail salon Granger IN",
    "nail salon South Bend IN",
    "nail salon Mishawaka IN",
    "nail salon Elkhart IN",
    "nail salon Goshen IN",
    "private nail studio Granger",
    "acrylic full sets Granger",
    "acrylic fills South Bend",
    "gel manicure Granger IN",
    "builder gel overlay",
    "pedicure Granger IN",
    "custom nail art Michiana",
    "nail tech near Notre Dame",
    "appointment only nail salon Granger",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Prettiness Nails by Amy — Private Nail Studio in Granger, IN",
    description: BUSINESS.shortDescription,
    type: "website",
    url: `${SITE_URL}/`,
    siteName: BUSINESS.name,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Prettiness Nails by Amy — Private Nail Studio in Granger, IN serving South Bend, Mishawaka, Elkhart & Goshen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prettiness Nails by Amy — Nail Salon in Granger & South Bend, IN",
    description: BUSINESS.shortDescription,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "/",
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "LLMs.txt — AI Summary for Prettiness Nails by Amy" },
        { url: "/llms-full.txt", title: "LLMs Full — Complete Service Menu & Studio Info" },
      ],
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  other: {
    "geo.region": "US-IN",
    "geo.placename": "Granger, Indiana",
    "geo.position": `${BUSINESS.geo.latitude};${BUSINESS.geo.longitude}`,
    ICBM: `${BUSINESS.geo.latitude}, ${BUSINESS.geo.longitude}`,
    "business:contact_data:street_address": BUSINESS.address.street,
    "business:contact_data:locality": BUSINESS.address.city,
    "business:contact_data:region": BUSINESS.address.region,
    "business:contact_data:postal_code": BUSINESS.address.postalCode,
    "business:contact_data:country_name": "United States",
    "business:contact_data:phone_number": BUSINESS.phoneE164,
    "business:contact_data:website": `${SITE_URL}/`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
