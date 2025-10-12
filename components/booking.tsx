"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default function Booking() {
  return (
    <section id="booking" className="bg-muted py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Book an Appointment
          </h2>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">Secure your spot in seconds.</p>
        </div>

        {/* Booking Widget */}
        <div className="mt-10 overflow-hidden rounded-2xl border bg-card shadow-lg">
          <iframe
            src="https://prettinessnailsbyamyscheduling.as.me/schedule/f651deaa"
            className="h-[900px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Book an appointment"
          />
        </div>

        {/* Alternative Link */}
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <a
              href="https://prettinessnailsbyamyscheduling.as.me/schedule/f651deaa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open scheduler in new window
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
