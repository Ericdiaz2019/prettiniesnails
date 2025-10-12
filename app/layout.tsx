import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import Script from "next/script"
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

export const metadata: Metadata = {
  title: "Prettiness Nails — Gel & Acrylic Nails in South Bend, Granger, Mishawaka, Elkhart & Goshen",
  description:
    "Book beautiful gel and acrylic nails at Prettiness Nails. Clean studio, simple online booking, and long-lasting designs for clients across South Bend, Granger, Mishawaka, Elkhart, and Goshen.",
  keywords: [
    "Prettiness Nails",
    "nail salon South Bend",
    "nail salon Granger",
    "nail salon Mishawaka",
    "nail salon Elkhart",
    "nail salon Goshen",
    "gel nails",
    "acrylic nails",
    "nail art",
  ],
  openGraph: {
    title: "Prettiness Nails — Gel & Acrylic Nails in Northern Indiana",
    description:
      "Clean, long-lasting gel and acrylic nails serving South Bend, Granger, Mishawaka, Elkhart, and Goshen. Reserve your appointment online.",
    type: "website",
    url: "https://prettinessnails.com/",
    siteName: "Prettiness Nails",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prettiness Nails — Gel & Acrylic Nails in Northern Indiana",
    description:
      "Book your gel or acrylic manicure with Prettiness Nails. Serving South Bend, Granger, Mishawaka, Elkhart, and Goshen.",
    site: "@prettinessnails",
  },
  alternates: {
    canonical: "/",
  },
  generator: "v0.app",
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "NailSalon",
  name: "Prettiness Nails",
  image: "https://prettinessnails.com/og-image.jpg",
  url: "https://prettinessnails.com/",
  telephone: "+1-574-596-9371",
  email: "prettiness.nails@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "51509 Bittersweet Rd",
    addressLocality: "Granger",
    addressRegion: "IN",
    postalCode: "46530",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.727352,
    longitude: -86.216246,
  },
  areaServed: [
    { "@type": "City", name: "South Bend" },
    { "@type": "City", name: "Granger" },
    { "@type": "City", name: "Mishawaka" },
    { "@type": "City", name: "Elkhart" },
    { "@type": "City", name: "Goshen" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday"],
      opens: "15:00",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday", "Saturday"],
      opens: "09:00",
      closes: "18:30",
    },
  ],
  sameAs: [
    "https://www.instagram.com/prettiness.nails/",
    "https://www.facebook.com/people/Prettiness-Nails-By-Amy/61568703693775/",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body>
        <Script id="ld-json-prettiness-nails" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(structuredData)}
        </Script>
        {children}
      </body>
    </html>
  )
}
