"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Sparkles, Shield, Users } from "lucide-react"

export default function Hero() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Michiana Area
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Nails that stay gorgeous.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
          Acrylic, Gel Polish, Custom Designs, Pedicure. Only by appointment. Private Salon.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full bg-primary text-foreground hover:bg-primary-hover sm:w-auto">
            <a href="#booking" onClick={(e) => handleScroll(e, "#booking")}>
              Book Now
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
            <a href="#services" onClick={(e) => handleScroll(e, "#services")}>
              See Services
            </a>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground sm:gap-8">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Licensed</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Sanitation First</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>500+ Happy Clients</span>
          </div>
        </div>
      </div>
    </section>
  )
}
