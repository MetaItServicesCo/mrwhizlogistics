export type RentalItem = {
  slug: string;
  title: string;
  desc: string;

  // Multiple images for automatic image slider
  images: string[];

  // Small specification/highlight chips
  specs?: string[];

  // Optional pricing text
  priceHint?: string;

  // Optional CTA customization
  callLabel?: string;
  quoteLabel?: string;

  // Optional metadata for future filtering/API
  category?: string;
  availability?: "Available" | "Limited" | "On Request";
};

export const HOT_SHOT_RENTALS: RentalItem[] = [
  // ============================================================
  // 1. TRUCK & TRAILER
  // ============================================================
  {
    slug: "truck-trailer",
    title: "Truck & Trailer Rental",

    desc: "Reliable hot shot truck and trailer combinations for time-sensitive freight, equipment, materials and job-site deliveries. Flexible rental options are available for short-term and extended hauling needs.",

    images: [
      "/images/Picss/Truck&Trailer-1.jpeg",
      "/images/Picss/Truck&Trailer-2.jpeg",
            "/images/Picss/Truck&Trailer-3.jpeg",
      "/images/Picss/Truck&Trailer-4.jpeg",

    ],

    specs: [
      "Heavy-duty truck",
      "Trailer included",
      "Hot shot ready",
      "Flexible rental terms",
    ],

    priceHint: "Daily, weekly & monthly",

    callLabel: "Call Now",
    quoteLabel: "Get a Quote",

    category: "Truck & Trailer",
    availability: "Available",
  },

  // ============================================================
  // 2. SPRINTER VAN WITH LIFT GATE
  // ============================================================
  {
    slug: "sprinter-van-with-lift-gate",
    title: "Sprinter Van with Lift Gate Rental",

    desc: "Versatile Sprinter vans equipped with lift gates for efficient pickup and delivery of pallets, equipment and smaller freight. An ideal solution for urban deliveries and time-sensitive loads.",

    images: [
      "/images/Picss/Sprinter-van-with-lift-gate-1.jpeg",
      "/images/Picss/Sprinter-van-with-lift-gate-2.jpeg",
            "/images/Picss/Sprinter-van-with-lift-gate-3.jpeg",


    ],

    specs: [
      "Lift gate equipped",
      "Easy loading",
      "Urban delivery",
      "Time-sensitive freight",
    ],

    priceHint: "Flexible daily rates",

    callLabel: "Call Now",
    quoteLabel: "Get a Quote",

    category: "Sprinter Van",
    availability: "Available",
  },

  // ============================================================
  // 3. 16 FEET ENCLOSED TRAILER
  // ============================================================
  {
    slug: "16-feet-enclosed-trailer",
    title: "16 Feet Enclosed Trailer Rental",

    desc: "Compact enclosed trailers designed to keep tools, equipment and freight protected from weather, road debris and unauthorized access. Great for local hauling and smaller loads.",

    images: [
      "/images/Pics/16-Feet-Enclosed- Trailer-1.jpg",
      "/images/Pics/16-Feet-Enclosed-Trailer-2.jpeg",
        "/images/Pics/16-Feet-Enclosed-Trailer-3.jpg",

    ],

    specs: [
      "16 ft trailer",
      "Fully enclosed",
      "Weather protected",
      "Secure cargo",
    ],

    priceHint: "Short & long term",

    callLabel: "Call Now",
    quoteLabel: "Get a Quote",

    category: "Enclosed Trailer",
    availability: "Available",
  },

  // ============================================================
  // 4. 24 FEET ENCLOSED TRAILER
  // ============================================================
  {
    slug: "24-feet-enclosed-trailer",
    title: "24 Feet Enclosed Trailer Rental",

    desc: "Spacious enclosed trailers for transporting larger equipment, commercial materials, tools and general freight while keeping your cargo protected throughout the trip.",

    images: [
      "/images/Pics/24-feet enclosed Trailer-1.jpeg",
      "/images/Pics/24-feet-Enclosed Trailer.jpeg",
    "/images/Pics/24-Feet-Enclosed-Trailer-2.jpeg",
        "/images/Pics/24-Feet-Enclosed-Trailer-3.jpeg",
    "/images/Pics/24-Feet-Enclosed-Trailer-4.jpeg",


    ],

    specs: [
      "24 ft trailer",
      "Fully enclosed",
      "Weather protected",
      "Large cargo capacity",
    ],

    priceHint: "Daily & weekly plans",

    callLabel: "Call Now",
    quoteLabel: "Get a Quote",

    category: "Enclosed Trailer",
    availability: "Available",
  },

  // ============================================================
  // 5. 40 FEET FLATBED
  // ============================================================
  {
    slug: "40-feet-flatbed",
    title: "40 Feet Flatbed Rental",

    desc: "Heavy-duty 40-foot flatbed trailers designed for oversized and commercial freight including steel, lumber, machinery, construction materials and large equipment.",

    images: [
      "/images/Picss/40-feet-flatbed-1.jpeg",
      "/images/Picss/40-feet-flatbed-2.jpeg",
            "/images/Picss/40-feet-flatbed-3.jpeg",
                  "/images/Picss/40-feet-flatbed-4.jpeg",


    ],

    specs: [
      "40 ft deck",
      "Heavy-duty design",
      "Oversized freight",
      "High payload capacity",
    ],

    priceHint: "Daily, weekly & monthly",

    callLabel: "Call Now",
    quoteLabel: "Get a Quote",

    category: "Flatbed",
    availability: "Available",
  },

  // ============================================================
  // 6. 20 FEET FLATBED
  // ============================================================
  {
    slug: "20-feet-flatbed",
    title: "20 Feet Flatbed Rental",

    desc: "Versatile 20-foot flatbed trailers for construction materials, equipment, steel, lumber and general freight. A practical option when you need open-deck flexibility without a full-size trailer.",

    images: [
      "/images/Picss/20-feet-flatbed-1.jpeg",
      "/images/Picss/20-feet-flatbed-2.jpeg",
     "/images/Picss/20-feet-flatbed-3.jpeg",

    ],

    specs: [
      "20 ft deck",
      "Open-deck design",
      "Easy loading",
      "Construction ready",
    ],

    priceHint: "Flexible rental rates",

    callLabel: "Call Now",
    quoteLabel: "Get a Quote",

    category: "Flatbed",
    availability: "Available",
  },
];