import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { testimonials } from "@/lib/testimonials"

export default function Reviews() {
  return (
    <section id="reviews" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Clients love the results
          </h2>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">Real reviews from real people.</p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-pretty text-muted-foreground">"{testimonial.text}"</p>

                {/* Author */}
                <p className="mt-4 font-medium text-foreground">— {testimonial.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
