import Header from "@/components/header"
import Hero from "@/components/hero"
import Services from "@/components/services"
import Gallery from "@/components/gallery"
import Booking from "@/components/booking"
import Reviews from "@/components/reviews"
import FAQ from "@/components/faq"
import Location from "@/components/location"
import Footer from "@/components/footer"
import StickyCTA from "@/components/sticky-cta"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <Booking />
        <Reviews />
        <FAQ />
        <Location />
      </main>
      <Footer />
      <StickyCTA />
    </>
  )
}
