import type { AcuityCatalog, BookingService } from "@/lib/acuity-types"
import { BUSINESS, SITE_URL } from "@/lib/business"
import { faqs } from "@/lib/faqs"
import { testimonials } from "@/lib/testimonials"

function computePriceRange(services: BookingService[]): string {
  const prices = services.map((s) => s.price).filter((p) => Number.isFinite(p) && p > 0)
  if (prices.length === 0) return "$$"
  const min = Math.floor(Math.min(...prices))
  const max = Math.ceil(Math.max(...prices))
  return `$${min} - $${max}`
}

function buildOfferCatalog(catalog: AcuityCatalog) {
  if (!catalog.services.length) return undefined

  const categories = catalog.categories.length
    ? catalog.categories
    : Array.from(new Set(catalog.services.map((s) => s.category)))

  return {
    "@type": "OfferCatalog",
    name: "Nail Services & Pricing",
    itemListElement: categories.map((category) => {
      const items = catalog.services.filter((s) => s.category === category)
      return {
        "@type": "OfferCatalog",
        name: category,
        itemListElement: items.map((service) => {
          const offer: Record<string, unknown> = {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/#booking`,
            itemOffered: {
              "@type": "Service",
              name: service.name,
              serviceType: category,
              ...(service.description ? { description: service.description } : {}),
              ...(service.image ? { image: service.image } : {}),
              provider: { "@id": `${SITE_URL}/#business` },
              areaServed: BUSINESS.serviceAreas.map((area) => `${area.city}, ${area.region}`),
            },
          }

          if (service.price > 0) {
            offer.price = service.price.toFixed(2)
            offer.priceCurrency = "USD"
          }

          return offer
        }),
      }
    }),
  }
}

