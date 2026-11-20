import Header from "@/components/header"
import Hero from "@/components/hero"
import About from "@/components/about"
import Reviews from "@/components/reviews"
import Booking from "@/components/booking"
import Footer from "@/components/footer"
import StickyCTA from "@/components/sticky-cta"
import { getAcuityCatalog } from "@/lib/acuity"

export const revalidate = 120

export default async function Home() {
  const catalog = await getAcuityCatalog()

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Reviews />
        <Booking initialCatalog={catalog} />
      </main>
      <Footer />
      <StickyCTA />
    </>
  )
}
