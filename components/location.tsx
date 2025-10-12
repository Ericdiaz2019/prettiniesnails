import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock } from "lucide-react"
import Image from "next/image"

const hours = [
  { day: "Monday", time: "Closed" },
  { day: "Tuesday", time: "3:00 PM - 6:30 PM" },
  { day: "Wednesday", time: "3:00 PM - 6:30 PM" },
  { day: "Thursday", time: "3:00 PM - 6:30 PM" },
  { day: "Friday", time: "9:00 AM - 6:30 PM" },
  { day: "Saturday", time: "9:00 AM - 6:30 PM" },
  { day: "Sunday", time: "By Appointment" },
]

export default function Location() {
  return (
    <section id="location" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Visit Our Studio
          </h2>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">
            Find us in Granger with easy parking right outside the studio.
          </p>
        </div>

        {/* Content Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Map */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62283.20935896798!2d-86.21624604049724!3d41.72735198216038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8816d32a319e90cb%3A0x4ce0f4a8ae67d8e0!2sPrettiness%20Nails%20by%20Amy!5e1!3m2!1sen!2sus!4v1760299539313!5m2!1sen!2sus"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                  title="Prettiness Nails by Amy location map"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Prettiness Nails</p>
                    <p className="text-muted-foreground">51509 Bittersweet Rd, Granger, IN 46530</p>
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="https://maps.apple.com/?address=51509%20Bittersweet%20Rd,Granger,IN%2046530"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Apple Maps
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="https://maps.google.com/?q=51509+Bittersweet+Rd,+Granger,+IN+46530"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Google Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hours & Contact */}
          <div className="space-y-6">
            {/* Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-xl font-semibold">Business Hours</h3>
                </div>
                <div className="space-y-2">
                  {hours.map((item) => (
                    <div key={item.day} className="flex justify-between text-sm">
                      <span className="font-medium">{item.day}</span>
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-xl font-semibold">Contact Us</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Phone / Text</p>
                    <a href="tel:+15745969371" className="text-lg text-primary hover:underline">
                      (574) 596-9371
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href="mailto:Prettiness.nails@gmail.com" className="text-primary hover:underline">
                      Prettiness.nails@gmail.com
                    </a>
                  </div>
                  <Button asChild className="w-full bg-primary text-foreground hover:bg-primary-hover">
                    <a href="sms:+15745969371">Send a Text</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