export function buildStructuredData(catalog: AcuityCatalog) {
  const serviceImages = catalog.services
    .map((s) => s.image)
    .filter((img): img is string => Boolean(img))
    .slice(0, 6)

  const businessImages = [
    `${SITE_URL}/opengraph-image`,
    `${SITE_URL}/@Prettiness.jpg`,
    ...serviceImages,
  ]

  const offerCatalog = buildOfferCatalog(catalog)

  const nailSalon: Record<string, unknown> = {
    "@type": "NailSalon",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateNames,
    description: BUSINESS.description,
    url: `${SITE_URL}/`,
    image: businessImages,
    logo: `${SITE_URL}/apple-icon`,
    telephone: BUSINESS.phoneE164,
    email: BUSINESS.emailLower,
    priceRange: computePriceRange(catalog.services),
    currenciesAccepted: "USD",
    paymentAccepted: BUSINESS.paymentMethods.join(", "),
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    hasMap: BUSINESS.maps.googlePlaceUrl,
    areaServed: [
      ...BUSINESS.serviceAreas.map((area) => ({
        "@type": "City",
        name: area.city,
        containedInPlace: {
          "@type": "State",
          name: "Indiana",
        },
      })),
      {
        "@type": "AdministrativeArea",
        name: "St. Joseph County, Indiana",
      },
      {
        "@type": "AdministrativeArea",
        name: "Michiana",
      },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday"],
        opens: "15:00",
        closes: "18:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday", "Saturday"],
        opens: "09:00",
        closes: "18:30",
      },
    ],
    founder: {
      "@type": "Person",
      name: BUSINESS.owner,
      jobTitle: BUSINESS.ownerTitle,
    },
    sameAs: [
      BUSINESS.social.instagram,
      BUSINESS.social.facebook,
      BUSINESS.maps.googlePlaceUrl,
    ],
    knowsAbout: BUSINESS.specialties,
    potentialAction: {
      "@type": "ReserveAction",
      name: "Book a Nail Appointment Online",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/#booking`,
        inLanguage: "en-US",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: "Nail Studio Appointment",
      },
    },
  }

  if (offerCatalog) {
    nailSalon.hasOfferCatalog = offerCatalog
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      nailSalon,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: BUSINESS.name,
        alternateName: BUSINESS.shortName,
        description: BUSINESS.shortDescription,
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#business` },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: `${BUSINESS.name} — Nail Salon in Granger & South Bend, IN`,
        description: BUSINESS.shortDescription,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#business` },
        mainEntity: { "@id": `${SITE_URL}/#business` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/opengraph-image`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
        ],
      },
    ],
  }
}

export function buildLlmsTxt(catalog: AcuityCatalog): string {
  const serviceAreasText = BUSINESS.serviceAreas.map((a) => `${a.city}, ${a.region}`).join(", ")

  const categoryLines = catalog.categories.length
    ? catalog.categories.map((category) => {
        const items = catalog.services.filter((s) => s.category === category)
        const prices = items.map((s) => s.price).filter((p) => p > 0)
        const range =
          prices.length > 0
            ? ` ($${Math.floor(Math.min(...prices))}–$${Math.ceil(Math.max(...prices))})`
            : ""
        const sampleNames = items
          .slice(0, 4)
          .map((s) => s.name)
          .join(", ")
        return `- **${category}**${range}: ${sampleNames}${items.length > 4 ? ` (+${items.length - 4} more)` : ""}`
      })
    : BUSINESS.specialties.map((s) => `- ${s}`)

  return [
    `# ${BUSINESS.name}`,
    ``,
    `> ${BUSINESS.description}`,
    ``,
    `## Key Facts`,
    `- **Business Name:** ${BUSINESS.name} (also known as ${BUSINESS.shortName})`,
    `- **Owner / Nail Technician:** ${BUSINESS.owner} (${BUSINESS.ownerTitle})`,
    `- **Studio Type:** Licensed private nail studio (appointment-only, one-on-one service, no walk-ins)`,
    `- **Address:** ${BUSINESS.address.formatted}`,
    `- **Coordinates:** ${BUSINESS.geo.latitude}, ${BUSINESS.geo.longitude}`,
    `- **Service Area:** ${serviceAreasText} (Michiana / Northern Indiana)`,
    `- **Phone / Text:** ${BUSINESS.phoneDisplay} (${BUSINESS.phoneE164})`,
    `- **Email:** ${BUSINESS.email}`,
    `- **Website & Online Booking:** ${SITE_URL}/#booking`,
    `- **Google Maps:** ${BUSINESS.maps.googlePlaceUrl}`,
    `- **Payment Methods:** ${BUSINESS.paymentMethods.join(", ")} (pay in person at the studio; no online prepayment required for standard bookings)`,
    ``,
    `## Business Hours (${BUSINESS.timezone})`,
    ...BUSINESS.hoursByDay.map((h) => `- **${h.day}:** ${h.display}`),
    ``,
    `## Service Categories`,
    ...categoryLines,
    ``,
    `## Policies`,
    ...BUSINESS.policies.map((p) => `- ${p}`),
    ``,
    `## Site & Machine-Readable Resources`,
    `- [Home & Online Booking](${SITE_URL}/): Live services, photos, pricing, and real-time online appointment booking`,
    `- [Full AI Knowledge Base (llms-full.txt)](${SITE_URL}/llms-full.txt): Complete live service menu, pricing, durations, descriptions, FAQs, directions, and reviews`,
    `- [Structured Business Info JSON](${SITE_URL}/.well-known/business-info.json): Machine-readable JSON profile with live Acuity service catalog`,
    `- [AI Crawler Policy (ai.txt)](${SITE_URL}/ai.txt): AI search indexing and citation permissions`,
    `- [XML Sitemap](${SITE_URL}/sitemap.xml): Canonical site index`,
    `- [Google Maps Listing](${BUSINESS.maps.googlePlaceUrl}): Directions, map pin, and Google Business Profile`,
    `- [Instagram](${BUSINESS.social.instagram}): Portfolio of nail sets (${BUSINESS.social.instagramHandle})`,
    `- [Facebook](${BUSINESS.social.facebook}): Business page & updates`,
    ``,
  ].join("\n")
}

