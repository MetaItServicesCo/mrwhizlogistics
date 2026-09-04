import type { HotShotService } from "@/types/hotShot";

/* =========================================================
   SEMI TRUCK SERVICES
   Detail Page Data
========================================================= */

export const SEMI_TRUCK_SERVICES: HotShotService[] = [
  {
    slug: "reefer-truck",

    title: "Reefer Truck",

    badge: "TEMPERATURE CONTROLLED",

    shortDescription:
      "Temperature-controlled reefer transportation for food, pharmaceuticals, frozen products and other temperature-sensitive freight.",

    image: "/images/Semi-truck/reefer/r1.png",

    description: [
      "Our reefer truck service provides reliable temperature-controlled transportation for freight that requires a consistent environment throughout the journey. From food and beverages to pharmaceuticals and other temperature-sensitive products, we keep your shipment protected from pickup to delivery.",

      "Our refrigerated trailers are operated by experienced professional drivers who understand the importance of proper temperature management, careful loading and on-time delivery. Live GPS tracking keeps you informed about your shipment throughout the entire route.",

      "Whether you need regional transportation or a longer haul, our reefer trucks provide dependable capacity and temperature-controlled service for your most sensitive freight.",
    ],

    stats: [
      { value: "53 ft", label: "Trailer Length" },
      { value: "~44,000 lbs", label: "Max Payload" },
      { value: "Temp Controlled", label: "Cargo Type" },
    ],

    features: [
      {
        icon: "bolt",
        title: "Temperature Controlled",
        description:
          "Maintains the required temperature for sensitive and perishable freight.",
      },

      {
        icon: "truck",
        title: "Large Capacity",
        description:
          "Full-size refrigerated trailer capacity for commercial shipments.",
      },

      {
        icon: "location",
        title: "Live GPS Tracking",
        description:
          "Real-time location and delivery updates from pickup to destination.",
      },

      {
        icon: "clock",
        title: "Reliable Scheduling",
        description:
          "Dependable pickup and delivery scheduling for time-sensitive freight.",
      },
    ],

    options: [
      {
        icon: "inventory",
        label: "01",
        title: "Food & Beverages",
        description:
          "Temperature-controlled transportation for produce, dairy, meat, beverages and other food products.",
      },

      {
        icon: "store",
        label: "02",
        title: "Pharmaceuticals",
        description:
          "Reliable refrigerated transportation for temperature-sensitive pharmaceutical products.",
      },

      {
        icon: "bolt",
        label: "03",
        title: "Frozen Freight",
        description:
          "Safe transportation for frozen and perishable products requiring controlled temperatures.",
      },

      {
        icon: "store",
        label: "04",
        title: "Retail Distribution",
        description:
          "Scheduled refrigerated deliveries to stores, warehouses and distribution centers.",
      },
    ],
  },

  {
    slug: "dry-van",

    title: "Dry Van",

    badge: "GENERAL FREIGHT",

    shortDescription:
      "Secure enclosed dry van transportation for general freight, retail goods, palletized shipments and full truckload deliveries.",

    image: "/images/Semi-truck/dryvan/v1.png",

    description: [
      "Our dry van trucking service provides secure, enclosed transportation for general freight that needs protection from weather and outside conditions. Dry vans are ideal for palletized products, retail goods, packaged materials and a wide range of commercial shipments.",

      "With full-size trailer capacity and experienced professional drivers, we handle regional and long-distance freight while keeping your shipment protected throughout the journey. Live GPS tracking gives you visibility from pickup through final delivery.",

      "For dependable everyday freight transportation, our dry van service offers the capacity, protection and flexibility needed to keep your supply chain moving.",
    ],

    stats: [
      { value: "53 ft", label: "Trailer Length" },
      { value: "~45,000 lbs", label: "Max Payload" },
      { value: "~3,500 cu ft", label: "Cargo Space" },
    ],

    features: [
      {
        icon: "truck",
        title: "Full Trailer Capacity",
        description:
          "Large enclosed trailer space for full truckload and commercial freight.",
      },

      {
        icon: "shield",
        title: "Enclosed Protection",
        description:
          "Protects your freight from weather, road debris and outside conditions.",
      },

      {
        icon: "location",
        title: "Live GPS Tracking",
        description:
          "Real-time shipment visibility from pickup through final delivery.",
      },

      {
        icon: "globe",
        title: "Regional & Long Haul",
        description:
          "Ideal for regional routes as well as long-distance freight transportation.",
      },
    ],

    options: [
      {
        icon: "inventory",
        label: "01",
        title: "Palletized Freight",
        description:
          "Reliable transportation for palletized commercial and industrial shipments.",
      },

      {
        icon: "store",
        label: "02",
        title: "Retail Goods",
        description:
          "Secure transportation for retail inventory and store replenishment.",
      },

      {
        icon: "inventory",
        label: "03",
        title: "Manufactured Goods",
        description:
          "Enclosed transportation for packaged and manufactured products.",
      },

      {
        icon: "truck",
        label: "04",
        title: "Full Truckload",
        description:
          "Dedicated trailer capacity for larger commercial shipments.",
      },
    ],
  },

  {
    slug: "flatbed",

    title: "Flatbed",

    badge: "OVERSIZED & OPEN DECK",

    shortDescription:
      "Open-deck flatbed transportation for construction materials, machinery, steel, lumber and oversized commercial freight.",

    image: "/images/Semi-truck/flatbed/f1.png",

    description: [
      "Our flatbed trucking service is designed for freight that cannot easily fit inside a traditional enclosed trailer. The open-deck configuration provides flexible loading from the side, rear or overhead, making flatbeds ideal for oversized and difficult-to-handle freight.",

      "Flatbed transportation is commonly used for construction materials, steel, lumber, heavy machinery, equipment and other large commercial loads. Our professional drivers focus on proper load securement and safe transportation throughout the route.",

      "Whether you need regional delivery or long-distance transportation, our flatbed service provides the flexibility and capacity required for challenging commercial shipments.",
    ],

    stats: [
      { value: "48–53 ft", label: "Deck Length" },
      { value: "~48,000 lbs", label: "Max Payload" },
      { value: "Open Deck", label: "Load Type" },
    ],

    features: [
      {
        icon: "truck",
        title: "Open Deck Loading",
        description:
          "Flexible loading from the side, rear or overhead for oversized freight.",
      },

      {
        icon: "construction",
        title: "Heavy Freight",
        description:
          "Built for machinery, steel, construction materials and heavy equipment.",
      },

      {
        icon: "shield",
        title: "Secure Load Handling",
        description:
          "Professional drivers focus on proper securement and safe transportation.",
      },

      {
        icon: "location",
        title: "Live GPS Tracking",
        description:
          "Real-time shipment visibility from pickup through final destination.",
      },
    ],

    options: [
      {
        icon: "construction",
        label: "01",
        title: "Construction Materials",
        description:
          "Transportation for steel, lumber, building materials and job-site supplies.",
      },

      {
        icon: "truck",
        label: "02",
        title: "Heavy Equipment",
        description:
          "Move machinery, equipment and oversized commercial assets.",
      },

      {
        icon: "inventory",
        label: "03",
        title: "Steel & Metal",
        description:
          "Open-deck transportation for steel products, pipes and metal materials.",
      },

      {
        icon: "globe",
        label: "04",
        title: "Regional Freight",
        description:
          "Reliable flatbed transportation for regional and long-distance routes.",
      },
    ],
  },
];


