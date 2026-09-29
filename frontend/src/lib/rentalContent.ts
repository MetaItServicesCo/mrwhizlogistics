import defaults from "@/data/rentalDefaults.json";
import type { RentalItem } from "@/data/hotShotRentals";

export const RENTAL_DEFAULTS = defaults;
export type RentalPageContent = typeof defaults.page;
export type RentalContentItem = RentalItem & {
  id?: number;
  is_active: boolean;
  sort_order: number;
  updated_at?: string | null;
  imageAlts?: string[];
  content_html?: string;
  hero_image?: string;
  meta_title?: string;
  meta_description?: string;
};

export function emptyRental(): RentalContentItem {
  return {
    slug: "", title: "", desc: "", images: [], imageAlts: [], specs: [],
    priceHint: "", pricingIncludes: "", size: "", capacity: "", hitch: "", location: "",
    equipment: "", deposit: "", requirements: "", minAge: "", category: "",
    availability: "On Request", content_html: "", hero_image: "/images/breadcumb.jpg",
    meta_title: "", meta_description: "", is_active: false, sort_order: 0,
  };
}
