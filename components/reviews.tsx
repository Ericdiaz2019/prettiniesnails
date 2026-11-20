"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { testimonials } from "@/lib/testimonials"
import { fadeUp, stagger, viewportOnce } from "@/lib/motion"
import { cn } from "@/lib/utils"

export default function Reviews() {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [snapCount, setSnapCount] = useState(testimonials.length)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!api) return

    const updateState = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setSnapCount(api.scrollSnapList().length)
    }

    updateState()
    api.on("select", updateState)
    api.on("reInit", updateState)

    return () => {
      api.off("select", updateState)
      api.off("reInit", updateState)
    }
  }, [api])

  // Gentle auto-slide every 5s; pauses on hover, touch, or reduced motion
  useEffect(() => {
    if (!api || isPaused) return
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const timer = window.setInterval(() => {
      api.scrollNext()
    }, 5000)

    return () => window.clearInterval(timer)
  }, [api, isPaused])

  return (
    <section id="reviews" className="bg-muted/40 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger}
          className="text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Clients love the results.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-2 text-pretty text-sm text-muted-foreground sm:mt-3 sm:text-lg"
          >
            Real reviews from real people.
          </motion.p>
        </motion.div>

        <div
          className="mt-7 sm:mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="basis-[88%] pl-3 sm:basis-1/2 sm:pl-4 lg:basis-1/3"
                >
                  <Card className="relative h-full border-border/60 bg-card/90 shadow-sm">
                    <Quote
                      className="absolute right-4 top-4 h-5 w-5 text-primary/20 sm:h-6 sm:w-6"
                      aria-hidden
                    />
                    <CardContent className="flex h-full flex-col justify-between p-5 sm:p-6">
                      <div>
                        <div className="mb-3 flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-pretty text-sm leading-relaxed text-foreground/90 sm:text-base">
                          &ldquo;{testimonial.text}&rdquo;
                        </p>
                      </div>
                      <p className="mt-4 text-sm font-medium text-muted-foreground">
                        — {testimonial.author}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Slider controls & pagination dots */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous review"
              className="h-9 w-9 rounded-full bg-card"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Review slides">
              {Array.from({ length: snapCount }).map((_, idx) => {
                const isActive = idx === selectedIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to review ${idx + 1}`}
                    onClick={() => api?.scrollTo(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      isActive ? "w-6 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/45",
                    )}
                  />
                )
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => api?.scrollNext()}
              aria-label="Next review"
              className="h-9 w-9 rounded-full bg-card"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
