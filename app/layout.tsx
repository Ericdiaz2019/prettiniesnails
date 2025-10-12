import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
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
  title: "Prettiness Nails — Book Gel & Acrylic Nails in South Bend",
  description:
    "Simple online booking. Clean studio. Long-lasting gel & acrylic nails. See services, prices, and availability in South Bend & Mishawaka.",
  openGraph: {
    title: "Prettiness Nails — Book Gel & Acrylic Nails in South Bend",
    description: "Simple online booking. Clean studio. Long-lasting gel & acrylic nails.",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
