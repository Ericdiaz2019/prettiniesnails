"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, Shield, Users } from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"

export default function Hero() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden">
      {/* Soft brand-gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.92_0.06_320/_0.6),transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Granger, IN · Private studio
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Nails that stay <span className="text-primary">gorgeous.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
          >
            Acrylic, gel polish, and custom designs by Amy. Appointment-only, so every set gets the time it deserves.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="w-full bg-primary text-foreground hover:bg-primary-hover sm:w-auto">
              <a href="#booking" onClick={(e) => handleScroll(e, "#booking")}>
                Book an Appointment
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              <a href="tel:+15745969371">Call (574) 596-9371</a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Licensed</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Sanitation first</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>500+ happy clients</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
