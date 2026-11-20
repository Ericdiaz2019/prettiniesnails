import Link from "next/link"
import { Instagram, Facebook, MapPin, Sparkles } from "lucide-react"
import { BUSINESS } from "@/lib/business"

export default function Footer() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Service Area */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">{BUSINESS.name}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Licensed private nail studio in Granger, IN specializing in acrylic full sets,
              fills, gel manicures, builder gel overlays, and pedicures.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Serving Granger, South Bend, Mishawaka, Elkhart, Goshen &amp; Notre Dame.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-foreground">
                  About Amy
                </a>
              </li>
              <li>
                <a href="#reviews" className="text-muted-foreground hover:text-foreground">
                  Client Reviews
                </a>
              </li>
              <li>
                <a href="#booking" className="text-muted-foreground hover:text-foreground">
                  Services &amp; Booking
                </a>
              </li>
              <li>
                <a href="#location" className="text-muted-foreground hover:text-foreground">
                  Location &amp; Hours
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold">Studio Hours</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {BUSINESS.hoursGrouped.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span className="font-medium text-foreground">{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              By appointment only · Closed Sunday &amp; Monday
            </p>
          </div>

          {/* Location, Contact & Social */}
          <div>
            <h3 className="font-semibold">Visit &amp; Connect</h3>
            <address className="mt-3 not-italic space-y-1.5 text-sm text-muted-foreground">
              <p>
                <a
                  href={BUSINESS.maps.googlePlaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 hover:text-foreground"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{BUSINESS.address.formatted}</span>
                </a>
              </p>
              <p>
                <a href={`tel:${BUSINESS.phoneTel}`} className="hover:text-foreground">
                  {BUSINESS.phoneDisplay}
                </a>
              </p>
              <p>
                <a href={`mailto:${BUSINESS.emailLower}`} className="hover:text-foreground">
                  {BUSINESS.email}
                </a>
              </p>
            </address>

            <div className="mt-4 flex items-center gap-4">
              <a
                href={BUSINESS.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Prettiness Nails on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={BUSINESS.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Prettiness Nails by Amy on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={BUSINESS.maps.googlePlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Google Maps
              </a>
              <a
                href={BUSINESS.maps.appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Apple Maps
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground sm:text-sm">
          <p>
            &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
