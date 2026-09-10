export type RentalItem = {
  slug: string;
  title: string;
  desc: string;

  // Multiple images for automatic image slider
  images: string[];
  image?: string; // Fallback support

  // Small specification/highlight chips
  specs?: string[];

  // Optional pricing text
  priceHint?: string;

  // Tax & Processing fee details
  pricingIncludes?: string;

  // Detailed Specifications (Reference Screenshot fields)
  size?: string;
  capacity?: string;
  hitch?: string;
  location?: string;
  equipment?: string;
  deposit?: string;
  requirements?: string;
  minAge?: string;

  // Optional CTA customization
  callLabel?: string;
  quoteLabel?: string;

  // Optional metadata
  category?: string;
  availability?: "Available" | "Limited" | "On Request";
};

export const HOT_SHOT_RENTALS: RentalItem[] = [
  {
    slug: "16-feet-dump-trailer",
    title: "16 Feet Dump Trailer",
    desc: "Heavy-duty 16-feet dump trailers built for hauling and unloading dirt, gravel, debris, mulch and construction materials with ease. Hydraulic dump operation makes site cleanups and material drops fast and effortless.",
    images: [
      "/images/Picss/Truck&Trailer-1.jpeg",
      "/images/Picss/Truck&Trailer-2.jpeg",
      "/images/Picss/Truck&Trailer-3.jpeg",
      "/images/Picss/Truck&Trailer-4.jpeg",
    ],
    specs: [
      "16 ft dump trailer",
      "Hydraulic lift",
      "Debris & material hauling",
      "Heavy-duty build",
    ],
    priceHint: "From $80/hour",
    pricingIncludes: "All-in pricing includes 8.25% Sales Tax & 3.5% Processing Fee",
    size: "16' long x 83\" wide",
    capacity: "14,000 lb GVWR",
    hitch: "2-5/16\" ball",
    location: "Wylie, TX & Surrounding Areas",
    equipment: "Hydraulic hoist, tarp kit, ramps",
    deposit: "Credit card required",
    requirements: "Valid driver's license & current insurance",
    minAge: "21 years or older",
    category: "Dump Trailer",
    availability: "Available",
  },
  {
    slug: "53-feet-dry-van-trailer",
    title: "53 Feet Dry Van Trailer Rental",
    desc: "Full-size 53-feet dry van trailers offering maximum enclosed capacity for palletized freight, retail goods and full truckload shipments. Fully sealed to protect your cargo from weather and road conditions on long-haul and regional routes.",
    images: [
      "/images/Picss/Sprinter-van-with-lift-gate-1.jpeg",
      "/images/Picss/Sprinter-van-with-lift-gate-2.jpeg",
      "/images/Picss/Sprinter-van-with-lift-gate-3.jpeg",
    ],
    specs: [
      "53 ft enclosed",
      "Full truckload capacity",
      "Weather sealed",
      "Regional & long haul",
    ],
    priceHint: "From $120/hour",
    pricingIncludes: "All-in pricing includes 8.25% Sales Tax & 3.5% Processing Fee",
    size: "53' long x 102\" wide x 13'6\" high",
    capacity: "45,000 lb payload",
    hitch: "Standard Fifth Wheel",
    location: "Wylie, TX & Surrounding Areas",
    equipment: "Swing doors, e-track rails, translucent roof",
    deposit: "Corporate or credit card deposit",
    requirements: "Valid commercial CDL & commercial auto insurance",
    minAge: "23 years or older",
    category: "Dry Van",
    availability: "Available",
  },
  {
    slug: "16-feet-enclosed-trailer",
    title: "16 Feet Enclosed Trailer Rental",
    desc: "Compact enclosed trailers designed to keep tools, equipment and freight protected from weather, road debris and unauthorized access. A great choice for local hauling, trade work and smaller secured loads.",
    images: [
      "/images/Pics/16-Feet-Enclosed- Trailer-1.jpg",
      "/images/Pics/16-Feet-Enclosed-Trailer-2.jpeg",
      "/images/Pics/16-Feet-Enclosed-Trailer-3.jpg",
    ],
    specs: [
      "16 ft trailer",
      "Fully enclosed",
      "Weather protected",
      "Lockable & secure",
    ],
    priceHint: "From $65/hour",
    pricingIncludes: "All-in pricing includes 8.25% Sales Tax & 3.5% Processing Fee",
    size: "16' long x 84\" wide",
    capacity: "7,000 lb GVWR",
    hitch: "2-5/16\" ball",
    location: "Wylie, TX & Surrounding Areas",
    equipment: "Rear ramp door, interior LED lighting, side access door",
    deposit: "Credit card required",
    requirements: "Valid driver's license & current insurance",
    minAge: "21 years or older",
    category: "Enclosed Trailer",
    availability: "Available",
  },
  {
    slug: "24-feet-enclosed-trailer",
    title: "24 Feet Enclosed Trailer Rental",
    desc: "Spacious 24-feet enclosed trailers for transporting larger equipment, commercial materials, tools and general freight while keeping your cargo fully protected throughout the trip. Ideal for moves, trade work and bigger secured loads.",
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
    priceHint: "From $95/hour",
    pricingIncludes: "All-in pricing includes 8.25% Sales Tax & 3.5% Processing Fee",
    size: "24' long x 85\" wide",
    capacity: "10,000 lb GVWR",
    hitch: "2-5/16\" ball",
    location: "Wylie, TX & Surrounding Areas",
    equipment: "Heavy-duty ramp door, D-rings, interior lights",
    deposit: "Credit card required",
    requirements: "Valid driver's license & current insurance",
    minAge: "21 years or older",
    category: "Enclosed Trailer",
    availability: "Available",
  },
  {
    slug: "40-feet-flatbed",
    title: "40 Feet Flatbed Trailer Rental",
    desc: "Heavy-duty 40-feet flatbed trailers designed for oversized and commercial freight including steel, lumber, machinery, construction materials and large equipment. Open-deck loading from any side makes handling awkward loads simple.",
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
    priceHint: "From $110/hour",
    pricingIncludes: "All-in pricing includes 8.25% Sales Tax & 3.5% Processing Fee",
    size: "40' long x 102\" wide",
    capacity: "20,000 lb GVWR",
    hitch: "Gooseneck / Pintle Hitch",
    location: "Wylie, TX & Surrounding Areas",
    equipment: "12,000 lb winch, 8 ratchet tie-downs, stake pockets",
    deposit: "Credit card required",
    requirements: "Valid driver's license & current insurance",
    minAge: "21 years or older",
    category: "Flatbed",
    availability: "Available",
  },
  {
    slug: "20-feet-flatbed",
    title: "20 Feet Flatbed Trailer Rental",
    desc: "Versatile 20-feet flatbed trailers for construction materials, equipment, steel, lumber and general freight. A practical option when you need open-deck flexibility without committing to a full-size trailer.",
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
    priceHint: "From $75/hour",
    pricingIncludes: "All-in pricing includes 8.25% Sales Tax & 3.5% Processing Fee",
    size: "20' long x 82\" wide",
    capacity: "8,000 lb GVWR",
    hitch: "2-5/16\" ball",
    location: "Wylie, TX & Surrounding Areas",
    equipment: "12,000 lb winch, 4 ratchet tie-downs, 4 axle straps",
    deposit: "Credit card required",
    requirements: "Valid driver's license & current insurance",
    minAge: "21 years or older",
    category: "Flatbed",
    availability: "Available",
  },
  {
    slug: "16-feet-utility-trailer",
    title: "16 Feet Utility Trailer Rental",
    desc: "Practical 16-feet utility trailers for hauling equipment, landscaping gear, ATVs, furniture and general cargo. Their open, low-deck design makes loading and unloading quick and easy for everyday jobs.",
    images: [
      "/images/Picss/20-feet-flatbed-1.jpeg",
      "/images/Picss/20-feet-flatbed-2.jpeg",
      "/images/Picss/20-feet-flatbed-3.jpeg",
    ],
    specs: [
      "16 ft utility deck",
      "Open low-deck",
      "Easy load & unload",
      "Everyday hauling",
    ],
    priceHint: "From $55/hour",
    pricingIncludes: "All-in pricing includes 8.25% Sales Tax & 3.5% Processing Fee",
    size: "16' long x 77\" wide",
    capacity: "5,000 lb GVWR",
    hitch: "2\" ball",
    location: "Wylie, TX & Surrounding Areas",
    equipment: "Gate ramp, tie-down loops",
    deposit: "Credit card required",
    requirements: "Valid driver's license & current insurance",
    minAge: "21 years or older",
    category: "Utility Trailer",
    availability: "Available",
  },
];