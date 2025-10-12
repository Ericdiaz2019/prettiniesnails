import Image from "next/image"

const galleryImages = [
  { id: 1, src: "/IMG_3647.jpeg", alt: "Chrome French tips with accent glitter" },
  { id: 2, src: "/IMG_3841.jpeg", alt: "Lilac marble nails with silver foil" },
  { id: 3, src: "/IMG_4084.jpeg", alt: "Soft pink ombre gel manicure" },
  { id: 4, src: "/IMG_4202.jpeg", alt: "Neon swirl summer nail art" },
  { id: 5, src: "/IMG_5165.jpeg", alt: "Short nude nails with white detail lines" },
  { id: 6, src: "/IMG_5196.jpeg", alt: "Pastel aura nails with chrome finish" },
  { id: 7, src: "/@3233.PNG.jpg", alt: "Bold stiletto nails with abstract art" },
  { id: 8, src: "/@Prettiness.jpg", alt: "Elegant manicure on salon branding display" },
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Featured Work
          </h2>
          <p className="mt-3 text-pretty text-lg text-muted-foreground">
            See what we create for our clients every day.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {galleryImages.map((image) => (
            <div key={image.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground">
            Follow us on Instagram{" "}
            <a
              href="https://www.instagram.com/prettiness.nails/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              @prettinessnails
            </a>{" "}
            for more inspiration
          </p>
        </div>
      </div>
    </section>
  )
}
