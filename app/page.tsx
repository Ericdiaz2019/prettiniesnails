import Header from "@/components/header"
import Hero from "@/components/hero"
import About from "@/components/about"
import Reviews from "@/components/reviews"
import Booking from "@/components/booking"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"
import StickyCTA from "@/components/sticky-cta"
import { getAcuityCatalog } from "@/lib/acuity"
import { buildStructuredData } from "@/lib/seo"

export const revalidate = 120

export default async function Home() {
  const catalog = await getAcuityCatalog()
  const structuredData = buildStructuredData(catalog)

  return (
    <>
      <script
        id="ld-json-prettiness-nails"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main>
        <Hero />
        <About />
        <Reviews />
        <Booking initialCatalog={catalog} />
        <FAQ />
      </main>
      <Footer />
      <StickyCTA />
    </>
  )
}