/* =========================================================
   SEMI TRUCK GRID
   Main /semi-truck Page
========================================================= */

export const SEMI_TRUCK_GRID_SERVICES = [
  {
    n: "01",

    slug: "reefer-truck",

    title: "Reefer Truck",

    desc:
      "Temperature-controlled transportation for food, pharmaceuticals, frozen products and other temperature-sensitive freight.",

    points: [
      "Temperature controlled",
      "53 ft refrigerated trailer",
      "Live GPS tracking",
    ],

    image: "/images/Semi-truck/reefer/r1.png",
  },

  {
    n: "02",

    slug: "dry-van",

    title: "Dry Van",

    desc:
      "Secure enclosed transportation for general freight, retail goods, palletized shipments and full truckload deliveries.",

    points: [
      "Fully enclosed trailer",
      "Up to ~45,000 lbs payload",
      "Regional & long-haul service",
    ],

    image: "/images/Semi-truck/dryvan/v1.png",
  },

  {
    n: "03",

    slug: "flatbed",

    title: "Flatbed",

    desc:
      "Open-deck transportation for construction materials, machinery, steel, lumber and oversized commercial freight.",

    points: [
      "Open-deck loading",
      "Heavy & oversized freight",
      "Professional load securement",
    ],

    image: "/images/Semi-truck/flatbed/f1.png",
  },
];


/* =========================================================
   WHY SEMI TRUCK
========================================================= */

export const SEMI_TRUCK_FEATURES = [
  {
    icon: "truck",
    title: "Right Equipment for Every Load",
    description:
      "Reefer, dry van and flatbed options give you the right trailer for your freight.",
  },

  {
    icon: "location",
    title: "Live GPS Tracking",
    description:
      "Real-time shipment visibility from pickup through final delivery.",
  },

  {
    icon: "shield",
    title: "Professional Freight Handling",
    description:
      "Experienced drivers handle your shipment with care and attention to proper securement.",
  },

  {
    icon: "clock",
    title: "Reliable Delivery",
    description:
      "Dependable scheduling for regional and long-distance commercial freight.",
  },

  {
    icon: "route",
    title: "Regional & Long Haul",
    description:
      "Flexible transportation options for both regional and long-distance routes.",
  },

  {
    icon: "bolt",
    title: "Flexible Capacity",
    description:
      "Choose the trailer type that best matches your freight requirements.",
  },
];


/* =========================================================
   HOW IT WORKS
========================================================= */

export const SEMI_TRUCK_STEPS = [
  {
    icon: "quote",
    t: "Request & Quote",
    d:
      "Share your pickup, delivery locations, freight type and load requirements. We provide a clear quote upfront.",
  },

  {
    icon: "schedule",
    t: "Choose Your Trailer",
    d:
      "We match your shipment with the right reefer, dry van or flatbed equipment.",
  },

  {
    icon: "truck",
    t: "Freight in Transit",
    d:
      "Your shipment is picked up and transported by an experienced professional driver with live GPS tracking.",
  },

  {
    icon: "check",
    t: "Delivered & Confirmed",
    d:
      "Your freight is delivered safely and proof of delivery is captured and shared with you.",
  },
];


/* =========================================================
   GET SINGLE SEMI TRUCK SERVICE
   Used by [slug]/page.tsx
========================================================= */

export function getSemiTruckService(slug: string) {
  return SEMI_TRUCK_SERVICES.find((service) => service.slug === slug);
}