export function buildLlmsFullTxt(catalog: AcuityCatalog): string {
  const serviceAreasText = BUSINESS.serviceAreas.map((a) => `${a.city}, ${a.region}`).join(", ")

  const menuSections: string[] = []
  if (catalog.services.length > 0) {
    const categories = catalog.categories.length
      ? catalog.categories
      : Array.from(new Set(catalog.services.map((s) => s.category)))

    for (const category of categories) {
      menuSections.push(`### ${category}`)
      const items = catalog.services.filter((s) => s.category === category)
      for (const service of items) {
        const metaParts = [
          service.price > 0 ? service.priceFormatted : null,
          service.durationFormatted || null,
        ].filter(Boolean)
        const meta = metaParts.length > 0 ? ` (${metaParts.join(" · ")})` : ""
        menuSections.push(`- **${service.name}**${meta}`)
        if (service.description) {
          const cleanDesc = service.description.replace(/\s+/g, " ").trim()
          menuSections.push(`  - Details: ${cleanDesc}`)
        }
        if (service.addons.length > 0) {
          const addonList = service.addons
            .map((a) => `${a.name} (+${a.priceFormatted}${a.duration > 0 ? `, +${a.duration} min` : ""})`)
            .join("; ")
          menuSections.push(`  - Optional Add-ons: ${addonList}`)
        }
      }
      menuSections.push("")
    }
  } else {
    menuSections.push(
      `Live services include: ${BUSINESS.specialties.join(", ")}. View current pricing and availability at ${SITE_URL}/#booking.`,
      "",
    )
  }

  return [
    `# ${BUSINESS.name} — Complete Studio & Service Guide`,
    ``,
    `> ${BUSINESS.description}`,
    ``,
    `## 1. Studio Overview`,
    `${BUSINESS.name} is a licensed, sanitation-focused private nail studio operated by ${BUSINESS.owner} in Granger, Indiana. Unlike high-volume walk-in salons, every appointment is one-on-one and unhurried so each set receives precise shaping, durable structure, and clean cuticle care.`,
    ``,
    `- **Canonical Website:** ${SITE_URL}/`,
    `- **Direct Booking Section:** ${SITE_URL}/#booking`,
    `- **Phone / SMS:** ${BUSINESS.phoneDisplay} (${BUSINESS.phoneE164})`,
    `- **Email:** ${BUSINESS.email}`,
    `- **Instagram:** ${BUSINESS.social.instagram} (${BUSINESS.social.instagramHandle})`,
    `- **Facebook:** ${BUSINESS.social.facebook}`,
    ``,
    `## 2. Location, Directions & Service Area`,
    `- **Street Address:** ${BUSINESS.address.formatted}`,
    `- **Coordinates:** ${BUSINESS.geo.latitude}, ${BUSINESS.geo.longitude}`,
    `- **Parking:** Free, convenient parking right outside the studio.`,
    `- **Google Maps:** ${BUSINESS.maps.googlePlaceUrl}`,
    `- **Apple Maps:** ${BUSINESS.maps.appleMapsUrl}`,
    `- **Communities Served:** ${serviceAreasText}, St. Joseph County, and the greater Michiana region (roughly 10–25 minutes from downtown South Bend, University of Notre Dame, Mishawaka, Elkhart, and Goshen).`,
    ``,
    `## 3. Business Hours (Eastern Time — ${BUSINESS.timezone})`,
    `**Important:** Prettiness Nails by Amy is **closed on Sunday and Monday**. All visits Tuesday through Saturday are by appointment only.`,
    ``,
    ...BUSINESS.hoursByDay.map((h) => `- **${h.day}:** ${h.display}`),
    ``,
    `## 4. Complete Live Service Menu & Pricing`,
    `Prices and durations below are synced live with our booking system. Clients pay in person at the studio (${BUSINESS.paymentMethods.join(", ")}).`,
    ``,
    ...menuSections,
    `## 5. How to Book an Appointment`,
    `1. Visit ${SITE_URL}/#booking on any phone or computer.`,
    `2. Choose a service category (starting with Acrylic Full Sets, Acrylic Fills, Manicure, Overlay, Pedicure, or Soak off) and tap a service to preview photos and details.`,
    `3. Select any optional add-ons, then pick a live open date and time slot.`,
    `4. Enter your contact details and complete any short service intake questions.`,
    `5. Receive an instant confirmation email with a calendar file (.ics) and a direct reschedule/manage link.`,
    ``,
    `## 6. Studio Policies`,
    ...BUSINESS.policies.map((p) => `- ${p}`),
    ``,
    `## 7. Frequently Asked Questions`,
    ...faqs.flatMap((f) => [`### ${f.question}`, f.answer, ``]),
    `## 8. Client Reviews`,
    ...testimonials.map((t) => `- "${t.text}" — ${t.author}`),
    ``,
  ].join("\n")
}

