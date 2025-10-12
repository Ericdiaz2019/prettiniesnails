import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"
import { Sparkles } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">Prettiness Nails</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Beautiful, long-lasting nails in South Bend & Mishawaka.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#services" className="text-muted-foreground hover:text-foreground">
                  Services
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-muted-foreground hover:text-foreground">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#reviews" className="text-muted-foreground hover:text-foreground">
                  Reviews
                </a>
              </li>
              <li>
                <a href="#booking" className="text-muted-foreground hover:text-foreground">
                  Book Now
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-semibold">Connect</h3>
            <div className="mt-3 flex gap-4">
              <a
                href="https://www.instagram.com/prettiness.nails/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.facebook.com/people/Prettiness-Nails-By-Amy/61568703693775/?mibextid=LQQJ4d"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>(574) 596-9371</p>
              <p>Prettiness.nails@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Prettiness Nails. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
