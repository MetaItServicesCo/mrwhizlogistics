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
  image_alt?: string | null;
};

export type PublicTeamMember = {
  id: number;
  name: string;
  role: string;
  image: string | null;
  image_alt?: string | null;
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

/**
 * A feature line from the dashboard: "Title | Description", or just "Title".
 * Only the first "|" separates, so a description may contain "|" itself.
 */
export function parseFeatureLine(line: string): { title: string; description: string } {
  const at = line.indexOf("|");
  if (at === -1) return { title: line.trim(), description: "" };
  return { title: line.slice(0, at).trim(), description: line.slice(at + 1).trim() };
}

export function truckCardToService(
  card: TruckCard,
  fallback?: HotShotService,
  detail = false,
): HotShotService {
  const features = card.features.map((line, index) => {
    const { title, description: written } = parseFeatureLine(line);
    const matching = fallback?.features.find((item) => item.title === title);
    const positional = fallback?.features[index];
    // The written description, else the bundled copy's for the same feature;
    // never the title again (that showed the title twice on the card).
    const known = matching?.description || (positional?.title === title ? positional.description : "");
    const description = written || (known && known !== title ? known : "");
    return {
      title,
      description,
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
    // The detail page shows its own heading; SEO fallbacks use the name.
    name: card.title,
    title: detail ? card.detail_heading || card.title : card.title,
    overviewHeading: card.overview_heading || undefined,
    badge: card.category_tag || fallback?.badge || "TRANSPORTATION SERVICE",
    image:
      (detail ? card.detail_image : null) ||
      card.card_image ||
      fallback?.image ||
      "/images/breadcumb.jpg",
    // Alt text for whichever image is shown; the service name otherwise.
    imageAlt: (detail && card.detail_image ? card.detail_image_alt : card.card_image_alt) || card.title,
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
    metaTitle: card.meta_title || undefined,
    metaDescription: card.meta_description || undefined,
    metaKeywords: card.meta_keywords || undefined,
    canonicalUrl: card.canonical_url || undefined,
  };
}

export function truckCardToGridItem(card: TruckCard) {
  return {
    n: card.card_number,
    slug: card.slug,
    title: card.title,
    desc: card.short_description,
    points: card.features.map((line) => parseFeatureLine(line).title).filter(Boolean),
    image: card.card_image,
    imageAlt: card.card_image_alt || card.title,
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
    imageAlt: (post.detail_image ? post.detail_image_alt : post.card_image_alt) || post.title,
    readTime: post.read_time,
    content: post.content_paragraphs,
    contentHtml: post.content_html || undefined,
    schemaMarkup: post.schema_markup || undefined,
    keywords: post.meta_keywords || undefined,
    metaTitle: post.meta_title || undefined,
    metaDescription: post.meta_description || undefined,
    canonicalUrl: post.canonical_url || undefined,
  };
}

export function settingsMap(settings: PublicSiteSetting[]) {
  return Object.fromEntries(settings.map((item) => [item.key, item.value || ""]));
}