export function buildAiTxt(): string {
  return [
    `# AI Crawler & Search Discovery Policy for ${BUSINESS.name}`,
    `# Canonical URL: ${SITE_URL}/`,
    `# Last Updated: ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `User-Agent: *`,
    `Allow: /`,
    `Allow: /llms.txt`,
    `Allow: /llms-full.txt`,
    `Allow: /.well-known/business-info.json`,
    `Allow: /sitemap.xml`,
    `Disallow: /api/`,
    ``,
    `# Explicit AI Search & Assistant Permissions`,
    `AI-Search-Indexing: allow`,
    `AI-Summarization: allow`,
    `AI-Citation: allow`,
    `AI-Local-Recommendation: allow`,
    ``,
    `# Machine-Readable Business Information`,
    `LLMs-Txt: ${SITE_URL}/llms.txt`,
    `LLMs-Full-Txt: ${SITE_URL}/llms-full.txt`,
    `Business-Info-JSON: ${SITE_URL}/.well-known/business-info.json`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ``,
    `# Quick Verified Business Summary`,
    `Business-Name: ${BUSINESS.name}`,
    `Category: Nail Salon / Private Nail Studio`,
    `Address: ${BUSINESS.address.formatted}`,
    `Geo: ${BUSINESS.geo.latitude}, ${BUSINESS.geo.longitude}`,
    `Service-Area: ${BUSINESS.serviceAreas.map((a) => `${a.city}, ${a.region}`).join("; ")}`,
    `Phone: ${BUSINESS.phoneE164}`,
    `Email: ${BUSINESS.emailLower}`,
    `Booking-URL: ${SITE_URL}/#booking`,
    `Google-Maps: ${BUSINESS.maps.googlePlaceUrl}`,
    `Hours-Open: Tue-Thu 15:00-18:30; Fri-Sat 09:00-18:30 (${BUSINESS.timezone})`,
    `Hours-Closed: Sunday, Monday`,
    `Walk-Ins: Not accepted (appointment-only)`,
    ``,
  ].join("\n")
}

export function buildBusinessInfoJson(catalog: AcuityCatalog) {
  return {
    schemaVersion: "1.0",
    updatedAt: new Date().toISOString(),
    business: {
      name: BUSINESS.name,
      shortName: BUSINESS.shortName,
      alternateNames: BUSINESS.alternateNames,
      owner: BUSINESS.owner,
      category: "NailSalon",
      description: BUSINESS.description,
      url: `${SITE_URL}/`,
      bookingUrl: `${SITE_URL}/#booking`,
      telephone: BUSINESS.phoneE164,
      telephoneDisplay: BUSINESS.phoneDisplay,
      email: BUSINESS.emailLower,
      appointmentOnly: true,
      walkInsAccepted: false,
      priceRange: computePriceRange(catalog.services),
      currency: "USD",
      paymentMethods: BUSINESS.paymentMethods,
      address: BUSINESS.address,
      geo: BUSINESS.geo,
      maps: {
        googleMaps: BUSINESS.maps.googlePlaceUrl,
        googleDirections: BUSINESS.maps.googleDirectionsUrl,
        appleMaps: BUSINESS.maps.appleMapsUrl,
      },
      serviceAreas: BUSINESS.serviceAreas.map((a) => `${a.city}, ${a.region}`),
      timezone: catalog.timezone || BUSINESS.timezone,
      hours: BUSINESS.hoursByDay.map((h) => ({
        day: h.day,
        closed: h.closed,
        opens: h.opens ?? null,
        closes: h.closes ?? null,
        display: h.display,
      })),
      closedDays: ["Sunday", "Monday"],
      social: {
        instagram: BUSINESS.social.instagram,
        facebook: BUSINESS.social.facebook,
      },
      policies: BUSINESS.policies,
    },
    services: {
      totalCount: catalog.services.length,
      categories: catalog.categories.map((category) => ({
        name: category,
        items: catalog.services
          .filter((s) => s.category === category)
          .map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description || null,
            price: s.price > 0 ? s.price : null,
            priceFormatted: s.price > 0 ? s.priceFormatted : null,
            durationMinutes: s.duration || null,
            durationFormatted: s.durationFormatted || null,
            image: s.image || null,
            addons: s.addons.map((a) => ({
              id: a.id,
              name: a.name,
              price: a.price,
              priceFormatted: a.priceFormatted,
              durationMinutes: a.duration,
            })),
          })),
      })),
    },
    faqs,
    resources: {
      llmsTxt: `${SITE_URL}/llms.txt`,
      llmsFullTxt: `${SITE_URL}/llms-full.txt`,
      aiTxt: `${SITE_URL}/ai.txt`,
      sitemap: `${SITE_URL}/sitemap.xml`,
      robots: `${SITE_URL}/robots.txt`,
    },
  }
}
