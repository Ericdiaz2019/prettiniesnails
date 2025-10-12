"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past hero (roughly 600px)
      setIsVisible(window.scrollY > 600)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.querySelector("#booking")
    element?.scrollIntoView({ behavior: "smooth" })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <Button asChild className="w-full bg-primary text-foreground hover:bg-primary-hover" size="lg">
        <a href="#booking" onClick={handleClick}>
          Book Now
        </a>
      </Button>
    </div>
  )
}
