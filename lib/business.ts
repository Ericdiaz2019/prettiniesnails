export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://prettinessnails.com"
).replace(/\/+$/, "")

export interface BusinessHourEntry {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday"
  shortDay: string
  opens?: string
  closes?: string
  display: string
  closed: boolean
}

export const BUSINESS = {
  name: "Prettiness Nails by Amy",
  shortName: "Prettiness Nails",
  alternateNames: [
    "Prettiness Nails",
    "Prettiness Nails by Amy",
    "Prettiness Nails Granger",
  ],
  owner: "Amy",
  ownerTitle: "Licensed Nail Technician & Owner",
  tagline: "Private Nail Studio in Granger, IN",
  description:
    "Prettiness Nails by Amy is a licensed, appointment-only private nail studio in Granger, Indiana specializing in acrylic full sets, acrylic fills, gel manicures, builder gel overlays, pedicures, and custom nail art for clients across Granger, South Bend, Mishawaka, Elkhart, and Goshen.",
  shortDescription:
    "Private nail studio in Granger, IN specializing in acrylic full sets, fills, gel manicures, builder gel overlays & pedicures. Serving South Bend, Mishawaka, Elkhart & Goshen. Book online.",
  url: SITE_URL,
  phoneDisplay: "(574) 596-9371",
  phoneE164: "+1-574-596-9371",
  phoneTel: "+15745969371",
  email: "Prettiness.nails@gmail.com",
  emailLower: "prettiness.nails@gmail.com",
  timezone: "America/New_York",
  address: {
    street: "51509 Bittersweet Rd",
    city: "Granger",
    region: "IN",
    regionName: "Indiana",
    postalCode: "46530",
    country: "US",
    formatted: "51509 Bittersweet Rd, Granger, IN 46530",
  },
  geo: {
    latitude: 41.7461062,
    longitude: -86.1113411,
  },
  maps: {
    googlePlaceCid: "5539696546983434464",
    googlePlaceUrl: "https://maps.google.com/?cid=5539696546983434464",
    googleDirectionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Prettiness+Nails+by+Amy,+51509+Bittersweet+Rd,+Granger,+IN+46530",
    appleMapsUrl:
      "https://maps.apple.com/?address=51509%20Bittersweet%20Rd,Granger,IN%2046530&q=Prettiness%20Nails%20by%20Amy",
    googleEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62283.20935896798!2d-86.21624604049724!3d41.72735198216038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8816d32a319e90cb%3A0x4ce0f4a8ae67d8e0!2sPrettiness%20Nails%20by%20Amy!5e1!3m2!1sen!2sus!4v1760299539313!5m2!1sen!2sus",
  },
  social: {
    instagram: "https://www.instagram.com/prettiness.nails/",
    instagramHandle: "@prettiness.nails",
    facebook: "https://www.facebook.com/people/Prettiness-Nails-By-Amy/61568703693775/",
  },
  serviceAreas: [
    { city: "Granger", region: "IN" },
    { city: "South Bend", region: "IN" },
    { city: "Mishawaka", region: "IN" },
    { city: "Elkhart", region: "IN" },
    { city: "Goshen", region: "IN" },
    { city: "Osceola", region: "IN" },
    { city: "Notre Dame", region: "IN" },
  ],
  hoursByDay: [
    { day: "Tuesday", shortDay: "Tue", opens: "15:00", closes: "18:30", display: "3:00 PM – 6:30 PM", closed: false },
    { day: "Wednesday", shortDay: "Wed", opens: "15:00", closes: "18:30", display: "3:00 PM – 6:30 PM", closed: false },
    { day: "Thursday", shortDay: "Thu", opens: "15:00", closes: "18:30", display: "3:00 PM – 6:30 PM", closed: false },
    { day: "Friday", shortDay: "Fri", opens: "09:00", closes: "18:30", display: "9:00 AM – 6:30 PM", closed: false },
    { day: "Saturday", shortDay: "Sat", opens: "09:00", closes: "18:30", display: "9:00 AM – 6:30 PM", closed: false },
    { day: "Sunday", shortDay: "Sun", display: "Closed", closed: true },
    { day: "Monday", shortDay: "Mon", display: "Closed", closed: true },
  ] satisfies BusinessHourEntry[],
  hoursGrouped: [
    { day: "Tue – Thu", time: "3:00 PM – 6:30 PM", closed: false },
    { day: "Fri – Sat", time: "9:00 AM – 6:30 PM", closed: false },
    { day: "Sun – Mon", time: "Closed", closed: true },
  ],
  policies: [
    "Appointment-only — no walk-ins.",
    "No extra guests, for safety and sanitation.",
    "Cancellations: please give at least 24 hours notice.",
    "Free fix within 3 days if anything lifts or chips.",
  ],
  paymentMethods: [
    "Cash",
    "Visa",
    "Mastercard",
    "American Express",
    "Discover",
    "Apple Pay",
    "Tap to Pay",
  ],
  specialties: [
    "Acrylic Full Sets",
    "Acrylic Fills",
    "Gel Manicures",
    "Builder Gel Overlays",
    "Acrylic Overlays",
    "Pedicures",
    "Custom Nail Art",
    "Nail Soak Off",
  ],
} as const
