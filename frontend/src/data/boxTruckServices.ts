import type { HotShotService } from "@/types/hotShot";

export const BOX_TRUCK_SERVICES: HotShotService[] = [
  {
    slug: "16ft-box-truck",
    title: "16 ft Box Truck",
    badge: "SMALL & MEDIUM LOADS",
    shortDescription:
      "A 16 ft box truck for local moves, retail restocks and single-pallet deliveries — quick, affordable and liftgate-equipped.",
    image: "/images/BoxTruck/16-feet-box-truck/16.png",
    description: [
      "Our 16 ft box truck is the go-to choice for small and medium shipments that need to move fast without paying for space you don't use. With roughly 800 cubic feet of cargo room and a payload near 6,000 lbs, it comfortably handles apartment moves, retail restocks and multi-box deliveries across the city and region.",
      "Every 16 ft unit is liftgate-equipped for easy, dock-free loading, and paired with a professional driver who handles your freight with care. Live GPS tracking keeps you updated from pickup to delivery, so you always know exactly where your shipment is.",
      "If you need something moved today — a few pallets, furniture, or a small office relocation — the 16 ft box truck delivers the right balance of speed, capacity and cost.",
    ],
    stats: [
      { value: "16 ft", label: "Box Length" },
      { value: "~6,000 lbs", label: "Max Payload" },
      { value: "~800 cu ft", label: "Cargo Space" },
    ],
    features: [
      { icon: "bolt", title: "Fast & Agile", description: "Compact size means easier access to tight streets, docks and residential areas." },
      { icon: "truck", title: "Liftgate Equipped", description: "Hydraulic liftgate for safe, dock-free loading and unloading." },
      { icon: "location", title: "Live GPS Tracking", description: "Real-time location and ETAs from pickup to final delivery." },
      { icon: "clock", title: "Same-Day Available", description: "Book today and get your load moving within hours." },
    ],
    options: [
      { icon: "inventory", label: "01", title: "Pallet Freight", description: "Up to 4–6 standard pallets for local and regional runs." },
      { icon: "store", label: "02", title: "Retail Restock", description: "Store-to-store and DC-to-store deliveries on schedule." },
      { icon: "truck", label: "03", title: "Small Moves", description: "Apartments, single rooms and light office relocations." },
      { icon: "location", label: "04", title: "Last-Mile", description: "Final-mile delivery to homes and businesses, tracked." },
    ],
  },
  {
    slug: "26ft-box-truck",
    title: "26 ft Box Truck",
    badge: "LARGE & BULK LOADS",
    shortDescription:
      "A 26 ft box truck for full home moves, bulk freight and multi-stop distribution — maximum box truck capacity, liftgate-equipped.",
    image: "/images/BoxTruck/26-feet-box-truck/26.png",
    description: [
      "Our 26 ft box truck offers the largest capacity in the box truck class — around 1,700 cubic feet and a payload near 10,000 lbs. It's built for big jobs: full-house moves, large retail distribution, and bulk freight that would otherwise need multiple smaller trucks.",
      "Each 26 ft unit comes with a heavy-duty liftgate and an experienced driver, so even large or awkward items are loaded safely and efficiently. With one truck doing the work of two, you cut trips, save time and lower cost — all while tracking your shipment live from start to finish.",
      "When the load is large but the deadline is still tight, the 26 ft box truck moves more in a single trip, reliably and on schedule.",
    ],
    stats: [
      { value: "26 ft", label: "Box Length" },
      { value: "~10,000 lbs", label: "Max Payload" },
      { value: "~1,700 cu ft", label: "Cargo Space" },
    ],
    features: [
      { icon: "truck", title: "Maximum Capacity", description: "The largest box truck size — fewer trips, more moved per run." },
      { icon: "construction", title: "Heavy-Duty Liftgate", description: "Built to load bulky, heavy and oversized items with ease." },
      { icon: "location", title: "Live GPS Tracking", description: "Full visibility from pickup to delivery, in real time." },
      { icon: "globe", title: "Regional Reach", description: "Ideal for longer regional hauls and multi-stop routes." },
    ],
    options: [
      { icon: "truck", label: "01", title: "Full Home Moves", description: "3–4 bedroom homes moved in a single trip." },
      { icon: "inventory", label: "02", title: "Bulk Freight", description: "Up to 10–12 pallets of palletized cargo." },
      { icon: "store", label: "03", title: "Distribution", description: "Multi-stop retail and warehouse distribution runs." },
      { icon: "construction", label: "04", title: "Large Equipment", description: "Furniture, appliances and oversized commercial goods." },
    ],
  },
];

export function getBoxTruckService(slug: string) {
  return BOX_TRUCK_SERVICES.find((s) => s.slug === slug);
}