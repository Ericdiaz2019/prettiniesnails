"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function StickyCTA() {
  const [pastHero, setPastHero] = useState(false)
  const [bookingVisible, setBookingVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setPastHero(window.scrollY > 420)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    const bookingEl = document.querySelector("#booking")
    let observer: IntersectionObserver | null = null
    if (bookingEl && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          setBookingVisible(entries.some((entry) => entry.isIntersecting))
        },
        { threshold: 0.05 },
      )
      observer.observe(bookingEl)
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer?.disconnect()
    }
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.querySelector("#booking")
    element?.scrollIntoView({ behavior: "smooth" })
  }

  if (!pastHero || bookingVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden">
      <Button
        asChild
        className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        <a href="#booking" onClick={handleClick}>
          View Services &amp; Book
        </a>
      </Button>
    </div>
  )
}
