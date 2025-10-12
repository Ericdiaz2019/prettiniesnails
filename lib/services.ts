export interface Service {
  id: string
  name: string
  category: "fills" | "full-sets" | "overlay" | "manicure" | "soak-off"
  price: string
  duration: string
  description: string
  note?: string
}

export const services: Service[] = [
  // Acrylic Fills
  {
    id: "short-fill-design",
    name: "Short Fill (Any design)",
    category: "fills",
    price: "$40",
    duration: "1h 50m",
    description: "Short acrylic fill with custom nail art designs",
    note: "I don't work on other nails techs work!!!!",
  },
  {
    id: "short-fill-no-design",
    name: "Short Fill (One color, No design)",
    category: "fills",
    price: "$40",
    duration: "1h",
    description: "Short acrylic fill with solid color polish",
    note: "I don't work on other nails techs work!!!!",
  },
  {
    id: "medium-fill-design",
    name: "Medium Fill (Any design)",
    category: "fills",
    price: "$70",
    duration: "2h",
    description: "Medium acrylic fill with custom nail art designs",
    note: "I don't work on other nails techs work!!!!",
  },
  {
    id: "medium-fill-no-design",
    name: "Medium Fill (One color, no design)",
    category: "fills",
    price: "$60",
    duration: "1h 40m",
    description: "Medium acrylic fill with solid color polish",
    note: "I don't work on other nails techs work!!!!",
  },
  {
    id: "long-fill-design",
    name: "Long Acrylic Fill (Any design)",
    category: "fills",
    price: "$90",
    duration: "3h",
    description: "Long acrylic fill with custom nail art designs",
    note: "I don't work on other nails techs work!!!!",
  },
  {
    id: "long-fill-no-design",
    name: "Long Fill (One color, No design)",
    category: "fills",
    price: "$80",
    duration: "2h",
    description: "Long acrylic fill with solid color polish",
    note: "I don't work on other nails techs work!!!!",
  },
  // Acrylic Full Sets
  {
    id: "short-full-set-no-design",
    name: "Short Acrylic Full Set (One color, No design)",
    category: "full-sets",
    price: "$50",
    duration: "1h 30m",
    description: "Complete short acrylic set with solid color polish",
    note: "Make sure to come with bare nails! If you need a soak off you can add on after making a selection of the service you want :)",
  },
  {
    id: "short-full-set-design",
    name: "Short Acrylic Full Set (Any design)",
    category: "full-sets",
    price: "$60",
    duration: "2h 30m",
    description: "Complete short acrylic set with custom nail art designs",
    note: "Make sure to come with bare nails! If you need a soak off you can add on after making a selection of the service you want :)",
  },
  {
    id: "medium-full-set-no-design",
    name: "Medium Acrylic Full Set (One color, No design)",
    category: "full-sets",
    price: "$70",
    duration: "1h 30m",
    description: "Complete medium acrylic set with solid color polish",
    note: "Make sure to come with bare nails! If you need a soak off you can add on after making a selection of the service you want :)",
  },
  {
    id: "medium-full-set-design",
    name: "Medium Acrylic Full Set (Any design)",
    category: "full-sets",
    price: "$80",
    duration: "2h 50m",
    description: "Complete medium acrylic set with custom nail art designs",
    note: "Make sure to come with bare nails! If you need a soak off you can add on after making a selection of the service you want :)",
  },
  {
    id: "long-full-set-no-design",
    name: "Long Acrylic Full Set (One color, No design)",
    category: "full-sets",
    price: "$90",
    duration: "1h 30m",
    description: "Complete long acrylic set with solid color polish",
    note: "Make sure to come with bare nails! If you need a soak off you can add on after making a selection of the service you want :)",
  },
  {
    id: "long-full-set-design",
    name: "Long Acrylic Full Set (Any design)",
    category: "full-sets",
    price: "$100",
    duration: "3h",
    description: "Complete long acrylic set with custom nail art designs",
    note: "Make sure to come with bare nails! If you need a soak off you can add on after making a selection of the service you want :)",
  },
  // Acrylic Overlay
  {
    id: "overlay-no-design",
    name: "Acrylic Overlay (One color, No design)",
    category: "overlay",
    price: "$50",
    duration: "1h 40m",
    description: "Protective acrylic overlay on natural nails with solid color polish",
  },
  {
    id: "overlay-design",
    name: "Acrylic Overlay (Any design)",
    category: "overlay",
    price: "$60",
    duration: "2h 10m",
    description: "Protective acrylic overlay on natural nails with custom nail art designs",
  },
  // Manicure
  {
    id: "mini-me-manicure",
    name: "Mini Me Manicure (Ages 3-12)",
    category: "manicure",
    price: "$35",
    duration: "45m",
    description:
      "A pampering treat for your little one! Includes gentle nail shaping, polish of their choice, and a choice of sparkle! Because mini hands deserve major love! ♥ Great for birthdays, bonding time, or just because!!",
  },
  {
    id: "gel-manicure-no-design",
    name: "Gel Manicure (One color, No design)",
    category: "manicure",
    price: "$35",
    duration: "45m",
    description: "This service includes cuticle clean up and Gel Polish, and a relaxing hand massage.",
  },
  {
    id: "gel-manicure-design",
    name: "Gel Manicure (Any design)",
    category: "manicure",
    price: "$50",
    duration: "1h 30m",
    description:
      "This service includes cuticle clean up and Gel Polish with a design of your choice, and a relaxing hand massage.",
  },
  // Soak Off
  {
    id: "acrylic-soak-off",
    name: "Acrylic Soak Off",
    category: "soak-off",
    price: "$15",
    duration: "40m",
    description: "Professional removal of acrylic nails",
  },
]
