import type { BlogPost as ApiBlogPost, TruckCard } from "@/lib/types";
import type { BlogPost } from "@/data/blogPosts";
import type { HotShotService } from "@/types/hotShot";

export type PublicFaqCategory = {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
  faq_count: number;
  faqs: Array<{ id: number; question: string; answer: string }>;
};

export type PublicTestimonial = {
  id: number;
  quote: string;
  name: string;
  role: string | null;
  rating: number;
  initials: string | null;
  accent: string | null;
  image: string | null;
};

export type PublicTeamMember = {
  id: number;
  name: string;
  role: string;
  image: string | null;
  socials: Record<string, string>;
};

export type PublicSiteSetting = {
  id: number;
  key: string;
  value: string | null;
  label: string | null;
};

const DEFAULT_FEATURE_ICONS = [
  "truck",
  "bolt",
  "location",
  "clock",
  "inventory",
  "construction",
];

export function truckCardToService(
  card: TruckCard,
  fallback?: HotShotService,
  detail = false,
): HotShotService {
  const features = card.features.map((title, index) => {
    const matching = fallback?.features.find((item) => item.title === title);
    const positional = fallback?.features[index];
    return {
      title,
      description:
        matching?.description ||
        (positional?.title === title ? positional.description : title),
      icon:
        matching?.icon ||
        positional?.icon ||
        DEFAULT_FEATURE_ICONS[index % DEFAULT_FEATURE_ICONS.length],
    };
  });

  const stats = [
    card.trailer_length
      ? { value: card.trailer_length, label: "Trailer Length" }
      : null,
    card.max_payload ? { value: card.max_payload, label: "Max Payload" } : null,
    card.cargo_type ? { value: card.cargo_type, label: "Cargo Type" } : null,
  ].filter((item): item is { value: string; label: string } => Boolean(item));

  return {
    slug: card.slug,
    number: card.card_number,
    title: detail ? card.detail_heading || card.title : card.title,
    badge: card.category_tag || fallback?.badge || "TRANSPORTATION SERVICE",
    image:
      (detail ? card.detail_image : null) ||
      card.card_image ||
      fallback?.image ||
      "/images/breadcumb.jpg",
    shortDescription: card.short_description,
    description:
      card.detail_paragraphs.length > 0
        ? card.detail_paragraphs
        : [card.short_description],
    features,
    stats: stats.length > 0 ? stats : fallback?.stats || [],
    options: fallback?.options || [],
    // Only the detail page renders the full body; listings use the summary.
    contentHtml: detail ? card.content_html || undefined : undefined,
  };
}

export function truckCardToGridItem(card: TruckCard) {
  return {
    n: card.card_number,
    slug: card.slug,
    title: card.title,
    desc: card.short_description,
    points: card.features,
    image: card.card_image,
  };
}

export function apiBlogToView(post: ApiBlogPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.short_description,
    author: post.author_name,
    comments: post.comments_count,
    date: post.publish_date,
    category: post.category_tag,
    image: post.detail_image || post.card_image,
    readTime: post.read_time,
    content: post.content_paragraphs,
    contentHtml: post.content_html || undefined,
    schemaMarkup: post.schema_markup || undefined,
    keywords: post.meta_keywords || undefined,
  };
}

export function settingsMap(settings: PublicSiteSetting[]) {
  return Object.fromEntries(settings.map((item) => [item.key, item.value || ""]));
}
