"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Sparkles, Clock } from "lucide-react"
import { fadeUp, stagger, viewportOnce } from "@/lib/motion"

const highlights = [
  {
    icon: Heart,
    title: "Personal attention",
    body: "One client at a time. No rushing, no double-booking.",
  },
  {
    icon: Sparkles,
    title: "Detail-obsessed",
    body: "Custom designs, precise shaping, finishes that hold up for weeks.",
  },
  {
    icon: Clock,
    title: "Respect for your time",
    body: "Appointments start when they're scheduled — and we keep them that way.",
  },
]

export default function About() {
  return (
    <section id="about" className="py-12 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger}
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16"
        >
          {/* Photo */}
          <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-[260px] sm:max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-lg ring-1 ring-border">
              {/* TODO: replace /Prettiness.jpg with Amy's portrait when ready */}
              <Image
                src="/@Prettiness.jpg"
                alt="Amy, owner of Prettiness Nails"
                fill
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover"
                priority={false}
              />
            </div>
            <div
              aria-hidden
              className="absolute -inset-2 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/30 to-transparent blur-2xl"
            />
          </motion.div>

          {/* Copy */}
          <div>
            <motion.div
              variants={fadeUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary"
            >
              Meet Amy
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              The hands behind every set.
            </motion.h2>

            {/* PLACEHOLDER BIO — swap out when Amy's copy is ready */}
            <motion.p variants={fadeUp} className="mt-5 text-pretty text-lg text-muted-foreground">
              Amy runs Prettiness Nails out of a private studio in Granger, serving clients across South Bend,
              Mishawaka, Elkhart, and Goshen. After years behind the chair, she built her own space so every
              appointment could feel calm, clean, and unhurried.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-3 text-pretty text-muted-foreground">
              Whether it's a quick gel manicure or a full set with custom art, you get her full focus — and nails
              that hold up for weeks.
            </motion.p>

            {/* Highlights */}
            <motion.ul variants={stagger} className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, body }) => (
                <motion.li
                  key={title}
                  variants={fadeUp}
                  className="rounded-2xl border bg-card p-4 shadow-sm"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
